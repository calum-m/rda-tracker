import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import {
  AdminPanelSettings,
  Security,
  Download,
  Delete,
  Schedule,
  Visibility,
  Warning,
  CheckCircle,
  Error,
  Refresh,
  Search
} from '@mui/icons-material';
import { gdprService } from './gdprService';
import { offlineStorage } from '../offlineStorage';

const GDPRAdminPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [retentionReport, setRetentionReport] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showRetentionDialog, setShowRetentionDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const loadAdminData = async () => {
    try {
      const [usersData, logsData, retentionData] = await Promise.all([
        getAllUsers(),
        getRecentAuditLogs(),
        getRetentionReport()
      ]);
      
      setUsers(usersData);
      setAuditLogs(logsData);
      setRetentionReport(retentionData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const getAllUsers = async () => {
    try {
      // Get all participants and extract user information
      const participants = await offlineStorage.getParticipants();
      const usersMap = new Map();

      for (const participant of participants) {
        if (participant.userId) {
          const consents = await gdprService.getUserConsents(participant.userId);
          const stats = await gdprService.getUserDataStats(participant.userId);
          
          usersMap.set(participant.userId, {
            userId: participant.userId,
            name: participant.cr648_new_name,
            email: participant.email || 'Not provided',
            consentStatus: consents ? 'Consented' : 'No Consent',
            consentDate: consents?.timestamp,
            dataSize: stats?.dataSize || 0,
            sessionsCount: stats?.sessionsCount || 0,
            lastAccess: stats?.lastAccess,
            isMinor: consents?.isMinor || false,
            consents: consents?.consents || {}
          });
        }
      }

      return Array.from(usersMap.values());
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  };

  const getRecentAuditLogs = async () => {
    try {
      // Get recent audit logs across all users
      await offlineStorage.init();
      const db = await offlineStorage.init();
      
      if (!db.objectStoreNames.contains('audit_logs')) {
        return [];
      }

      const tx = db.transaction('audit_logs', 'readonly');
      const store = tx.objectStore('audit_logs');
      const logs = await store.getAll();
      
      // Sort by timestamp, most recent first
      return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 100);
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  };

  const getRetentionReport = async () => {
    try {
      const participants = await offlineStorage.getParticipants();
      const sessions = await offlineStorage.getCoachingSessions();
      const now = Date.now();
      
      const report = {
        totalRecords: participants.length + sessions.length,
        expiringSoon: 0,
        overRetention: 0,
        breakdown: {
          participants: participants.length,
          sessions: sessions.length,
          photos: 0 // Would query photo storage
        }
      };

      // Check retention periods
      const retentionPeriods = gdprService.retentionPolicies;
      
      participants.forEach(p => {
        const age = now - new Date(p.lastModified || p.createdDate).getTime();
        const retentionLimit = retentionPeriods.essential * 24 * 60 * 60 * 1000;
        
        if (age > retentionLimit * 0.9) report.expiringSoon++;
        if (age > retentionLimit) report.overRetention++;
      });

      return report;
    } catch (error) {
      console.error('Error generating retention report:', error);
      return null;
    }
  };

  const handleViewUserDetails = async (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleRunRetentionPolicy = async () => {
    try {
      await gdprService.applyRetentionPolicies();
      setShowRetentionDialog(false);
      await loadAdminData(); // Refresh data
    } catch (error) {
      console.error('Error running retention policy:', error);
    }
  };

  const exportComplianceReport = async () => {
    try {
      const report = {
        generatedDate: new Date().toISOString(),
        totalUsers: users.length,
        consentedUsers: users.filter(u => u.consentStatus === 'Consented').length,
        minorUsers: users.filter(u => u.isMinor).length,
        recentAuditLogs: auditLogs.slice(0, 50),
        retentionReport,
        dataBreakdown: {
          totalParticipants: retentionReport?.breakdown.participants || 0,
          totalSessions: retentionReport?.breakdown.sessions || 0,
          totalPhotos: retentionReport?.breakdown.photos || 0
        }
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gdpr-compliance-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting compliance report:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filterStatus !== 'all' && user.consentStatus.toLowerCase() !== filterStatus) {
      return false;
    }
    if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    if (searchTerm && !log.details.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <AdminPanelSettings color="primary" fontSize="large" />
        <Box>
          <Typography variant="h4" gutterBottom>
            GDPR Admin Panel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage data protection compliance and user rights
          </Typography>
        </Box>
        <Box ml="auto">
          <Button
            startIcon={<Download />}
            variant="outlined"
            onClick={exportComplianceReport}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {users.length}
              </Typography>
              <Typography variant="body2">
                Total Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {users.filter(u => u.consentStatus === 'Consented').length}
              </Typography>
              <Typography variant="body2">
                Consented Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {retentionReport?.expiringSoon || 0}
              </Typography>
              <Typography variant="body2">
                Expiring Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {retentionReport?.overRetention || 0}
              </Typography>
              <Typography variant="body2">
                Over Retention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="User Management" />
          <Tab label="Audit Logs" />
          <Tab label="Data Retention" />
          <Tab label="Compliance Tools" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>
        {/* User Management Tab */}
        {activeTab === 0 && (
          <Box>
            <Box display="flex" gap={2} mb={3}>
              <TextField
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search />
                }}
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Filter Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Filter Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="consented">Consented</MenuItem>
                  <MenuItem value="no consent">No Consent</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Consent Status</TableCell>
                    <TableCell>Data Size</TableCell>
                    <TableCell>Last Access</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <Box>
                          {user.name}
                          {user.isMinor && (
                            <Chip 
                              label="Minor" 
                              size="small" 
                              color="warning" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.consentStatus}
                          color={user.consentStatus === 'Consented' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.dataSize} KB</TableCell>
                      <TableCell>
                        {user.lastAccess ? 
                          new Date(user.lastAccess).toLocaleDateString() : 
                          'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewUserDetails(user)}
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 1 && (
          <Box>
            <TextField
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search />
              }}
              fullWidth
              sx={{ mb: 3 }}
            />

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAuditLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.userId}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          size="small"
                          color={
                            log.action.includes('DELETE') ? 'error' :
                            log.action.includes('EXPORT') ? 'info' :
                            'default'
                          }
                        />
                      </TableCell>
                      <TableCell>{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Data Retention Tab */}
        {activeTab === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Data retention policies automatically delete data after specified periods to comply with GDPR.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Retention Overview
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon><Schedule /></ListItemIcon>
                        <ListItemText
                          primary="Essential Data"
                          secondary="7 years (safeguarding requirement)"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Schedule /></ListItemIcon>
                        <ListItemText
                          primary="Progress Photos"
                          secondary="2 years (or until consent withdrawn)"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Schedule /></ListItemIcon>
                        <ListItemText
                          primary="Communications"
                          secondary="3 years"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Retention Actions
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Button
                        startIcon={<Delete />}
                        variant="outlined"
                        color="error"
                        onClick={() => setShowRetentionDialog(true)}
                      >
                        Run Retention Policy
                      </Button>
                      <Button
                        startIcon={<Visibility />}
                        variant="outlined"
                      >
                        Preview Deletions
                      </Button>
                      <Button
                        startIcon={<Refresh />}
                        variant="outlined"
                        onClick={loadAdminData}
                      >
                        Refresh Report
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Compliance Tools Tab */}
        {activeTab === 3 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Security color="primary" />
                      <Typography variant="h6">
                        Consent Management
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      View and manage user consent preferences across all data categories.
                    </Typography>
                    <Button variant="outlined" fullWidth>
                      Manage Consents
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Download color="primary" />
                      <Typography variant="h6">
                        Data Exports
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Generate and download compliance reports for regulatory purposes.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={exportComplianceReport}
                    >
                      Export Report
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Warning color="primary" />
                      <Typography variant="h6">
                        Breach Management
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Report and manage data protection incidents and breaches.
                    </Typography>
                    <Button variant="outlined" fullWidth>
                      Report Incident
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* User Details Dialog */}
      <Dialog 
        open={showUserDetails} 
        onClose={() => setShowUserDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          User Details: {selectedUser?.name}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Consent Preferences
              </Typography>
              <Grid container spacing={2} mb={3}>
                {Object.entries(selectedUser.consents || {}).map(([key, value]) => (
                  <Grid item xs={6} key={key}>
                    <Chip
                      icon={value ? <CheckCircle /> : <Error />}
                      label={key}
                      color={value ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>

              <Typography variant="h6" gutterBottom>
                Data Summary
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Sessions"
                    secondary={`${selectedUser.sessionsCount} recorded sessions`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Data Size"
                    secondary={`${selectedUser.dataSize} KB total`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Consent Date"
                    secondary={selectedUser.consentDate ? 
                      new Date(selectedUser.consentDate).toLocaleDateString() : 
                      'No consent recorded'
                    }
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUserDetails(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Retention Policy Dialog */}
      <Dialog open={showRetentionDialog} onClose={() => setShowRetentionDialog(false)}>
        <DialogTitle color="error">
          Run Data Retention Policy
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will permanently delete data that has exceeded its retention period.
          </Alert>
          <Typography variant="body2">
            Are you sure you want to proceed? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRetentionDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRunRetentionPolicy}
            color="error"
            variant="contained"
          >
            Run Policy
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GDPRAdminPanel;