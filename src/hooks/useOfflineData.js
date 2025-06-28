// Custom hook for offline-aware data operations
import { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { offlineStorage } from '../offlineStorage';

const useOfflineData = (dataverseUrl, entitySet, primaryKey) => {
  const { instance, accounts } = useMsal();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState(null);

  // Helper function to remove Dataverse system fields
  const removeSystemFields = (data) => {
    const systemFields = [
      // Lookup value fields (read-only)
      '_cr648_coachparticipantrelation_value',
      '_modifiedonbehalfby_value',
      '_createdby_value',
      '_modifiedby_value',
      '_ownerid_value',
      '_owningbusinessunit_value',
      '_owningteam_value',
      '_owninguser_value',
      // System metadata fields
      'createdon',
      'modifiedon',
      'versionnumber',
      'timezoneruleversionnumber',
      'utcconversiontimezonecode',
      'importsequencenumber',
      'overriddencreatedon',
      'statecode',
      'statuscode',
      // Entity reference fields
      'createdby',
      'modifiedby',
      'modifiedonbehalfby',
      'ownerid',
      'owningbusinessunit',
      'owningteam',
      'owninguser',
      // Note: cr648_CoachParticipantrelation is the correct field name (with proper casing)
    ];

    const cleanData = { ...data };
    
    // Remove system fields and lookup value fields
    Object.keys(cleanData).forEach(key => {
      if (systemFields.includes(key) || (key.startsWith('_') && key.endsWith('_value'))) {
        delete cleanData[key];
      }
    });

    // Handle participant lookup field with @odata.bind format
    if (cleanData.cr648_CoachParticipantrelation) {
      cleanData[`cr648_CoachParticipantrelation@odata.bind`] = `/cr648_participantinformations(${cleanData.cr648_CoachParticipantrelation})`;
      delete cleanData.cr648_CoachParticipantrelation; // Remove the ID field after creating binding
    }

    // Remove all null values to prevent validation errors
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === null) {
        delete cleanData[key];
      }
    });

    return cleanData;
  };

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleSyncStatus = (event) => setSyncStatus(event.detail);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sync-status', handleSyncStatus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sync-status', handleSyncStatus);
    };
  }, []);

  // Initialize IndexedDB
  useEffect(() => {
    offlineStorage.init().catch(err => {
      console.error('Failed to initialize offline storage:', err);
      setError('Failed to initialize offline storage');
    });
  }, []);

  // Fetch data with offline fallback
  const fetchData = useCallback(async (showLoading = true, orderBy = null) => {
    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      if (isOnline && accounts.length > 0) {
        // Try to fetch from API when online
        const request = {
          scopes: [`${dataverseUrl}/.default`],
          account: accounts[0],
        };

        const response = await instance.acquireTokenSilent(request);
        const token = response.accessToken;
        
        let url = `${dataverseUrl}/api/data/v9.2/${entitySet}`;
        if (orderBy) {
          url += `?$orderby=${orderBy}`;
        }

        console.log('useOfflineData - Fetching from:', url, {
          dataverseUrl,
          entitySet,
          hasToken: !!token,
          isOnline,
          hostname: window.location.hostname
        });

        const apiResponse = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
          },
        });

        if (apiResponse.ok) {
          const result = await apiResponse.json();
          let records = result.value || [];
          
          // Transform lookup value fields for coaching sessions
          if (entitySet === 'cr648_lessonevaluations') {
            records = records.map(record => ({
              ...record,
              // Ensure cr648_CoachParticipantrelation is available from lookup value field
              cr648_CoachParticipantrelation: record.cr648_CoachParticipantrelation || record._cr648_coachparticipantrelation_value
            }));
          }
          
          // Save to offline storage
          if (entitySet === 'cr648_lessonevaluations') {
            await offlineStorage.saveCoachingSessions(records);
          } else if (entitySet === 'cr648_participantinfo' || entitySet === 'cr648_participants' || entitySet === 'cr648_participantinformations') {
            await offlineStorage.saveParticipants(records);
          }
          
          setData(records);
          return records;
        } else {
          const errorText = await apiResponse.text().catch(() => 'Unknown error');
          console.error('useOfflineData - API request failed:', {
            status: apiResponse.status,
            statusText: apiResponse.statusText,
            url,
            errorText,
            headers: Object.fromEntries(apiResponse.headers.entries())
          });
          throw new Error(`API request failed: ${apiResponse.status} - ${errorText}`);
        }
      } else {
        // Fallback to offline storage
        console.log('Using offline storage for data');
        let offlineData = [];
        
        if (entitySet === 'cr648_lessonevaluations') {
          offlineData = await offlineStorage.getCoachingSessions();
          // Transform lookup value fields for coaching sessions
          offlineData = (offlineData || []).map(record => ({
            ...record,
            cr648_CoachParticipantrelation: record.cr648_CoachParticipantrelation || record._cr648_coachparticipantrelation_value
          }));
        } else if (entitySet === 'cr648_participantinfo' || entitySet === 'cr648_participants' || entitySet === 'cr648_participantinformations') {
          offlineData = await offlineStorage.getParticipants();
        }
        
        setData(offlineData || []);
        
        if (!isOnline) {
          setError('You are offline. Showing cached data.');
        }
        
        return offlineData || [];
      }
    } catch (err) {
      console.error('useOfflineData - Fetch failed, trying offline storage:', {
        error: err.message,
        stack: err.stack,
        dataverseUrl,
        entitySet,
        isOnline,
        accountsLength: accounts.length,
        hostname: window.location.hostname
      });
      
      // Fallback to offline storage on error
      try {
        let offlineData = [];
        
        if (entitySet === 'cr648_lessonevaluations') {
          offlineData = await offlineStorage.getCoachingSessions();
          // Transform lookup value fields for coaching sessions
          offlineData = (offlineData || []).map(record => ({
            ...record,
            cr648_CoachParticipantrelation: record.cr648_CoachParticipantrelation || record._cr648_coachparticipantrelation_value
          }));
        } else if (entitySet === 'cr648_participantinfo' || entitySet === 'cr648_participants' || entitySet === 'cr648_participantinformations') {
          offlineData = await offlineStorage.getParticipants();
        }
        
        setData(offlineData || []);
        setError(isOnline ? 'Network error. Showing cached data.' : 'You are offline. Showing cached data.');
        
        return offlineData || [];
      } catch (offlineErr) {
        console.error('Offline storage failed:', offlineErr);
        setError('Failed to load data');
        setData([]);
        return [];
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [instance, accounts, dataverseUrl, entitySet, isOnline]);

  // Create record with offline queue
  const createRecord = useCallback(async (recordData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline && accounts.length > 0) {
        // Try to create online
        const request = {
          scopes: [`${dataverseUrl}/.default`],
          account: accounts[0],
        };

        const response = await instance.acquireTokenSilent(request);
        const token = response.accessToken;

        // Clean the data before sending to API
        const cleanData = removeSystemFields(recordData);
        
        console.log('Create API call - cleaned data:', cleanData);

        const apiResponse = await fetch(`${dataverseUrl}/api/data/v9.2/${entitySet}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(cleanData),
        });

        if (apiResponse.ok) {
          const createdRecord = await apiResponse.json();
          
          // Update local storage
          if (entitySet === 'cr648_lessonevaluations') {
            await offlineStorage.saveCoachingSession(createdRecord);
          } else if (entitySet === 'cr648_participantinfo') {
            await offlineStorage.saveParticipant(createdRecord);
          }
          
          // Refresh data
          await fetchData(false);
          
          return createdRecord;
        } else {
          // Get detailed error message from Dataverse
          let errorMessage = `Create failed: ${apiResponse.status}`;
          try {
            const errorData = await apiResponse.json();
            errorMessage += ` - ${errorData.error?.message || JSON.stringify(errorData)}`;
          } catch (e) {
            errorMessage += ` - ${apiResponse.statusText}`;
          }
          console.error('Dataverse API Error:', errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        // Queue for offline sync
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tempRecord = {
          ...recordData,
          [primaryKey]: tempId,
          _isTemporary: true,
          _createdOffline: true
        };

        // Save to local storage (automatically queues for sync)
        if (entitySet === 'cr648_lessonevaluations') {
          await offlineStorage.saveCoachingSession(tempRecord);
        } else if (entitySet === 'cr648_participantinfo') {
          await offlineStorage.saveParticipant(tempRecord);
        }

        // Refresh data
        await fetchData(false);
        
        setError('Created offline. Will sync when online.');
        
        return tempRecord;
      }
    } catch (err) {
      console.error('Create operation failed:', err);
      setError(`Create failed: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [instance, accounts, dataverseUrl, entitySet, primaryKey, isOnline, fetchData]);

  // Update record with offline queue
  const updateRecord = useCallback(async (recordId, recordData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline && accounts.length > 0 && !recordId.toString().startsWith('temp_')) {
        // Try to update online (skip temp records)
        const request = {
          scopes: [`${dataverseUrl}/.default`],
          account: accounts[0],
        };

        const response = await instance.acquireTokenSilent(request);
        const token = response.accessToken;

        // Clean the data before sending to API
        const cleanData = removeSystemFields(recordData);
        
        console.log('Update API call - cleaned data:', cleanData);

        const apiResponse = await fetch(`${dataverseUrl}/api/data/v9.2/${entitySet}(${recordId})`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(cleanData),
        });

        if (apiResponse.ok) {
          const updatedRecord = await apiResponse.json();
          
          // Update local storage
          if (entitySet === 'cr648_lessonevaluations') {
            await offlineStorage.saveCoachingSession(updatedRecord);
          } else if (entitySet === 'cr648_participantinfo') {
            await offlineStorage.saveParticipant(updatedRecord);
          }
          
          // Refresh data
          await fetchData(false);
          
          return updatedRecord;
        } else {
          // Get detailed error message from Dataverse
          let errorMessage = `Update failed: ${apiResponse.status}`;
          try {
            const errorData = await apiResponse.json();
            errorMessage += ` - ${errorData.error?.message || JSON.stringify(errorData)}`;
            console.error('Dataverse Update API Error:', errorData);
          } catch (e) {
            errorMessage += ` - ${apiResponse.statusText}`;
          }
          throw new Error(errorMessage);
        }
      } else {
        // Update locally and queue for sync
        const updatedRecord = {
          ...recordData,
          [primaryKey]: recordId,
          _modifiedOffline: true
        };

        // Update local storage (automatically queues for sync)
        if (entitySet === 'cr648_lessonevaluations') {
          await offlineStorage.saveCoachingSession(updatedRecord);
        } else if (entitySet === 'cr648_participantinfo') {
          await offlineStorage.saveParticipant(updatedRecord);
        }

        // Refresh data
        await fetchData(false);
        
        setError('Updated offline. Will sync when online.');
        
        return updatedRecord;
      }
    } catch (err) {
      console.error('Update operation failed:', err);
      setError(`Update failed: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [instance, accounts, dataverseUrl, entitySet, primaryKey, isOnline, fetchData]);

  // Delete record with offline queue
  const deleteRecord = useCallback(async (recordId) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline && accounts.length > 0 && !recordId.toString().startsWith('temp_')) {
        // Try to delete online (skip temp records)
        const request = {
          scopes: [`${dataverseUrl}/.default`],
          account: accounts[0],
        };

        const response = await instance.acquireTokenSilent(request);
        const token = response.accessToken;

        const apiResponse = await fetch(`${dataverseUrl}/api/data/v9.2/${entitySet}(${recordId})`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
          },
        });

        if (apiResponse.ok) {
          // Remove from local storage
          if (entitySet === 'cr648_lessonevaluations') {
            await offlineStorage.deleteCoachingSession(recordId);
          } else if (entitySet === 'cr648_participantinfo') {
            await offlineStorage.deleteParticipant(recordId);
          }
          
          // Refresh data
          await fetchData(false);
          
        } else {
          throw new Error(`Delete failed: ${apiResponse.status}`);
        }
      } else {
        // Delete locally (automatically queues for sync)
        if (entitySet === 'cr648_lessonevaluations') {
          await offlineStorage.deleteCoachingSession(recordId);
        } else if (entitySet === 'cr648_participantinfo') {
          await offlineStorage.deleteParticipant(recordId);
        }

        // Refresh data
        await fetchData(false);
        
        setError('Deleted offline. Will sync when online.');
      }
    } catch (err) {
      console.error('Delete operation failed:', err);
      setError(`Delete failed: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [instance, accounts, dataverseUrl, entitySet, isOnline, fetchData]);

  return {
    data,
    isLoading,
    error,
    isOnline,
    syncStatus,
    fetchData,
    createRecord,
    updateRecord,
    deleteRecord,
    clearError: () => setError(null)
  };
};

export default useOfflineData;