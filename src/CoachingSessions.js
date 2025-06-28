import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  IconButton,
  Chip, // Added Chip for offline indicators
  Autocomplete // Added for participant selection
} from "@mui/material";
import { Edit as EditIcon, Save as SaveIcon, Add as AddIcon, Cancel as CancelIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, CloudOff as CloudOffIcon, Sync as SyncIcon } from '@mui/icons-material'; // Added offline icons
import Pagination from '@mui/material/Pagination'; // Import Pagination
import useOfflineData from './hooks/useOfflineData'; // Import offline data hook

// Dataverse URL from environment variable with fallback
const dataverseUrl = process.env.REACT_APP_DATAVERSE_URL || "https://orgdbcfb9bc.crm11.dynamics.com";

// Debug logging for production
console.log("CoachingSessions - Environment:", {
  REACT_APP_DATAVERSE_URL: process.env.REACT_APP_DATAVERSE_URL,
  dataverseUrl: dataverseUrl,
  hostname: window.location.hostname
});

const CoachingSessions = () => { // Renamed component
  // Use offline data hook instead of manual API calls
  const {
    data: allProgressRecords,
    isLoading,
    error,
    isOnline,
    syncStatus,
    fetchData,
    createRecord,
    updateRecord,
    deleteRecord,
    clearError
  } = useOfflineData(dataverseUrl, 'cr648_lessonevaluations', 'cr648_lessonevaluationid');

  // Participant data for dropdown selection
  const {
    data: participantRecords,
    isLoading: participantsLoading,
    fetchData: fetchParticipants
  } = useOfflineData(dataverseUrl, 'cr648_participantinformations', 'cr648_participantinformationid');

  const [progressRecords, setProgressRecords] = useState([]);
  const [currentFilteredRecords, setCurrentFilteredRecords] = useState([]); // Holds all records matching filters, before pagination
  const [editingId, setEditingId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false); // Track if we're in view mode vs edit mode
  const [editFormData, setEditFormData] = useState({});
  const [newRecord, setNewRecord] = useState({
    cr648_coachname: '',
    cr648_CoachParticipantrelation: '',
    cr648_date: '',
    cr648_lessonplan: '',
    cr648_participantsevaluation: '',
    cr648_sessiongoals: '',
    cr648_equines: '',
    cr648_equipmentresources: '',
    cr648_taskwarmuptime: '',
    cr648_taskwarmupcoachingpointsfocusstyles: '',
    cr648_taskwarmupcomment: '',
    cr648_maincontenttime: '',
    cr648_maincontentcoachingpoints: '',
    cr648_maincontentcomment: '',
    cr648_cooldowntime: '',
    cr648_cooldowncoachingpoints: '',
    cr648_cooldowncomment: '',
    cr648_evaluationofsessionandactionfornextsession: ''
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null); // For delete confirmation
  const [isDeleting, setIsDeleting] = useState(false); // For delete operation loading state

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New states for advanced filtering
  const [filterLessonPlan, setFilterLessonPlan] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterParticipantEval, setFilterParticipantEval] = useState("");
  const [filterCoachName, setFilterCoachName] = useState("");
  const [filterParticipant, setFilterParticipant] = useState("");

  // Initial data fetch
  useEffect(() => {
    fetchData(true, 'createdon desc');
    fetchParticipants(true, 'cr648_firstname asc, cr648_lastname asc');
  }, [fetchData, fetchParticipants]);

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
    setIsViewMode(false); // Reset view mode when canceling
  };

  // Handle view mode toggle (read-only)
  const handleViewRecord = (record) => {
    setEditingId(record.cr648_lessonevaluationid);
    setIsViewMode(true); // Set to view mode
    const formattedDate = record.cr648_date ? new Date(record.cr648_date).toISOString().split('T')[0] : '';
    setEditFormData({ ...record, cr648_date: formattedDate });
  };

  // Handle edit mode toggle (editable)
  const handleEditRecord = (record) => {
    setEditingId(record.cr648_lessonevaluationid);
    setIsViewMode(false); // Set to edit mode
    const formattedDate = record.cr648_date ? new Date(record.cr648_date).toISOString().split('T')[0] : '';
    setEditFormData({ ...record, cr648_date: formattedDate });
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const updatePayload = {
        cr648_coachname: editFormData.cr648_coachname,
        cr648_date: editFormData.cr648_date,
        cr648_lessonplan: editFormData.cr648_lessonplan,
        cr648_participantsevaluation: editFormData.cr648_participantsevaluation,
        cr648_sessiongoals: editFormData.cr648_sessiongoals,
        cr648_equines: editFormData.cr648_equines,
        cr648_equipmentresources: editFormData.cr648_equipmentresources,
        cr648_taskwarmuptime: editFormData.cr648_taskwarmuptime,
        cr648_taskwarmupcoachingpointsfocusstyles: editFormData.cr648_taskwarmupcoachingpointsfocusstyles,
        cr648_taskwarmupcomment: editFormData.cr648_taskwarmupcomment,
        cr648_maincontenttime: editFormData.cr648_maincontenttime,
        cr648_maincontentcoachingpoints: editFormData.cr648_maincontentcoachingpoints,
        cr648_maincontentcomment: editFormData.cr648_maincontentcomment,
        cr648_cooldowntime: editFormData.cr648_cooldowntime,
        cr648_cooldowncoachingpoints: editFormData.cr648_cooldowncoachingpoints,
        cr648_cooldowncomment: editFormData.cr648_cooldowncomment,
        cr648_evaluationofsessionandactionfornextsession: editFormData.cr648_evaluationofsessionandactionfornextsession
      };
      
      // Format lookup field for Dataverse if participant is selected
      if (editFormData.cr648_CoachParticipantrelation) {
        updatePayload[`cr648_CoachParticipantrelation@odata.bind`] = `/cr648_participantinformations(${editFormData.cr648_CoachParticipantrelation})`;
      } else {
        updatePayload[`cr648_CoachParticipantrelation@odata.bind`] = null;
      }
      
      console.log("Updating record with payload:", updatePayload);
      await updateRecord(editingId, updatePayload);
      setEditingId(null);
      setEditFormData({});
      
      // Clear any previous errors
      clearError();
      
      console.log("Record updated successfully");
    } catch (err) {
      console.error("Save operation failed:", err);
    }
  };

  const handleDeleteRecord = async (recordIdToDelete) => {
    if (!recordIdToDelete) return;

    setIsDeleting(true);

    try {
      await deleteRecord(recordIdToDelete);
      
      // If the deleted record was being edited, cancel edit mode
      if (editingId === recordIdToDelete) {
        setEditingId(null);
        setEditFormData({});
      }
      
      clearError();
      console.log("Delete successful for record:", recordIdToDelete);
    } catch (err) {
      console.error("Delete operation failed:", err);
    } finally {
      setIsDeleting(false);
      setRecordToDelete(null); // Close dialog
    }
  };

  const openDeleteConfirmDialog = (recordId) => {
    setRecordToDelete(recordId);
  };

  const closeDeleteConfirmDialog = () => {
    setRecordToDelete(null);
  };


  const handleNewRecordChange = (event) => {
    const { name, value } = event.target;
    setNewRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateRecord = async (event) => {
    event.preventDefault();
    
    try {
      // Start with minimal required fields only
      const payload = {
        cr648_coachname: newRecord.cr648_coachname,
        cr648_date: newRecord.cr648_date
      };
      
      // Add optional fields only if they have values (excluding lookup fields)
      if (newRecord.cr648_lessonplan) payload.cr648_lessonplan = newRecord.cr648_lessonplan;
      if (newRecord.cr648_participantsevaluation) payload.cr648_participantsevaluation = newRecord.cr648_participantsevaluation;
      if (newRecord.cr648_sessiongoals) payload.cr648_sessiongoals = newRecord.cr648_sessiongoals;
      if (newRecord.cr648_equines) payload.cr648_equines = newRecord.cr648_equines;
      if (newRecord.cr648_equipmentresources) payload.cr648_equipmentresources = newRecord.cr648_equipmentresources;
      
      // Handle participant lookup field with @odata.bind format
      if (newRecord.cr648_CoachParticipantrelation) {
        payload[`cr648_CoachParticipantrelation@odata.bind`] = `/cr648_participantinformations(${newRecord.cr648_CoachParticipantrelation})`;
      }
      
      console.log("Creating record with payload:", JSON.stringify(payload, null, 2));
      await createRecord(payload);
      
      setNewRecord({
        cr648_coachname: '',
        cr648_CoachParticipantrelation: '',
        cr648_date: '',
        cr648_lessonplan: '',
        cr648_participantsevaluation: '',
        cr648_sessiongoals: '',
        cr648_equines: '',
        cr648_equipmentresources: '',
        cr648_taskwarmuptime: '',
        cr648_taskwarmupcoachingpointsfocusstyles: '',
        cr648_taskwarmupcomment: '',
        cr648_maincontenttime: '',
        cr648_maincontentcoachingpoints: '',
        cr648_maincontentcomment: '',
        cr648_cooldowntime: '',
        cr648_cooldowncoachingpoints: '',
        cr648_cooldowncomment: '',
        cr648_evaluationofsessionandactionfornextsession: ''
      });
      setShowCreateModal(false); // Close modal on success
      clearError();
      console.log("Record created successfully");
    } catch (err) {
      console.error("Create operation failed:", err);
    }
  };

  const applyFiltersAndSearch = (recordsToFilter, currentSearchTerm, lessonPlan, dateFrom, dateTo, participantEval, coachName, participantFilter) => {
    let filtered = recordsToFilter;

    // General search
    if (currentSearchTerm) {
      const search = currentSearchTerm.toLowerCase();
      filtered = filtered.filter((record) => {
        const lessonPlanText = record.cr648_lessonplan || "";
        const participantEvalText = record.cr648_participantsevaluation || "";
        const coachNameText = record.cr648_coachname || "";
        const dateText = record.cr648_date ? new Date(record.cr648_date).toLocaleDateString() : "";
        const sessionGoalsText = record.cr648_sessiongoals || "";
        const equinesText = record.cr648_equines || "";
        const equipmentText = record.cr648_equipmentresources || "";
        
        // Add participant name search
        const participant = participantRecords?.find(p => p.cr648_participantinformationid === (record.cr648_CoachParticipantrelation || record._cr648_coachparticipantrelation_value));
        const participantNameText = participant ? `${participant.cr648_firstname || ''} ${participant.cr648_lastname || ''}`.trim() : "";
        
        return (
          lessonPlanText.toLowerCase().includes(search) ||
          participantEvalText.toLowerCase().includes(search) ||
          coachNameText.toLowerCase().includes(search) ||
          dateText.includes(search) ||
          sessionGoalsText.toLowerCase().includes(search) ||
          equinesText.toLowerCase().includes(search) ||
          equipmentText.toLowerCase().includes(search) ||
          participantNameText.toLowerCase().includes(search)
        );
      });
    }
    
    // Advanced filters
    if (lessonPlan) {
      filtered = filtered.filter(record => (record.cr648_lessonplan || "").toLowerCase().includes(lessonPlan.toLowerCase()));
    }
    if (participantEval) {
      filtered = filtered.filter(record => (record.cr648_participantsevaluation || "").toLowerCase().includes(participantEval.toLowerCase()));
    }
    if (coachName) {
      filtered = filtered.filter(record => (record.cr648_coachname || "").toLowerCase().includes(coachName.toLowerCase()));
    }
    if (participantFilter) {
      filtered = filtered.filter(record => {
        const participant = participantRecords?.find(p => p.cr648_participantinformationid === (record.cr648_CoachParticipantrelation || record._cr648_coachparticipantrelation_value));
        const participantName = participant ? `${participant.cr648_firstname || ''} ${participant.cr648_lastname || ''}`.trim() : "";
        return participantName.toLowerCase().includes(participantFilter.toLowerCase());
      });
    }
    if (dateFrom) {
      filtered = filtered.filter(record => {
        const recordDate = record.cr648_date ? new Date(record.cr648_date) : null;
        // Adjust for timezone by setting hours to 0 to compare dates correctly
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0,0,0,0);
        if (recordDate) recordDate.setHours(0,0,0,0);
        return recordDate && recordDate >= fromDate;
      });
    }
    if (dateTo) {
      filtered = filtered.filter(record => {
        const recordDate = record.cr648_date ? new Date(record.cr648_date) : null;
        // Adjust for timezone by setting hours to 0 to compare dates correctly
        const toDate = new Date(dateTo);
        toDate.setHours(0,0,0,0);
        if (recordDate) recordDate.setHours(0,0,0,0);
        return recordDate && recordDate <= toDate;
      });
    }
    setCurrentFilteredRecords(filtered); // Update all filtered records
    // setCurrentPage(1); // Reset to page 1 when filters change - handled by useEffect dependency on currentFilteredRecords
  };
  
  useEffect(() => {
    applyFiltersAndSearch(allProgressRecords, searchTerm, filterLessonPlan, filterDateFrom, filterDateTo, filterParticipantEval, filterCoachName, filterParticipant);
  }, [searchTerm, filterLessonPlan, filterDateFrom, filterDateTo, filterParticipantEval, filterCoachName, filterParticipant, allProgressRecords, participantRecords]);

  useEffect(() => {
    // When filters change (currentFilteredRecords updates) or page changes, calculate the records for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setProgressRecords(currentFilteredRecords.slice(startIndex, endIndex));
    
    // If current page becomes invalid after filtering (e.g., less items), reset to page 1
    if (currentPage > 1 && startIndex >= currentFilteredRecords.length) {
        setCurrentPage(1);
    }
  }, [currentFilteredRecords, currentPage, itemsPerPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h4" component="h1">
          Coaching Sessions {/* Renamed title */}
        </Typography>
        
        {/* Network Status Indicator */}
        <Chip
          icon={isOnline ? <SyncIcon /> : <CloudOffIcon />}
          label={isOnline ? 'Online' : 'Offline'}
          color={isOnline ? 'success' : 'warning'}
          variant="outlined"
          size="small"
        />
        
        {/* Sync Status Indicator */}
        {syncStatus && (
          <Chip
            icon={syncStatus.status === 'started' ? <CircularProgress size={16} /> : <SyncIcon />}
            label={syncStatus.status === 'started' ? 'Syncing...' : 
                   syncStatus.status === 'completed' ? 'Synced' : 'Sync Failed'}
            color={syncStatus.status === 'completed' ? 'success' : 
                   syncStatus.status === 'failed' ? 'error' : 'info'}
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {error && (
        <Alert 
          severity={error.includes('offline') || error.includes('cached') ? 'warning' : 'error'} 
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      {isLoading && !progressRecords.length && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Search Records"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '40%' }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateModal(true)}
        >
          Create New Coaching Session {/* Renamed button text */}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Advanced Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth label="Lesson Plan" value={filterLessonPlan} onChange={e => setFilterLessonPlan(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth label="From Date" type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth label="To Date" type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth label="Participant Name" value={filterParticipant} onChange={e => setFilterParticipant(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth label="Participant's Evaluation" value={filterParticipantEval} onChange={e => setFilterParticipantEval(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth label="Coach Name" value={filterCoachName} onChange={e => setFilterCoachName(e.target.value)} />
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Coaching Session</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{mb: 2}}>
            Fill in the details for the new coaching session.
          </DialogContentText>
          
          {/* Basic Session Info */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Session Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField margin="dense" name="cr648_coachname" label="Coach Name" type="text" fullWidth value={newRecord.cr648_coachname} onChange={handleNewRecordChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField margin="dense" name="cr648_date" label="Session Date" type="date" fullWidth value={newRecord.cr648_date} onChange={handleNewRecordChange} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={participantRecords || []}
                getOptionLabel={(option) => 
                  `${option.cr648_firstname || ''} ${option.cr648_lastname || ''}`.trim() || 'Unnamed Participant'
                }
                value={participantRecords?.find(p => p.cr648_participantinformationid === (newRecord.cr648_CoachParticipantrelation || newRecord._cr648_coachparticipantrelation_value)) || null}
                onChange={(event, newValue) => {
                  setNewRecord(prev => ({
                    ...prev,
                    cr648_CoachParticipantrelation: newValue ? newValue.cr648_participantinformationid : ''
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="dense"
                    label="Participant *"
                    fullWidth
                    required
                    disabled={participantsLoading}
                  />
                )}
                loading={participantsLoading}
                disabled={participantsLoading}
              />
            </Grid>
          </Grid>
          
          <TextField margin="dense" name="cr648_sessiongoals" label="Session Goals" multiline rows={3} fullWidth value={newRecord.cr648_sessiongoals} onChange={handleNewRecordChange} />
          <TextField margin="dense" name="cr648_lessonplan" label="Lesson Plan" multiline rows={4} fullWidth value={newRecord.cr648_lessonplan} onChange={handleNewRecordChange} />
          
          {/* Resources */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Resources</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField margin="dense" name="cr648_equines" label="Equines Used" multiline rows={2} fullWidth value={newRecord.cr648_equines} onChange={handleNewRecordChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField margin="dense" name="cr648_equipmentresources" label="Equipment & Resources" multiline rows={2} fullWidth value={newRecord.cr648_equipmentresources} onChange={handleNewRecordChange} />
            </Grid>
          </Grid>
          
          {/* Session Structure */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Session Structure</Typography>
          
          {/* Warm-up */}
          <Typography variant="subtitle1" sx={{ mt: 1, mb: 1, color: 'primary.main' }}>Warm-up</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField margin="dense" name="cr648_taskwarmuptime" label="Duration" fullWidth value={newRecord.cr648_taskwarmuptime} onChange={handleNewRecordChange} />
            </Grid>
            <Grid item xs={12} sm={9}>
              <TextField margin="dense" name="cr648_taskwarmupcoachingpointsfocusstyles" label="Coaching Points" multiline rows={2} fullWidth value={newRecord.cr648_taskwarmupcoachingpointsfocusstyles} onChange={handleNewRecordChange} />
            </Grid>
          </Grid>
          <TextField margin="dense" name="cr648_taskwarmupcomment" label="Warm-up Comments" multiline rows={2} fullWidth value={newRecord.cr648_taskwarmupcomment} onChange={handleNewRecordChange} />
          
          {/* Main Content */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>Main Content</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField margin="dense" name="cr648_maincontenttime" label="Duration" fullWidth value={newRecord.cr648_maincontenttime} onChange={handleNewRecordChange} />
            </Grid>
            <Grid item xs={12} sm={9}>
              <TextField margin="dense" name="cr648_maincontentcoachingpoints" label="Coaching Points" multiline rows={2} fullWidth value={newRecord.cr648_maincontentcoachingpoints} onChange={handleNewRecordChange} />
            </Grid>
          </Grid>
          <TextField margin="dense" name="cr648_maincontentcomment" label="Main Content Comments" multiline rows={2} fullWidth value={newRecord.cr648_maincontentcomment} onChange={handleNewRecordChange} />
          
          {/* Cool-down */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>Cool-down</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField margin="dense" name="cr648_cooldowntime" label="Duration" fullWidth value={newRecord.cr648_cooldowntime} onChange={handleNewRecordChange} />
            </Grid>
            <Grid item xs={12} sm={9}>
              <TextField margin="dense" name="cr648_cooldowncoachingpoints" label="Coaching Points" multiline rows={2} fullWidth value={newRecord.cr648_cooldowncoachingpoints} onChange={handleNewRecordChange} />
            </Grid>
          </Grid>
          <TextField margin="dense" name="cr648_cooldowncomment" label="Cool-down Comments" multiline rows={2} fullWidth value={newRecord.cr648_cooldowncomment} onChange={handleNewRecordChange} />
          
          {/* Evaluation */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Session Evaluation</Typography>
          <TextField margin="dense" name="cr648_participantsevaluation" label="Participant's Evaluation/Notes" multiline rows={3} fullWidth value={newRecord.cr648_participantsevaluation} onChange={handleNewRecordChange} />
          <TextField margin="dense" name="cr648_evaluationofsessionandactionfornextsession" label="Session Evaluation & Actions for Next Session" multiline rows={3} fullWidth value={newRecord.cr648_evaluationofsessionandactionfornextsession} onChange={handleNewRecordChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateModal(false)} startIcon={<CancelIcon />}>Cancel</Button>
          <Button onClick={handleCreateRecord} variant="contained" startIcon={<AddIcon />} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(recordToDelete)}
        onClose={closeDeleteConfirmDialog}
        aria-labelledby="alert-dialog-title-le" // Unique ID for accessibility
        aria-describedby="alert-dialog-description-le" // Unique ID for accessibility
      >
        <DialogTitle id="alert-dialog-title-le">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description-le">
            Are you sure you want to delete this coaching session? This action cannot be undone. {/* Renamed dialog text */}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmDialog} color="primary" autoFocus>
            Cancel
          </Button>
          <Button 
            onClick={() => handleDeleteRecord(recordToDelete)} 
            color="error" 
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {!isLoading && !error && allProgressRecords.length === 0 && ( // Check allProgressRecords for initial empty state
        <Typography sx={{textAlign: 'center', my: 3}}>
          No coaching sessions found. Click "Create New Coaching Session" to add one.
        </Typography>
      )}

      {!isLoading && !error && allProgressRecords.length > 0 && currentFilteredRecords.length === 0 && ( // Check if filters result in no records
        <Typography sx={{textAlign: 'center', my: 3}}>
          No records match your current filter criteria.
        </Typography>
      )}

      {progressRecords && progressRecords.length > 0 ? (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="coaching sessions table"> {/* Renamed aria-label */}
              <TableHead sx={{ backgroundColor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Session Summary</TableCell>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Participant</TableCell>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Coach</TableCell>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {progressRecords.map((record) => (
                  record ? ( // Ensure record is not null/undefined
                    <TableRow key={record.cr648_lessonevaluationid} hover>
                      {editingId === record.cr648_lessonevaluationid && !isViewMode ? (
                        // Edit Mode - Show comprehensive edit form
                        <TableCell colSpan={5}>
                          <Box sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Edit Coaching Session</Typography>
                            
                            {/* Basic Info */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={12} sm={6}>
                                <TextField size="small" name="cr648_coachname" label="Coach Name" value={editFormData.cr648_coachname || ''} onChange={handleEditFormChange} fullWidth />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField size="small" type="date" name="cr648_date" label="Date" value={editFormData.cr648_date || ''} onChange={handleEditFormChange} fullWidth InputLabelProps={{ shrink: true }} />
                              </Grid>
                              <Grid item xs={12}>
                                <Autocomplete
                                  size="small"
                                  options={participantRecords || []}
                                  getOptionLabel={(option) => 
                                    `${option.cr648_firstname || ''} ${option.cr648_lastname || ''}`.trim() || 'Unnamed Participant'
                                  }
                                  value={participantRecords?.find(p => p.cr648_participantinformationid === (editFormData.cr648_CoachParticipantrelation || editFormData._cr648_coachparticipantrelation_value)) || null}
                                  onChange={(event, newValue) => {
                                    setEditFormData(prev => ({
                                      ...prev,
                                      cr648_CoachParticipantrelation: newValue ? newValue.cr648_participantinformationid : ''
                                    }));
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      size="small"
                                      label="Participant"
                                      fullWidth
                                      disabled={participantsLoading}
                                    />
                                  )}
                                  loading={participantsLoading}
                                  disabled={participantsLoading}
                                />
                              </Grid>
                            </Grid>
                            
                            <TextField size="small" name="cr648_sessiongoals" label="Session Goals" value={editFormData.cr648_sessiongoals || ''} onChange={handleEditFormChange} fullWidth multiline rows={2} sx={{ mb: 2 }} />
                            <TextField size="small" name="cr648_lessonplan" label="Lesson Plan" value={editFormData.cr648_lessonplan || ''} onChange={handleEditFormChange} fullWidth multiline rows={3} sx={{ mb: 2 }} />
                            
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={12} sm={6}>
                                <TextField size="small" name="cr648_equines" label="Equines" value={editFormData.cr648_equines || ''} onChange={handleEditFormChange} fullWidth multiline rows={2} />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField size="small" name="cr648_equipmentresources" label="Equipment & Resources" value={editFormData.cr648_equipmentresources || ''} onChange={handleEditFormChange} fullWidth multiline rows={2} />
                              </Grid>
                            </Grid>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                              <Button onClick={handleCancelEdit} startIcon={<CancelIcon />} variant="outlined" color="secondary">Cancel</Button>
                              <Button onClick={handleSaveEdit} startIcon={<SaveIcon />} variant="contained" color="success" disabled={isLoading}>
                                {isLoading && editingId === record.cr648_lessonevaluationid ? <CircularProgress size={20} /> : "Save"}
                              </Button>
                            </Box>
                          </Box>
                        </TableCell>
                      ) : editingId === record.cr648_lessonevaluationid && isViewMode ? (
                        // View Mode - Show comprehensive structured view
                        <TableCell colSpan={5}>
                          <Box sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Coaching Session Details</Typography>
                            
                            {/* Basic Info */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle2" color="text.secondary">Coach</Typography>
                                <Typography variant="body1">{editFormData.cr648_coachname || "N/A"}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                                <Typography variant="body1">{editFormData.cr648_date ? new Date(editFormData.cr648_date).toLocaleDateString() : "N/A"}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle2" color="text.secondary">Participant</Typography>
                                <Typography variant="body1">
                                  {(() => {
                                    const participant = participantRecords?.find(p => p.cr648_participantinformationid === editFormData.cr648_CoachParticipantrelation);
                                    return participant ? `${participant.cr648_firstname || ''} ${participant.cr648_lastname || ''}`.trim() : "N/A";
                                  })()}
                                </Typography>
                              </Grid>
                            </Grid>
                            
                            {editFormData.cr648_sessiongoals && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Session Goals</Typography>
                                <Typography variant="body1">{editFormData.cr648_sessiongoals}</Typography>
                              </Box>
                            )}
                            
                            {editFormData.cr648_lessonplan && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Lesson Plan</Typography>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{editFormData.cr648_lessonplan}</Typography>
                              </Box>
                            )}
                            
                            {(editFormData.cr648_equines || editFormData.cr648_equipmentresources) && (
                              <Grid container spacing={2} sx={{ mb: 2 }}>
                                {editFormData.cr648_equines && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Equines</Typography>
                                    <Typography variant="body1">{editFormData.cr648_equines}</Typography>
                                  </Grid>
                                )}
                                {editFormData.cr648_equipmentresources && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Equipment & Resources</Typography>
                                    <Typography variant="body1">{editFormData.cr648_equipmentresources}</Typography>
                                  </Grid>
                                )}
                              </Grid>
                            )}
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                              <Button onClick={handleCancelEdit} startIcon={<CancelIcon />} variant="outlined" color="secondary">
                                Close
                              </Button>
                            </Box>
                          </Box>
                        </TableCell>
                      ) : (
                        // Normal Mode - Summary view
                        <>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {record.cr648_lessonplan ? 
                                    (record.cr648_lessonplan.length > 100 ? 
                                      record.cr648_lessonplan.substring(0, 100) + "..." : 
                                      record.cr648_lessonplan) : 
                                    "No lesson plan"}
                                </Typography>
                                {record.cr648_equines && (
                                  <Typography variant="caption" color="text.secondary">
                                    Equines: {record.cr648_equines.length > 50 ? record.cr648_equines.substring(0, 50) + "..." : record.cr648_equines}
                                  </Typography>
                                )}
                              </Box>
                              {(record._isTemporary || record._createdOffline) && (
                                <Chip label="Offline" size="small" color="warning" variant="outlined" />
                              )}
                              {record._modifiedOffline && (
                                <Chip label="Modified" size="small" color="info" variant="outlined" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{record.cr648_date ? new Date(record.cr648_date).toLocaleDateString() : "N/A"}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {(() => {
                                const participant = participantRecords?.find(p => p.cr648_participantinformationid === (record.cr648_CoachParticipantrelation || record._cr648_coachparticipantrelation_value));
                                return participant ? `${participant.cr648_firstname || ''} ${participant.cr648_lastname || ''}`.trim() : "N/A";
                              })()}
                            </Typography>
                          </TableCell>
                          <TableCell>{record.cr648_coachname || "N/A"}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleViewRecord(record)} size="small" sx={{ mr: 1 }} aria-label="view" color="info">
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton onClick={() => handleEditRecord(record)} size="small" sx={{ mr: 1 }} aria-label="edit" color="primary">
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              onClick={() => openDeleteConfirmDialog(record.cr648_lessonevaluationid)} 
                              size="small" 
                              color="error" 
                              aria-label="delete"
                             >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ) : null
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {currentFilteredRecords.length > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={Math.ceil(currentFilteredRecords.length / itemsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                variant="outlined"
                shape="rounded"
                color="primary"
                size="medium"
              />
            </Box>
          )}
          </>
      ) : (
        // This specific message might be redundant due to the checks above, but kept for safety.
        // Consider removing if the above two Typography blocks cover all "no records" scenarios.
        !isLoading && !error && allProgressRecords.length > 0 && currentFilteredRecords.length > 0 && progressRecords.length === 0 && 
        <Typography sx={{ mt: 2, textAlign: 'center' }}>No coaching session records for the current page.</Typography>
      )}
    </Container>
  );
};

export default CoachingSessions; // Renamed export
