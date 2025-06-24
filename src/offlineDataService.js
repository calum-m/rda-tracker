import { offlineStorage } from './offlineStorage';
import { syncService } from './syncService';

// Offline-first data service that abstracts storage and sync logic
class OfflineDataService {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    if (!this.isInitialized) {
      await offlineStorage.init();
      this.isInitialized = true;
    }
  }

  // Participants API
  async getParticipants() {
    await this.init();
    
    if (navigator.onLine) {
      try {
        // Try to sync latest data first if online
        await syncService.downloadLatestData();
      } catch (error) {
        console.log('Failed to download latest data, using local data:', error);
      }
    }
    
    // Always return local data (which is now up-to-date if sync succeeded)
    return await offlineStorage.getParticipants();
  }

  async saveParticipant(participant) {
    await this.init();
    
    // Always save locally first
    const savedParticipant = await offlineStorage.saveParticipant(participant);
    
    // Try immediate sync if online
    if (navigator.onLine) {
      try {
        // Trigger background sync
        syncService.performSync();
      } catch (error) {
        console.log('Background sync failed, will retry later:', error);
      }
    }
    
    return savedParticipant;
  }

  async deleteParticipant(participantId) {
    await this.init();
    
    // Always delete locally first
    const result = await offlineStorage.deleteParticipant(participantId);
    
    // Try immediate sync if online
    if (navigator.onLine) {
      try {
        syncService.performSync();
      } catch (error) {
        console.log('Background sync failed, will retry later:', error);
      }
    }
    
    return result;
  }

  // Coaching Sessions API
  async getCoachingSessions() {
    await this.init();
    
    if (navigator.onLine) {
      try {
        await syncService.downloadLatestData();
      } catch (error) {
        console.log('Failed to download latest data, using local data:', error);
      }
    }
    
    return await offlineStorage.getCoachingSessions();
  }

  async saveCoachingSession(session) {
    await this.init();
    
    const savedSession = await offlineStorage.saveCoachingSession(session);
    
    if (navigator.onLine) {
      try {
        syncService.performSync();
      } catch (error) {
        console.log('Background sync failed, will retry later:', error);
      }
    }
    
    return savedSession;
  }

  async deleteCoachingSession(sessionId) {
    await this.init();
    
    const result = await offlineStorage.deleteCoachingSession(sessionId);
    
    if (navigator.onLine) {
      try {
        syncService.performSync();
      } catch (error) {
        console.log('Background sync failed, will retry later:', error);
      }
    }
    
    return result;
  }

  // Legacy API compatibility layer
  // These methods maintain compatibility with existing component code

  async fetchParticipantsFromDataverse(token, dataverseBaseUrl) {
    // This method is called by existing components
    // We'll redirect to our offline-first approach
    console.log('Redirecting to offline-first participant fetch');
    return await this.getParticipants();
  }

  async saveParticipantToDataverse(participant, token, dataverseBaseUrl) {
    console.log('Redirecting to offline-first participant save');
    return await this.saveParticipant(participant);
  }

  async deleteParticipantFromDataverse(participantId, token, dataverseBaseUrl) {
    console.log('Redirecting to offline-first participant delete');
    return await this.deleteParticipant(participantId);
  }

  async fetchSessionsFromDataverse(token, dataverseBaseUrl) {
    console.log('Redirecting to offline-first sessions fetch');
    return await this.getCoachingSessions();
  }

  async saveSessionToDataverse(session, token, dataverseBaseUrl) {
    console.log('Redirecting to offline-first session save');
    return await this.saveCoachingSession(session);
  }

  async deleteSessionFromDataverse(sessionId, token, dataverseBaseUrl) {
    console.log('Redirecting to offline-first session delete');
    return await this.deleteCoachingSession(sessionId);
  }

  // Utility methods
  async isOnline() {
    return navigator.onLine;
  }

  async getSyncStatus() {
    return await offlineStorage.getSyncStatus();
  }

  async forcSync() {
    if (navigator.onLine) {
      return await syncService.forcSync();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  // Data transformation helpers for legacy compatibility
  transformParticipantsForLegacyAPI(participants) {
    // Transform offline storage format to match expected API response format
    return {
      value: participants.filter(p => p && p.cr648_new_participantinfoid),
      '@odata.context': 'offline'
    };
  }

  transformSessionsForLegacyAPI(sessions) {
    return {
      value: sessions.filter(s => s && s.cr648_new_lessonevaluationid),
      '@odata.context': 'offline'
    };
  }

  // Migration helper - convert online API responses to offline format
  async migrateFromOnlineAPI(participants, sessions) {
    await this.init();
    
    // Migrate participants
    if (participants && participants.value) {
      for (const participant of participants.value) {
        await offlineStorage.saveParticipant(participant, true); // Mark as from server
      }
    }
    
    // Migrate sessions
    if (sessions && sessions.value) {
      for (const session of sessions.value) {
        await offlineStorage.saveCoachingSession(session, true); // Mark as from server
      }
    }
    
    console.log('Migration to offline storage completed');
  }

  // Cleanup old data
  async cleanup() {
    await offlineStorage.cleanup();
  }
}

// Export singleton instance
export const offlineDataService = new OfflineDataService();
export default offlineDataService;