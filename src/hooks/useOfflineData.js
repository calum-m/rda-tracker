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
          const records = result.value || [];
          
          // Save to offline storage
          if (entitySet === 'cr648_coachingsessions') {
            await offlineStorage.saveCoachingSessions(records);
          } else if (entitySet === 'cr648_participantinfo' || entitySet === 'cr648_participants') {
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
        
        if (entitySet === 'cr648_coachingsessions') {
          offlineData = await offlineStorage.getCoachingSessions();
        } else if (entitySet === 'cr648_participantinfo' || entitySet === 'cr648_participants') {
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
        
        if (entitySet === 'cr648_coachingsessions') {
          offlineData = await offlineStorage.getCoachingSessions();
        } else if (entitySet === 'cr648_participantinfo' || entitySet === 'cr648_participants') {
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
          body: JSON.stringify(recordData),
        });

        if (apiResponse.ok) {
          const createdRecord = await apiResponse.json();
          
          // Update local storage
          if (entitySet === 'cr648_coachingsessions') {
            await offlineStorage.saveCoachingSession(createdRecord);
          } else if (entitySet === 'cr648_participantinfo') {
            await offlineStorage.saveParticipant(createdRecord);
          }
          
          // Refresh data
          await fetchData(false);
          
          return createdRecord;
        } else {
          throw new Error(`Create failed: ${apiResponse.status}`);
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
        if (entitySet === 'cr648_coachingsessions') {
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
          body: JSON.stringify(recordData),
        });

        if (apiResponse.ok) {
          const updatedRecord = await apiResponse.json();
          
          // Update local storage
          if (entitySet === 'cr648_coachingsessions') {
            await offlineStorage.saveCoachingSession(updatedRecord);
          } else if (entitySet === 'cr648_participantinfo') {
            await offlineStorage.saveParticipant(updatedRecord);
          }
          
          // Refresh data
          await fetchData(false);
          
          return updatedRecord;
        } else {
          throw new Error(`Update failed: ${apiResponse.status}`);
        }
      } else {
        // Update locally and queue for sync
        const updatedRecord = {
          ...recordData,
          [primaryKey]: recordId,
          _modifiedOffline: true
        };

        // Update local storage (automatically queues for sync)
        if (entitySet === 'cr648_coachingsessions') {
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
          if (entitySet === 'cr648_coachingsessions') {
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
        if (entitySet === 'cr648_coachingsessions') {
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