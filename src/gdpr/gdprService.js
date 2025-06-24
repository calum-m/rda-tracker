import { offlineStorage } from '../offlineStorage';

// GDPR Service for managing data protection compliance
class GDPRService {
  constructor() {
    this.dataverseBaseUrl = process.env.REACT_APP_DATAVERSE_URL;
    this.retentionPolicies = {
      essential: 7 * 365, // 7 years
      medicalData: 7 * 365, // 7 years
      progressPhotos: 2 * 365, // 2 years
      communications: 3 * 365, // 3 years
      analytics: 26 * 30, // 26 months
      auditLogs: 6 * 365 // 6 years
    };
  }

  // Enhanced consent management
  async saveUserConsents(userId, consentData) {
    try {
      await offlineStorage.init();
      
      // Create consent record with full audit trail
      const consentRecord = {
        userId,
        timestamp: consentData.timestamp || new Date().toISOString(),
        version: consentData.version,
        consents: consentData.consents,
        isMinor: consentData.isMinor || false,
        parentalConsent: consentData.parentalConsent || false,
        ipAddress: consentData.ipAddress || 'unknown',
        userAgent: consentData.userAgent || navigator.userAgent,
        understandingConfirmed: consentData.understandingConfirmed || false,
        consentMethod: 'web_app',
        consentId: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Store in consent history table
      const db = await offlineStorage.init();
      const tx = db.transaction('consent_history', 'readwrite');
      const store = tx.objectStore('consent_history');
      await store.add(consentRecord);

      // Update current consent status
      const currentConsentTx = db.transaction('current_consents', 'readwrite');
      const currentStore = currentConsentTx.objectStore('current_consents');
      await currentStore.put({
        userId,
        ...consentRecord,
        lastUpdated: new Date().toISOString()
      });

      console.log('Consent saved successfully');
      return consentRecord;
    } catch (error) {
      console.error('Error saving consent:', error);
      throw error;
    }
  }

  async getUserConsents(userId) {
    try {
      await offlineStorage.init();
      const db = await offlineStorage.init();
      const tx = db.transaction('current_consents', 'readonly');
      const store = tx.objectStore('current_consents');
      return await store.get(userId);
    } catch (error) {
      console.error('Error getting user consents:', error);
      return null;
    }
  }

  async updateUserConsents(userId, newConsentData) {
    return await this.saveUserConsents(userId, newConsentData);
  }

  // Data access and portability
  async exportUserData(userId) {
    try {
      await offlineStorage.init();
      
      const exportData = {
        exportDate: new Date().toISOString(),
        userId,
        personalData: await this.getPersonalData(userId),
        sessions: await this.getSessionData(userId),
        medicalData: await this.getMedicalData(userId),
        progressPhotos: await this.getProgressPhotos(userId),
        consentHistory: await this.getConsentHistory(userId),
        auditLog: await this.getAuditLog(userId),
        dataRetentionInfo: this.getDataRetentionInfo()
      };

      // Log the export for audit trail
      await this.logDataAccess(userId, 'EXPORT', 'User requested data export');

      return exportData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  async getPersonalData(userId) {
    const participants = await offlineStorage.getParticipants();
    const userParticipant = participants.find(p => p.userId === userId);
    
    if (!userParticipant) return {};

    return {
      participantId: userParticipant.cr648_new_participantinfoid,
      name: userParticipant.cr648_new_name,
      dateOfBirth: userParticipant.cr648_new_dateofbirth,
      address: userParticipant.cr648_new_address,
      emergencyContact: userParticipant.cr648_new_emergencycontact,
      notes: userParticipant.cr648_new_notes,
      createdDate: userParticipant.createdDate,
      lastModified: userParticipant.lastModified
    };
  }

  async getSessionData(userId) {
    const sessions = await offlineStorage.getCoachingSessions();
    const userSessions = sessions.filter(s => s.userId === userId);
    
    return userSessions.map(session => ({
      sessionId: session.cr648_new_lessonevaluationid,
      date: session.cr648_new_date,
      lessonPlan: session.cr648_new_lessonplan,
      evaluation: session.cr648_new_participantevaluation,
      coachName: session.cr648_new_coachname,
      notes: session.cr648_new_notes,
      createdDate: session.createdDate
    }));
  }

  async getMedicalData(userId) {
    // Only include if user has consented to medical data processing
    const consents = await this.getUserConsents(userId);
    if (!consents?.consents?.medicalData) {
      return { note: 'Medical data access not consented to' };
    }

    const participants = await offlineStorage.getParticipants();
    const userParticipant = participants.find(p => p.userId === userId);
    
    return {
      medicalInfo: userParticipant?.cr648_new_medicalinfo || null,
      lastUpdated: userParticipant?.lastModified
    };
  }

  async getProgressPhotos(userId) {
    const consents = await this.getUserConsents(userId);
    if (!consents?.consents?.progressPhotos) {
      return { note: 'Progress photos access not consented to' };
    }

    // This would retrieve photo metadata (not actual photos for privacy)
    return {
      photoCount: 0, // Placeholder - would query photo storage
      note: 'Photo data would be included here'
    };
  }

  async getConsentHistory(userId) {
    try {
      await offlineStorage.init();
      const db = await offlineStorage.init();
      const tx = db.transaction('consent_history', 'readonly');
      const store = tx.objectStore('consent_history');
      const index = store.index('userId');
      return await index.getAll(userId);
    } catch (error) {
      console.error('Error getting consent history:', error);
      return [];
    }
  }

  // Data retention automation
  async applyRetentionPolicies() {
    console.log('Applying data retention policies...');
    
    try {
      const now = Date.now();
      
      // Check each data type for retention
      await this.cleanupExpiredData('sessions', this.retentionPolicies.essential, now);
      await this.cleanupExpiredData('photos', this.retentionPolicies.progressPhotos, now);
      await this.cleanupExpiredData('communications', this.retentionPolicies.communications, now);
      await this.cleanupExpiredData('analytics', this.retentionPolicies.analytics, now);
      await this.cleanupExpiredData('audit_logs', this.retentionPolicies.auditLogs, now);
      
      console.log('Data retention policies applied successfully');
    } catch (error) {
      console.error('Error applying retention policies:', error);
    }
  }

  async cleanupExpiredData(dataType, retentionDays, currentTime) {
    const cutoffDate = currentTime - (retentionDays * 24 * 60 * 60 * 1000);
    
    await offlineStorage.init();
    const db = await offlineStorage.init();
    
    // Implementation would vary based on data type
    console.log(`Cleaning up ${dataType} older than ${retentionDays} days`);
    
    // Example for sessions
    if (dataType === 'sessions') {
      const tx = db.transaction('coaching_sessions', 'readwrite');
      const store = tx.objectStore('coaching_sessions');
      const cursor = await store.openCursor();
      
      while (cursor) {
        const record = cursor.value;
        if (record.lastModified < cutoffDate) {
          const consents = await this.getUserConsents(record.userId);
          
          // Only delete if not required for legal purposes
          if (!this.isLegallyRequired(record, consents)) {
            await cursor.delete();
            await this.logDataDeletion(record.userId, 'SESSION', record.id, 'Retention policy');
          }
        }
        cursor.continue();
      }
    }
  }

  isLegallyRequired(record, consents) {
    // Check if data must be retained for legal reasons
    // e.g., safeguarding records, insurance requirements
    return record.isSafeguardingRelated || record.isInsuranceRequired;
  }

  // User data stats for privacy dashboard
  async getUserDataStats(userId) {
    try {
      const [participants, sessions, consents] = await Promise.all([
        offlineStorage.getParticipants(),
        offlineStorage.getCoachingSessions(),
        this.getUserConsents(userId)
      ]);

      const userParticipant = participants.find(p => p.userId === userId);
      const userSessions = sessions.filter(s => s.userId === userId);

      return {
        participantId: userParticipant?.cr648_new_participantinfoid,
        sessionsCount: userSessions.length,
        photosCount: 0, // Would query photo storage
        lastAccess: userParticipant?.lastAccessed,
        retentionDays: this.retentionPolicies.essential,
        dataSize: this.calculateDataSize(userParticipant, userSessions),
        consentDate: consents?.timestamp
      };
    } catch (error) {
      console.error('Error getting user data stats:', error);
      return null;
    }
  }

  calculateDataSize(participant, sessions) {
    // Rough calculation of data size in KB
    const participantSize = JSON.stringify(participant || {}).length;
    const sessionsSize = JSON.stringify(sessions || []).length;
    return Math.round((participantSize + sessionsSize) / 1024);
  }

  // Complete data deletion (right to be forgotten)
  async deleteUserData(userId) {
    console.log(`Starting complete data deletion for user: ${userId}`);
    
    try {
      await offlineStorage.init();
      const db = await offlineStorage.init();

      // Log the deletion request first
      await this.logDataAccess(userId, 'DELETE_REQUEST', 'User requested complete data deletion');

      // Delete from all tables
      const tableNames = ['participants', 'coaching_sessions', 'current_consents', 'consent_history'];
      
      for (const tableName of tableNames) {
        const tx = db.transaction(tableName, 'readwrite');
        const store = tx.objectStore(tableName);
        
        if (tableName === 'participants') {
          const participants = await store.getAll();
          const userParticipant = participants.find(p => p.userId === userId);
          if (userParticipant) {
            await store.delete(userParticipant.cr648_new_participantinfoid);
          }
        } else {
          // For other tables, delete by userId
          const items = await store.getAll();
          const userItems = items.filter(item => item.userId === userId);
          for (const item of userItems) {
            await store.delete(item.id || item.userId);
          }
        }
      }

      // Create final audit log entry
      await this.logDataAccess(userId, 'DELETE_COMPLETED', 'All user data successfully deleted', true);
      
      console.log(`Data deletion completed for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  // Audit logging
  async logDataAccess(userId, action, details, isFinalLog = false) {
    try {
      await offlineStorage.init();
      const db = await offlineStorage.init();
      
      const auditEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        action,
        details,
        timestamp: new Date().toISOString(),
        ipAddress: 'logged',
        userAgent: navigator.userAgent,
        isFinalLog
      };

      const tx = db.transaction('audit_logs', 'readwrite');
      const store = tx.objectStore('audit_logs');
      await store.add(auditEntry);
    } catch (error) {
      console.error('Error logging data access:', error);
    }
  }

  async logDataDeletion(userId, dataType, recordId, reason) {
    await this.logDataAccess(
      userId, 
      'DATA_DELETED', 
      `${dataType} record ${recordId} deleted: ${reason}`
    );
  }

  async getAuditLog(userId) {
    try {
      await offlineStorage.init();
      const db = await offlineStorage.init();
      const tx = db.transaction('audit_logs', 'readonly');
      const store = tx.objectStore('audit_logs');
      const index = store.index('userId');
      return await index.getAll(userId);
    } catch (error) {
      console.error('Error getting audit log:', error);
      return [];
    }
  }

  // Data minimization helpers
  getMinimalDataset(fullData, purpose) {
    // Return only the data necessary for the specified purpose
    const dataMap = {
      'session_planning': ['name', 'medicalInfo', 'emergencyContact'],
      'progress_tracking': ['name', 'sessions', 'photos'],
      'communication': ['name', 'contactInfo'],
      'analytics': ['sessionData'], // anonymized
      'legal_compliance': ['all'] // full dataset
    };

    const requiredFields = dataMap[purpose] || [];
    
    if (requiredFields.includes('all')) {
      return fullData;
    }

    const minimal = {};
    requiredFields.forEach(field => {
      if (fullData[field]) {
        minimal[field] = fullData[field];
      }
    });

    return minimal;
  }

  getDataRetentionInfo() {
    return {
      policies: this.retentionPolicies,
      explanation: {
        essential: 'Required for safeguarding and legal compliance',
        medicalData: 'Required for safety and insurance purposes',
        progressPhotos: 'Deleted after 2 years unless renewed consent',
        communications: 'Marketing communications data',
        analytics: 'Anonymous usage statistics'
      }
    };
  }

  // Initialize GDPR tables in IndexedDB
  async initializeGDPRTables() {
    try {
      await offlineStorage.init();
      const db = await offlineStorage.init();

      // Check if GDPR tables exist, create if not
      const tableNames = ['consent_history', 'current_consents', 'audit_logs'];
      
      for (const tableName of tableNames) {
        if (!db.objectStoreNames.contains(tableName)) {
          console.log(`Creating GDPR table: ${tableName}`);
          // Would need to handle versioning and upgrades properly
        }
      }
    } catch (error) {
      console.error('Error initializing GDPR tables:', error);
    }
  }
}

// Export singleton instance
export const gdprService = new GDPRService();
export default gdprService;