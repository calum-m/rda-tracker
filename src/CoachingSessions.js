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
  Chip // Added Chip for offline indicators
} from "@mui/material";
import { Edit as EditIcon, Save as SaveIcon, Add as AddIcon, Cancel as CancelIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, CloudOff as CloudOffIcon, Sync as SyncIcon } from '@mui/icons-material'; // Added offline icons
import Pagination from '@mui/material/Pagination'; // Import Pagination
import useOfflineData from './hooks/useOfflineData'; // Import offline data hook

// Dataverse URL from environment variable
const dataverseUrl = process.env.REACT_APP_DATAVERSE_URL;

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
  } = useOfflineData(dataverseUrl, 'cr648_new_lessonevaluations', 'cr648_new_lessonevaluationid');

  const [progressRecords, setProgressRecords] = useState([]);
  const [currentFilteredRecords, setCurrentFilteredRecords] = useState([]); // Holds all records matching filters, before pagination
  const [editingId, setEditingId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false); // Track if we're in view mode vs edit mode
  const [editFormData, setEditFormData] = useState({});
  const [newRecord, setNewRecord] = useState({
    cr648_lessonplan: '',
    cr648_date: '',
    cr648_participantsevaluation: '',
    cr648_coachname: ''
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

  // Initial data fetch
  useEffect(() => {
    fetchData(true, 'createdon desc');
  }, [fetchData]);

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
        cr648_lessonplan: editFormData.cr648_lessonplan,
        cr648_date: editFormData.cr648_date,
        cr648_participantsevaluation: editFormData.cr648_participantsevaluation,
        cr648_coachname: editFormData.cr648_coachname,
      };
      
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
      const payload = { ...newRecord };
      await createRecord(payload);
      
      setNewRecord({
        cr648_lessonplan: '',
        cr648_date: '',
        cr648_participantsevaluation: '',
        cr648_coachname: ''
      });
      setShowCreateModal(false); // Close modal on success
      clearError();
      console.log("Record created successfully");
    } catch (err) {
      console.error("Create operation failed:", err);
    }
  };

  const applyFiltersAndSearch = (recordsToFilter, currentSearchTerm, lessonPlan, dateFrom, dateTo, participantEval, coachName) => {
    let filtered = recordsToFilter;

    // General search
    if (currentSearchTerm) {
      const search = currentSearchTerm.toLowerCase();
      filtered = filtered.filter((record) => {
        const lessonPlanText = record.cr648_lessonplan || "";
        const participantEvalText = record.cr648_participantsevaluation || "";
        const coachNameText = record.cr648_coachname || "";
        const dateText = record.cr648_date ? new Date(record.cr648_date).toLocaleDateString() : "";
        return (
          lessonPlanText.toLowerCase().includes(search) ||
          participantEvalText.toLowerCase().includes(search) ||
          coachNameText.toLowerCase().includes(search) ||
          dateText.includes(search)
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
    applyFiltersAndSearch(allProgressRecords, searchTerm, filterLessonPlan, filterDateFrom, filterDateTo, filterParticipantEval, filterCoachName);
  }, [searchTerm, filterLessonPlan, filterDateFrom, filterDateTo, filterParticipantEval, filterCoachName, allProgressRecords]);

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
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField fullWidth label="Lesson Plan" value={filterLessonPlan} onChange={e => setFilterLessonPlan(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField fullWidth label="From Date" type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField fullWidth label="To Date" type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField fullWidth label="Participant's Evaluation" value={filterParticipantEval} onChange={e => setFilterParticipantEval(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField fullWidth label="Coach Name" value={filterCoachName} onChange={e => setFilterCoachName(e.target.value)} />
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <DialogTitle>Create New Coaching Session</DialogTitle> {/* Renamed dialog title */}
        <DialogContent>
          <DialogContentText sx={{mb: 2}}>
            Fill in the details for the new coaching session. {/* Renamed dialog text */}
          </DialogContentText>
          <TextField autoFocus margin="dense" name="cr648_lessonplan" label="Coaching Session Details" type="text" fullWidth variant="standard" value={newRecord.cr648_lessonplan} onChange={handleNewRecordChange} required /> {/* Renamed label */}
          <TextField margin="dense" name="cr648_date" label="Date" type="date" fullWidth variant="standard" value={newRecord.cr648_date} onChange={handleNewRecordChange} InputLabelProps={{ shrink: true }} required />
          <TextField margin="dense" name="cr648_participantsevaluation" label="Participant's Evaluation/Notes" type="text" fullWidth variant="standard" value={newRecord.cr648_participantsevaluation} onChange={handleNewRecordChange} />
          <TextField margin="dense" name="cr648_coachname" label="Coach Name" type="text" fullWidth variant="standard" value={newRecord.cr648_coachname} onChange={handleNewRecordChange} />
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
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Coaching Session Details</TableCell> {/* Renamed table header */}
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Participant's Evaluation/Notes</TableCell>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Coach Name</TableCell>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {progressRecords.map((record) => (
                  record ? ( // Ensure record is not null/undefined
                    <TableRow key={record.cr648_lessonevaluationid} hover>
                      {editingId === record.cr648_lessonevaluationid && !isViewMode ? (
                        // Edit Mode - Editable fields
                        <>
                          <TableCell><TextField size="small" name="cr648_lessonplan" value={editFormData.cr648_lessonplan || ''} onChange={handleEditFormChange} fullWidth /></TableCell>
                          <TableCell><TextField size="small" type="date" name="cr648_date" value={editFormData.cr648_date || ''} onChange={handleEditFormChange} fullWidth InputLabelProps={{ shrink: true }} /></TableCell>
                          <TableCell><TextField size="small" name="cr648_participantsevaluation" value={editFormData.cr648_participantsevaluation || ''} onChange={handleEditFormChange} fullWidth /></TableCell>
                          <TableCell><TextField size="small" name="cr648_coachname" value={editFormData.cr648_coachname || ''} onChange={handleEditFormChange} fullWidth /></TableCell>
                          <TableCell>
                            <Button onClick={handleSaveEdit} startIcon={<SaveIcon />} variant="contained" color="success" sx={{ mr: 1 }} disabled={isLoading}>
                              {isLoading && editingId === record.cr648_lessonevaluationid ? <CircularProgress size={20} /> : "Save"}
                            </Button>
                            <Button onClick={handleCancelEdit} startIcon={<CancelIcon />} variant="outlined" color="secondary" sx={{mr: 1}}>Cancel</Button>
                          </TableCell>
                        </>
                      ) : editingId === record.cr648_lessonevaluationid && isViewMode ? (
                        // View Mode - Read-only formatted display
                        <>
                          <TableCell>
                            <Typography variant="body1" sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                              {editFormData.cr648_lessonplan || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                              {editFormData.cr648_date ? new Date(editFormData.cr648_date).toLocaleDateString() : "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                              {editFormData.cr648_participantsevaluation || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                              {editFormData.cr648_coachname || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button onClick={handleCancelEdit} startIcon={<CancelIcon />} variant="outlined" color="secondary">
                              Close
                            </Button>
                          </TableCell>
                        </>
                      ) : (
                        // Normal Mode - Collapsed view
                        <>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {record.cr648_lessonplan || "N/A"}
                              {(record._isTemporary || record._createdOffline) && (
                                <Chip label="Offline" size="small" color="warning" variant="outlined" />
                              )}
                              {record._modifiedOffline && (
                                <Chip label="Modified" size="small" color="info" variant="outlined" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{record.cr648_date ? new Date(record.cr648_date).toLocaleDateString() : "N/A"}</TableCell>
                          <TableCell>{record.cr648_participantsevaluation || "N/A"}</TableCell>
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
