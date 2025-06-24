import React, { useState, useEffect } from 'react';
import { 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Divider,
  Box,
  CircularProgress
} from '@mui/material';
import { 
  CloudOff, 
  Cloud, 
  Sync, 
  Schedule,
  PersonAdd,
  PersonRemove,
  Event,
  EventBusy
} from '@mui/icons-material';
import { syncService } from '../syncService';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    hasPendingChanges: false
  });
  const [showDetails, setShowDetails] = useState(false);
  const [syncStats, setSyncStats] = useState(null);

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      updateSyncStatus();
      // Trigger sync when coming back online
      syncService.performSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateSyncStatus();
    };

    // Listen for sync status updates
    const handleSyncUpdate = (status) => {
      setSyncStatus(status);
    };

    // Register service worker message listener
    const handleServiceWorkerMessage = (event) => {
      if (event.data.type === 'BACKGROUND_SYNC') {
        syncService.performSync();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    syncService.addSyncListener(handleSyncUpdate);
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Initial status update
    updateSyncStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      syncService.removeSyncListener(handleSyncUpdate);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  const updateSyncStatus = async () => {
    try {
      const status = await syncService.getSyncStats();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  };

  const handleShowDetails = async () => {
    try {
      const stats = await syncService.getSyncStats();
      setSyncStats(stats);
      setShowDetails(true);
    } catch (error) {
      console.error('Error getting sync stats:', error);
    }
  };

  const handleManualSync = async () => {
    try {
      await syncService.forcSync();
      await updateSyncStatus();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'error';
    if (syncStatus.isSyncing) return 'info';
    if (syncStatus.hasPendingChanges) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) return <Sync />;
    if (!isOnline) return <CloudOff />;
    if (syncStatus.hasPendingChanges) return <Schedule />;
    return <Cloud />;
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) return 'Syncing...';
    if (!isOnline) return 'Offline';
    if (syncStatus.hasPendingChanges) return `${syncStatus.pendingCount} pending`;
    return 'Online';
  };

  const getActionIcon = (type, action) => {
    if (type === 'PARTICIPANT_SAVE') {
      return action === 'CREATE' ? <PersonAdd /> : <PersonAdd />;
    }
    if (type === 'PARTICIPANT_DELETE') {
      return <PersonRemove />;
    }
    if (type === 'SESSION_SAVE') {
      return action === 'CREATE' ? <Event /> : <Event />;
    }
    if (type === 'SESSION_DELETE') {
      return <EventBusy />;
    }
    return <Schedule />;
  };

  const getActionText = (type, action) => {
    if (type === 'PARTICIPANT_SAVE') {
      return action === 'CREATE' ? 'Create Participant' : 'Update Participant';
    }
    if (type === 'PARTICIPANT_DELETE') {
      return 'Delete Participant';
    }
    if (type === 'SESSION_SAVE') {
      return action === 'CREATE' ? 'Create Session' : 'Update Session';
    }
    if (type === 'SESSION_DELETE') {
      return 'Delete Session';
    }
    return 'Unknown Action';
  };

  return (
    <>
      <Chip
        icon={getStatusIcon()}
        label={getStatusText()}
        color={getStatusColor()}
        onClick={handleShowDetails}
        sx={{ 
          cursor: 'pointer',
          '& .MuiChip-icon': {
            animation: syncStatus.isSyncing ? 'spin 1s linear infinite' : 'none'
          }
        }}
      />

      <Dialog 
        open={showDetails} 
        onClose={() => setShowDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {getStatusIcon()}
            <Typography variant="h6">
              Sync Status
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box mb={2}>
            <Typography variant="body1" gutterBottom>
              <strong>Connection:</strong> {isOnline ? 'Online' : 'Offline'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Status:</strong> {syncStatus.isSyncing ? 'Syncing...' : 'Ready'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Pending Changes:</strong> {syncStatus.pendingCount}
            </Typography>
          </Box>

          {syncStats?.pendingItems && syncStats.pendingItems.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Pending Changes
              </Typography>
              <List dense>
                {syncStats.pendingItems.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {getActionIcon(item.type, item.action)}
                    </ListItemIcon>
                    <ListItemText
                      primary={getActionText(item.type, item.action)}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {new Date(item.timestamp).toLocaleString()}
                          </Typography>
                          {item.retryCount > 0 && (
                            <Typography variant="caption" color="error">
                              Retry attempts: {item.retryCount}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {!isOnline && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box 
                bgcolor="warning.light" 
                p={2} 
                borderRadius={1}
                display="flex"
                alignItems="center"
                gap={1}
              >
                <CloudOff color="warning" />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Working Offline
                  </Typography>
                  <Typography variant="caption">
                    Your changes are saved locally and will sync when you're back online.
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          {syncStats?.lastSyncAttempt && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Last sync: {new Date(syncStats.lastSyncAttempt).toLocaleString()}
              </Typography>
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          {isOnline && (
            <Button 
              onClick={handleManualSync}
              disabled={syncStatus.isSyncing}
              startIcon={syncStatus.isSyncing ? <CircularProgress size={16} /> : <Sync />}
            >
              {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          )}
          <Button onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default OfflineIndicator;