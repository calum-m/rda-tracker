import { openDB } from 'idb';

// Database configuration
const DB_NAME = 'RDATrackerDB';
const DB_VERSION = 3;
const STORES = {
  PARTICIPANTS: 'participants',
  SESSIONS: 'coaching_sessions',
  SYNC_QUEUE: 'sync_queue',
  TOKENS: 'auth_tokens'
};

// Initialize IndexedDB
export const initDB = async () => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Participants store
        if (!db.objectStoreNames.contains(STORES.PARTICIPANTS)) {
          const participantsStore = db.createObjectStore(STORES.PARTICIPANTS, {
            keyPath: 'cr648_participantinformationid'
          });
          participantsStore.createIndex('firstName', 'cr648_firstname');
          participantsStore.createIndex('lastName', 'cr648_lastname');
          participantsStore.createIndex('dateOfBirth', 'cr648_dateofbirth');
          participantsStore.createIndex('lastModified', 'lastModified');
        }

        // Coaching sessions store
        if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
          const sessionsStore = db.createObjectStore(STORES.SESSIONS, {
            keyPath: 'cr648_lessonevaluationid'
          });
          sessionsStore.createIndex('date', 'cr648_date');
          sessionsStore.createIndex('participantId', 'cr648_participantid');
          sessionsStore.createIndex('lastModified', 'lastModified');
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: 'id',
            autoIncrement: true
          });
          syncStore.createIndex('timestamp', 'timestamp');
          syncStore.createIndex('type', 'type');
          syncStore.createIndex('status', 'status');
        }

        // Auth tokens store (for extended offline periods)
        if (!db.objectStoreNames.contains(STORES.TOKENS)) {
          const tokensStore = db.createObjectStore(STORES.TOKENS, {
            keyPath: 'scope'
          });
          tokensStore.createIndex('expiresAt', 'expiresAt');
        }

        // GDPR compliance stores
        if (!db.objectStoreNames.contains('consent_history')) {
          const consentHistoryStore = db.createObjectStore('consent_history', {
            keyPath: 'consentId'
          });
          consentHistoryStore.createIndex('userId', 'userId');
          consentHistoryStore.createIndex('timestamp', 'timestamp');
        }

        if (!db.objectStoreNames.contains('current_consents')) {
          const currentConsentsStore = db.createObjectStore('current_consents', {
            keyPath: 'userId'
          });
          currentConsentsStore.createIndex('lastUpdated', 'lastUpdated');
        }

        if (!db.objectStoreNames.contains('audit_logs')) {
          const auditLogsStore = db.createObjectStore('audit_logs', {
            keyPath: 'id'
          });
          auditLogsStore.createIndex('userId', 'userId');
          auditLogsStore.createIndex('timestamp', 'timestamp');
          auditLogsStore.createIndex('action', 'action');
        }
      }
    });
    console.log('IndexedDB initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    throw error;
  }
};

// Generic database operations
class OfflineStorage {
  constructor() {
    this.db = null;
    this.isOnline = navigator.onLine;
    this.setupConnectionListeners();
  }

  async init() {
    if (!this.db) {
      this.db = await initDB();
    }
    return this.db;
  }

  setupConnectionListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.triggerSync();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Participants operations
  async getParticipants() {
    await this.init();
    try {
      const tx = this.db.transaction(STORES.PARTICIPANTS, 'readonly');
      const store = tx.objectStore(STORES.PARTICIPANTS);
      return await store.getAll();
    } catch (error) {
      console.error('Error getting participants from IndexedDB:', error);
      return [];
    }
  }

  async saveParticipant(participant, isFromServer = false) {
    await this.init();
    try {
      // Add metadata for offline tracking
      const participantWithMeta = {
        ...participant,
        lastModified: Date.now(),
        isOfflineCreated: !participant.cr648_participantinformationid && !isFromServer,
        needsSync: !isFromServer
      };

      // Generate temporary ID for offline-created participants
      if (!participantWithMeta.cr648_participantinformationid) {
        participantWithMeta.cr648_participantinformationid = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      const tx = this.db.transaction(STORES.PARTICIPANTS, 'readwrite');
      const store = tx.objectStore(STORES.PARTICIPANTS);
      await store.put(participantWithMeta);

      // Add to sync queue if not from server
      if (!isFromServer) {
        await this.addToSyncQueue({
          type: 'PARTICIPANT_SAVE',
          entityId: participantWithMeta.cr648_participantinformationid,
          data: participantWithMeta,
          action: participant.cr648_participantinformationid?.startsWith('offline_') ? 'CREATE' : 'UPDATE'
        });
      }

      return participantWithMeta;
    } catch (error) {
      console.error('Error saving participant to IndexedDB:', error);
      throw error;
    }
  }

  async deleteParticipant(participantId, isFromServer = false) {
    await this.init();
    try {
      const tx = this.db.transaction(STORES.PARTICIPANTS, 'readwrite');
      const store = tx.objectStore(STORES.PARTICIPANTS);
      await store.delete(participantId);

      // Add to sync queue if not from server
      if (!isFromServer && !participantId.startsWith('offline_')) {
        await this.addToSyncQueue({
          type: 'PARTICIPANT_DELETE',
          entityId: participantId,
          action: 'DELETE'
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting participant from IndexedDB:', error);
      throw error;
    }
  }

  // Coaching sessions operations
  async getCoachingSessions() {
    await this.init();
    try {
      const tx = this.db.transaction(STORES.SESSIONS, 'readonly');
      const store = tx.objectStore(STORES.SESSIONS);
      return await store.getAll();
    } catch (error) {
      console.error('Error getting sessions from IndexedDB:', error);
      return [];
    }
  }

  async saveCoachingSession(session, isFromServer = false) {
    await this.init();
    try {
      const sessionWithMeta = {
        ...session,
        lastModified: Date.now(),
        isOfflineCreated: !session.cr648_lessonevaluationid && !isFromServer,
        needsSync: !isFromServer
      };

      if (!sessionWithMeta.cr648_lessonevaluationid) {
        sessionWithMeta.cr648_lessonevaluationid = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      const tx = this.db.transaction(STORES.SESSIONS, 'readwrite');
      const store = tx.objectStore(STORES.SESSIONS);
      await store.put(sessionWithMeta);

      if (!isFromServer) {
        await this.addToSyncQueue({
          type: 'SESSION_SAVE',
          entityId: sessionWithMeta.cr648_lessonevaluationid,
          data: sessionWithMeta,
          action: session.cr648_lessonevaluationid?.startsWith('offline_') ? 'CREATE' : 'UPDATE'
        });
      }

      return sessionWithMeta;
    } catch (error) {
      console.error('Error saving session to IndexedDB:', error);
      throw error;
    }
  }

  async deleteCoachingSession(sessionId, isFromServer = false) {
    await this.init();
    try {
      const tx = this.db.transaction(STORES.SESSIONS, 'readwrite');
      const store = tx.objectStore(STORES.SESSIONS);
      await store.delete(sessionId);

      if (!isFromServer && !sessionId.startsWith('offline_')) {
        await this.addToSyncQueue({
          type: 'SESSION_DELETE',
          entityId: sessionId,
          action: 'DELETE'
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting session from IndexedDB:', error);
      throw error;
    }
  }

  // Sync queue operations
  async addToSyncQueue(syncItem) {
    await this.init();
    try {
      const tx = this.db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      
      const queueItem = {
        ...syncItem,
        timestamp: Date.now(),
        status: 'pending',
        retryCount: 0
      };

      await store.add(queueItem);
      
      // Try to sync immediately if online
      if (this.isOnline) {
        this.triggerSync();
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  async getPendingSyncItems() {
    await this.init();
    try {
      const tx = this.db.transaction(STORES.SYNC_QUEUE, 'readonly');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      const index = store.index('status');
      return await index.getAll('pending');
    } catch (error) {
      console.error('Error getting pending sync items:', error);
      return [];
    }
  }

  async markSyncItemComplete(itemId) {
    await this.init();
    try {
      const tx = this.db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      const item = await store.get(itemId);
      
      if (item) {
        item.status = 'completed';
        item.completedAt = Date.now();
        await store.put(item);
      }
    } catch (error) {
      console.error('Error marking sync item complete:', error);
    }
  }

  async markSyncItemFailed(itemId, error) {
    await this.init();
    try {
      const tx = this.db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      const item = await store.get(itemId);
      
      if (item) {
        item.status = 'failed';
        item.retryCount = (item.retryCount || 0) + 1;
        item.lastError = error.message;
        item.lastAttempt = Date.now();
        
        // Mark as pending for retry if under retry limit
        if (item.retryCount < 3) {
          item.status = 'pending';
        }
        
        await store.put(item);
      }
    } catch (error) {
      console.error('Error marking sync item failed:', error);
    }
  }

  // Token management for extended offline periods
  async saveToken(scope, tokenData) {
    await this.init();
    try {
      const tx = this.db.transaction(STORES.TOKENS, 'readwrite');
      const store = tx.objectStore(STORES.TOKENS);
      
      const tokenRecord = {
        scope,
        accessToken: tokenData.accessToken,
        expiresAt: Date.now() + (tokenData.expiresIn * 1000),
        savedAt: Date.now()
      };
      
      await store.put(tokenRecord);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  async getValidToken(scope) {
    await this.init();
    try {
      const tx = this.db.transaction(STORES.TOKENS, 'readonly');
      const store = tx.objectStore(STORES.TOKENS);
      const tokenRecord = await store.get(scope);
      
      if (tokenRecord && tokenRecord.expiresAt > Date.now()) {
        return tokenRecord.accessToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Cleanup old data
  async cleanup() {
    await this.init();
    try {
      // Remove completed sync items older than 7 days
      const tx = this.db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      const cutoffDate = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      const items = await store.getAll();
      for (const item of items) {
        if (item.status === 'completed' && item.completedAt < cutoffDate) {
          await store.delete(item.id);
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Trigger sync (to be implemented with actual sync logic)
  triggerSync() {
    // This will be called by the sync service
    if (window.syncService) {
      window.syncService.performSync();
    }
  }

  // Batch save operations for API responses
  async saveParticipants(participants, isFromServer = true) {
    if (!Array.isArray(participants)) return;
    
    for (const participant of participants) {
      await this.saveParticipant(participant, isFromServer);
    }
  }

  async saveCoachingSessions(sessions, isFromServer = true) {
    if (!Array.isArray(sessions)) return;
    
    for (const session of sessions) {
      await this.saveCoachingSession(session, isFromServer);
    }
  }

  // Get sync status for UI
  async getSyncStatus() {
    const pendingItems = await this.getPendingSyncItems();
    return {
      isOnline: this.isOnline,
      pendingCount: pendingItems.length,
      hasPendingChanges: pendingItems.length > 0
    };
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();
export default offlineStorage;