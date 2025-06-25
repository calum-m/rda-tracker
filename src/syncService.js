import { offlineStorage } from './offlineStorage';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncListeners = [];
    this.dataverseBaseUrl = process.env.REACT_APP_DATAVERSE_URL;
  }

  // Initialize sync service with MSAL instance
  init(msalInstance) {
    this.msalInstance = msalInstance;
    window.syncService = this; // Make available globally for offline storage
  }

  // Add listener for sync status updates
  addSyncListener(callback) {
    this.syncListeners.push(callback);
  }

  removeSyncListener(callback) {
    this.syncListeners = this.syncListeners.filter(listener => listener !== callback);
  }

  notifyListeners(status) {
    this.syncListeners.forEach(listener => listener(status));
  }

  // Get Dataverse token using MSAL
  async getDataverseToken() {
    if (!this.msalInstance) {
      console.error('MSAL instance not initialized');
      return null;
    }

    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      console.error('No accounts found');
      return null;
    }

    const account = accounts[0];
    const dataverseRequest = {
      scopes: [process.env.REACT_APP_DATAVERSE_SCOPE || "https://orgdbcfb9bc.crm11.dynamics.com/.default"].filter(scope => scope),
      account: account,
    };

    try {
      const tokenResponse = await this.msalInstance.acquireTokenSilent(dataverseRequest);
      
      // Save token for offline use
      await offlineStorage.saveToken(
        process.env.REACT_APP_DATAVERSE_SCOPE,
        {
          accessToken: tokenResponse.accessToken,
          expiresIn: tokenResponse.expiresOn ? 
            Math.floor((tokenResponse.expiresOn.getTime() - Date.now()) / 1000) : 3600
        }
      );
      
      return tokenResponse.accessToken;
    } catch (error) {
      console.error('Token acquisition error:', error);
      
      // Try to get saved token for offline scenarios
      const savedToken = await offlineStorage.getValidToken(process.env.REACT_APP_DATAVERSE_SCOPE);
      if (savedToken) {
        console.log('Using saved token for offline operation');
        return savedToken;
      }
      
      return null;
    }
  }

  // Perform full sync
  async performSync() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return { success: false, message: 'Sync already in progress' };
    }

    if (!navigator.onLine) {
      console.log('Device is offline, skipping sync');
      return { success: false, message: 'Device is offline' };
    }

    if (!this.msalInstance) {
      console.error('MSAL instance not initialized, cannot sync');
      return { success: false, message: 'MSAL instance not initialized' };
    }

    this.isSyncing = true;
    this.lastSyncAttempt = new Date();
    this.notifyListeners({ isOnline: true, isSyncing: true, pendingCount: 0 });

    try {
      console.log('Starting sync process...');
      
      // Get pending items count for logging
      const pendingItems = await offlineStorage.getPendingSyncItems();
      console.log(`Found ${pendingItems.length} pending items to sync`);
      
      // Step 1: Download latest data from server
      console.log('Step 1: Downloading latest data from server...');
      await this.downloadLatestData();
      
      // Step 2: Upload pending changes
      console.log('Step 2: Uploading pending changes...');
      await this.uploadPendingChanges();
      
      console.log('Sync completed successfully');
      return { success: true, message: 'Sync completed successfully' };
      
    } catch (error) {
      console.error('Sync failed:', error);
      return { success: false, message: `Sync failed: ${error.message}`, error };
    } finally {
      this.isSyncing = false;
      try {
        const syncStatus = await offlineStorage.getSyncStatus();
        this.notifyListeners({ ...syncStatus, isSyncing: false });
      } catch (statusError) {
        console.error('Failed to get sync status after sync:', statusError);
        this.notifyListeners({ isOnline: navigator.onLine, isSyncing: false, pendingCount: 0 });
      }
    }
  }

  // Download latest data from Dataverse
  async downloadLatestData() {
    const token = await this.getDataverseToken();
    if (!token) {
      throw new Error('Unable to acquire token for data download');
    }

    // Download participants
    try {
      const participantsResponse = await fetch(
        `${this.dataverseBaseUrl}/api/data/v9.2/cr648_participantinformationsrmations?$select=cr648_participantinformationsrmationId,cr648_firstname,cr648_lastname,cr648_dateofbirth,cr648_emailaddress,cr648_phonenumber`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            Accept: "application/json",
          },
        }
      );

      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json();
        
        // Save to local storage with server flag
        for (const participant of participantsData.value) {
          await offlineStorage.saveParticipant(participant, true);
        }
        
        console.log(`Downloaded ${participantsData.value.length} participants`);
      }
    } catch (error) {
      console.error('Error downloading participants:', error);
    }

    // Download coaching sessions
    try {
      const sessionsResponse = await fetch(
        `${this.dataverseBaseUrl}/api/data/v9.2/cr648_lessonevaluations?$select=cr648_lessonevaluationid,cr648_date,cr648_lessonplan,cr648_participantevaluation,cr648_coachname,cr648_participantid,cr648_notes`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            Accept: "application/json",
          },
        }
      );

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        
        // Save to local storage with server flag
        for (const session of sessionsData.value) {
          await offlineStorage.saveCoachingSession(session, true);
        }
        
        console.log(`Downloaded ${sessionsData.value.length} sessions`);
      }
    } catch (error) {
      console.error('Error downloading sessions:', error);
    }
  }

  // Upload pending changes to Dataverse
  async uploadPendingChanges() {
    const pendingItems = await offlineStorage.getPendingSyncItems();
    const token = await this.getDataverseToken();
    
    if (!token) {
      throw new Error('Unable to acquire token for data upload');
    }

    console.log(`Uploading ${pendingItems.length} pending changes`);

    for (const item of pendingItems) {
      try {
        await this.processSyncItem(item, token);
        await offlineStorage.markSyncItemComplete(item.id);
      } catch (error) {
        console.error(`Error processing sync item ${item.id}:`, error);
        await offlineStorage.markSyncItemFailed(item.id, error);
      }
    }
  }

  // Process individual sync item
  async processSyncItem(item, token) {
    switch (item.type) {
      case 'PARTICIPANT_SAVE':
        await this.syncParticipant(item, token);
        break;
      case 'PARTICIPANT_DELETE':
        await this.syncParticipantDelete(item, token);
        break;
      case 'SESSION_SAVE':
        await this.syncSession(item, token);
        break;
      case 'SESSION_DELETE':
        await this.syncSessionDelete(item, token);
        break;
      default:
        console.warn(`Unknown sync item type: ${item.type}`);
    }
  }

  // Sync participant to Dataverse
  async syncParticipant(item, token) {
    const { data, action } = item;
    let url, method, body;

    if (action === 'CREATE' || data.isOfflineCreated) {
      // Create new participant
      url = `${this.dataverseBaseUrl}/api/data/v9.2/cr648_participantinformations`;
      method = 'POST';
      
      // Remove offline metadata and temporary ID
      const cleanData = { ...data };
      delete cleanData.cr648_participantinformationId;
      delete cleanData.lastModified;
      delete cleanData.isOfflineCreated;
      delete cleanData.needsSync;
      
      body = JSON.stringify(cleanData);
    } else {
      // Update existing participant
      url = `${this.dataverseBaseUrl}/api/data/v9.2/cr648_participantinformations(${data.cr648_participantinformationId})`;
      method = 'PATCH';
      
      // Remove metadata for update
      const cleanData = { ...data };
      delete cleanData.cr648_participantinformationId;
      delete cleanData.lastModified;
      delete cleanData.isOfflineCreated;
      delete cleanData.needsSync;
      
      body = JSON.stringify(cleanData);
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        Accept: "application/json",
      },
      body
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // If it was a CREATE, get the new ID and update local storage
    if (action === 'CREATE' || data.isOfflineCreated) {
      const locationHeader = response.headers.get('OData-EntityId');
      if (locationHeader) {
        const newIdMatch = locationHeader.match(/\(([^)]+)\)/);
        if (newIdMatch) {
          const newId = newIdMatch[1];
          
          // Update local storage with server ID
          const updatedData = { ...data, cr648_participantinformationId: newId };
          delete updatedData.isOfflineCreated;
          delete updatedData.needsSync;
          
          await offlineStorage.saveParticipant(updatedData, true);
          
          // Remove old offline record
          if (data.cr648_participantinformationId.startsWith('offline_')) {
            await offlineStorage.deleteParticipant(data.cr648_participantinformationId, true);
          }
        }
      }
    }
  }

  // Sync participant deletion
  async syncParticipantDelete(item, token) {
    const response = await fetch(
      `${this.dataverseBaseUrl}/api/data/v9.2/cr648_participantinformations(${item.entityId})`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }

  // Sync session to Dataverse
  async syncSession(item, token) {
    const { data, action } = item;
    let url, method, body;

    if (action === 'CREATE' || data.isOfflineCreated) {
      url = `${this.dataverseBaseUrl}/api/data/v9.2/cr648_lessonevaluations`;
      method = 'POST';
      
      const cleanData = { ...data };
      delete cleanData.cr648_lessonevaluationid;
      delete cleanData.lastModified;
      delete cleanData.isOfflineCreated;
      delete cleanData.needsSync;
      
      body = JSON.stringify(cleanData);
    } else {
      url = `${this.dataverseBaseUrl}/api/data/v9.2/cr648_lessonevaluations(${data.cr648_lessonevaluationid})`;
      method = 'PATCH';
      
      const cleanData = { ...data };
      delete cleanData.cr648_lessonevaluationid;
      delete cleanData.lastModified;
      delete cleanData.isOfflineCreated;
      delete cleanData.needsSync;
      
      body = JSON.stringify(cleanData);
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        Accept: "application/json",
      },
      body
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Handle CREATE response similar to participant
    if (action === 'CREATE' || data.isOfflineCreated) {
      const locationHeader = response.headers.get('OData-EntityId');
      if (locationHeader) {
        const newIdMatch = locationHeader.match(/\(([^)]+)\)/);
        if (newIdMatch) {
          const newId = newIdMatch[1];
          
          const updatedData = { ...data, cr648_lessonevaluationid: newId };
          delete updatedData.isOfflineCreated;
          delete updatedData.needsSync;
          
          await offlineStorage.saveCoachingSession(updatedData, true);
          
          if (data.cr648_lessonevaluationid.startsWith('offline_')) {
            await offlineStorage.deleteCoachingSession(data.cr648_lessonevaluationid, true);
          }
        }
      }
    }
  }

  // Sync session deletion
  async syncSessionDelete(item, token) {
    const response = await fetch(
      `${this.dataverseBaseUrl}/api/data/v9.2/cr648_lessonevaluations(${item.entityId})`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }

  // Manual sync trigger
  async forcSync() {
    console.log('Manual sync triggered');
    await this.performSync();
  }

  // Get sync statistics
  async getSyncStats() {
    const pendingItems = await offlineStorage.getPendingSyncItems();
    const status = await offlineStorage.getSyncStatus();
    
    return {
      ...status,
      isSyncing: this.isSyncing,
      lastSyncAttempt: this.lastSyncAttempt || null,
      pendingItems: pendingItems.map(item => ({
        type: item.type,
        action: item.action,
        timestamp: item.timestamp,
        retryCount: item.retryCount || 0
      }))
    };
  }
}

// Export singleton instance
export const syncService = new SyncService();
export default syncService;