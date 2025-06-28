// Offline storage utilities for RDA Tracker
// Handles IndexedDB operations for offline data persistence

const DB_NAME = 'rdaTrackerDB';
const DB_VERSION = 3;
const STORES = {
  COACHING_SESSIONS: 'coachingSessions',
  PARTICIPANTS: 'participants',
  PENDING_OPERATIONS: 'pendingOperations'
};

class OfflineStorage {
  constructor() {
    this.db = null;
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.triggerSync();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Coaching sessions store
        if (!db.objectStoreNames.contains(STORES.COACHING_SESSIONS)) {
          const sessionStore = db.createObjectStore(STORES.COACHING_SESSIONS, { 
            keyPath: 'cr648_lessonevaluationid' 
          });
          sessionStore.createIndex('date', 'cr648_date');
          sessionStore.createIndex('coachName', 'cr648_coachname');
        }
        
        // Participants store
        if (!db.objectStoreNames.contains(STORES.PARTICIPANTS)) {
          const participantStore = db.createObjectStore(STORES.PARTICIPANTS, { 
            keyPath: 'cr648_participantinformationid' 
          });
          participantStore.createIndex('lastName', 'cr648_lastname');
          participantStore.createIndex('firstName', 'cr648_firstname');
        }
        
        // Pending operations store
        if (!db.objectStoreNames.contains(STORES.PENDING_OPERATIONS)) {
          db.createObjectStore(STORES.PENDING_OPERATIONS, { 
            keyPath: 'id',
            autoIncrement: true 
          });
        }
      };
    });
  }

  // Generic methods for data operations
  async saveData(storeName, data) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    if (Array.isArray(data)) {
      for (const item of data) {
        await store.put(item);
      }
    } else {
      await store.put(data);
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getData(storeName, key = null) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = key ? store.get(key) : store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteData(storeName, key) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Coaching sessions specific methods
  async saveCoachingSessions(sessions) {
    return this.saveData(STORES.COACHING_SESSIONS, sessions);
  }

  async getCoachingSessions() {
    return this.getData(STORES.COACHING_SESSIONS);
  }

  async saveCoachingSession(session) {
    return this.saveData(STORES.COACHING_SESSIONS, session);
  }

  async deleteCoachingSession(sessionId) {
    return this.deleteData(STORES.COACHING_SESSIONS, sessionId);
  }

  // Participants specific methods
  async saveParticipants(participants) {
    return this.saveData(STORES.PARTICIPANTS, participants);
  }

  async getParticipants() {
    return this.getData(STORES.PARTICIPANTS);
  }

  async saveParticipant(participant) {
    return this.saveData(STORES.PARTICIPANTS, participant);
  }

  async deleteParticipant(participantId) {
    return this.deleteData(STORES.PARTICIPANTS, participantId);
  }

  // Pending operations queue
  async queueOperation(operation) {
    const pendingOp = {
      ...operation,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([STORES.PENDING_OPERATIONS], 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_OPERATIONS);
    
    return new Promise((resolve, reject) => {
      const request = store.add(pendingOp);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingOperations() {
    return this.getData(STORES.PENDING_OPERATIONS);
  }

  async removePendingOperation(id) {
    return this.deleteData(STORES.PENDING_OPERATIONS, id);
  }

  // Sync operations when back online
  async triggerSync() {
    if (this.syncInProgress || !this.isOnline) return;
    
    this.syncInProgress = true;
    
    try {
      const pendingOps = await this.getPendingOperations();
      console.log('Syncing pending operations:', pendingOps.length);
      
      // Notify app about sync status
      window.dispatchEvent(new CustomEvent('sync-status', { 
        detail: { status: 'started', operations: pendingOps.length } 
      }));

      for (const op of pendingOps) {
        try {
          await this.executePendingOperation(op);
          await this.removePendingOperation(op.id);
        } catch (error) {
          console.error('Failed to sync operation:', op, error);
          // Could implement retry logic here
        }
      }

      window.dispatchEvent(new CustomEvent('sync-status', { 
        detail: { status: 'completed' } 
      }));
      
    } catch (error) {
      console.error('Sync failed:', error);
      window.dispatchEvent(new CustomEvent('sync-status', { 
        detail: { status: 'failed', error: error.message } 
      }));
    } finally {
      this.syncInProgress = false;
    }
  }

  async executePendingOperation(operation) {
    // This would need to be implemented with actual API calls
    // For now, just a placeholder
    console.log('Executing pending operation:', operation);
    throw new Error('Sync execution not implemented - needs API integration');
  }

  // Utility methods
  getNetworkStatus() {
    return this.isOnline;
  }

  async clearAllData() {
    if (!this.db) await this.init();
    
    const storeNames = Object.values(STORES);
    const transaction = this.db.transaction(storeNames, 'readwrite');
    
    for (const storeName of storeNames) {
      const store = transaction.objectStore(storeName);
      store.clear();
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();

export default offlineStorage;