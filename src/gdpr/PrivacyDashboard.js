import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Security,
  Download,
  Delete,
  Edit,
  Visibility,
  DataUsage,
  Schedule,
  CheckCircle,
  Cancel,
  Info,
  Email
} from '@mui/icons-material';
import { useMsal } from '@azure/msal-react';
import GDPRConsentModal from './GDPRConsentModal';
import { gdprService } from './gdprService';

const PrivacyDashboard = () => {
  const { accounts } = useMsal();
  const account = accounts[0];
  
  const [userConsents, setUserConsents] = useState(null);
  const [dataStats, setDataStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [exportData, setExportData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [account]);  // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const [consents, stats] = await Promise.all([
        gdprService.getUserConsents(account.homeAccountId),
        gdprService.getUserDataStats(account.homeAccountId)
      ]);
      
      setUserConsents(consents);
      setDataStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConsents = async (newConsents) => {
    try {
      await gdprService.updateUserConsents(account.homeAccountId, newConsents);
      setShowConsentModal(false);
      await loadUserData();
    } catch (error) {
      console.error('Error updating consents:', error);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await gdprService.exportUserData(account.homeAccountId);
      setExportData(data);
      setShowDataDialog(true);
      
      // Trigger download
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rda-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await gdprService.deleteUserData(account.homeAccountId);
      setShowDeleteDialog(false);
      // Redirect to confirmation page
      window.location.href = '/data-deleted';
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const getConsentStatus = (consentKey) => {
    if (!userConsents?.consents) return false;
    return userConsents.consents[consentKey] || false;
  };

  const formatRetentionPeriod = (days) => {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading your privacy dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Security color="primary" fontSize="large" />
        <Box>
          <Typography variant="h4" gutterBottom>
            Privacy Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your data protection preferences and rights
          </Typography>
        </Box>
      </Box>

      {/* Current Consent Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Consent Status
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Last updated: {userConsents?.timestamp ? 
              new Date(userConsents.timestamp).toLocaleDateString() : 'Never'}
          </Typography>
          
          <Grid container spacing={2}>
            {[
              { key: 'essential', label: 'Essential Data', required: true },
              { key: 'medicalData', label: 'Medical Information' },
              { key: 'progressPhotos', label: 'Progress Photos' },
              { key: 'communications', label: 'Communications' },
              { key: 'analytics', label: 'Analytics' },
              { key: 'datasharing', label: 'Data Sharing' }
            ].map((consent) => (
              <Grid item xs={6} sm={4} key={consent.key}>
                <Chip
                  icon={getConsentStatus(consent.key) ? <CheckCircle /> : <Cancel />}
                  label={consent.label}
                  color={getConsentStatus(consent.key) ? 'success' : 'default'}
                  variant={consent.required ? 'filled' : 'outlined'}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
        <CardActions>
          <Button 
            startIcon={<Edit />}
            onClick={() => setShowConsentModal(true)}
          >
            Update Preferences
          </Button>
        </CardActions>
      </Card>

      {/* Data Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Data Overview
          </Typography>
          
          {dataStats && (
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {dataStats.sessionsCount}
                  </Typography>
                  <Typography variant="caption">
                    Sessions Recorded
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {dataStats.photosCount}
                  </Typography>
                  <Typography variant="caption">
                    Photos/Videos
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {formatRetentionPeriod(dataStats.retentionDays)}
                  </Typography>
                  <Typography variant="caption">
                    Data Retention
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {dataStats.lastAccess ? 
                      Math.floor((Date.now() - new Date(dataStats.lastAccess)) / (1000 * 60 * 60 * 24)) : 0}
                  </Typography>
                  <Typography variant="caption">
                    Days Since Access
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Grid container spacing={3}>
        {/* Data Access */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Download color="primary" />
                <Typography variant="h6">
                  Access Your Data
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Download a complete copy of all your personal data in a portable format.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                startIcon={isExporting ? <CircularProgress size={16} /> : <Download />}
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Data Correction */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Edit color="primary" />
                <Typography variant="h6">
                  Correct Your Data
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Update incorrect personal information in your participant profile.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                startIcon={<Edit />}
                href="/participant-info"
              >
                Edit Profile
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Data Portability */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <DataUsage color="primary" />
                <Typography variant="h6">
                  Data Portability
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Transfer your data to another RDA center or service provider.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                startIcon={<Email />}
                href="mailto:privacy@highlandgrouprda.org.uk?subject=Data Portability Request"
              >
                Request Transfer
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Delete Account */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'error.light' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Delete color="error" />
                <Typography variant="h6" color="error">
                  Delete My Data
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Permanently delete all your personal data from our systems.
              </Typography>
              <Alert severity="warning" sx={{ mt: 2 }}>
                This action cannot be undone!
              </Alert>
            </CardContent>
            <CardActions>
              <Button 
                startIcon={<Delete />}
                color="error"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Contact Information */}
      <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: 'info.light' }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Info color="info" />
          <Typography variant="h6">
            Data Protection Contact
          </Typography>
        </Box>
        <Typography variant="body2" paragraph>
          If you have any questions about your data or want to exercise your rights, contact our Data Protection Officer:
        </Typography>
        <Typography variant="body2">
          <strong>Email:</strong> privacy@highlandgrouprda.org.uk<br />
          <strong>Phone:</strong> 01234 567890<br />
          <strong>Address:</strong> Highland Group RDA, Privacy Office, [Address]
        </Typography>
      </Paper>

      {/* Modals */}
      {showConsentModal && (
        <GDPRConsentModal
          open={showConsentModal}
          onAgree={handleUpdateConsents}
          onDisagree={() => setShowConsentModal(false)}
          userName={account?.name}
          latestPolicyVersion="1.1 - 2025-06-10"
          existingConsents={userConsents}
          isUpdate={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle color="error">
          Delete All My Data
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This will permanently delete all your data including:
          </Alert>
          <List dense>
            <ListItem>
              <ListItemIcon><Delete color="error" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Personal information and contact details" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Delete color="error" fontSize="small" /></ListItemIcon>
              <ListItemText primary="All session records and evaluations" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Delete color="error" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Progress photos and videos" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Delete color="error" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Medical information and notes" />
            </ListItem>
          </List>
          <Typography variant="body2" sx={{ mt: 2 }}>
            This action cannot be undone. Are you absolutely sure?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
          >
            Yes, Delete Everything
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Export Dialog */}
      <Dialog 
        open={showDataDialog} 
        onClose={() => setShowDataDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Your Data Export
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Your data has been exported and downloaded. The file contains:
          </Typography>
          {exportData && (
            <List>
              <ListItem>
                <ListItemIcon><Visibility /></ListItemIcon>
                <ListItemText 
                  primary="Personal Information"
                  secondary={`${Object.keys(exportData.personalData || {}).length} fields`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Schedule /></ListItemIcon>
                <ListItemText 
                  primary="Session Records"
                  secondary={`${exportData.sessions?.length || 0} sessions`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Security /></ListItemIcon>
                <ListItemText 
                  primary="Consent History"
                  secondary={`${exportData.consentHistory?.length || 0} consent records`}
                />
              </ListItem>
            </List>
          )}
          <Alert severity="info" sx={{ mt: 2 }}>
            The exported file is in JSON format and can be used to transfer your data to another service.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDataDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PrivacyDashboard;