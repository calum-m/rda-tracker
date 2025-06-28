import React, { useEffect, useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import {
  Pagination,
  Box,
  Button,
  IconButton,
  Container,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const dataverseUrl = process.env.REACT_APP_DATAVERSE_URL;

const DataverseCaller = () => {
  const { instance, accounts } = useMsal();
  const [progressRecords, setProgressRecords] = useState([]);
  const [allProgressRecords, setAllProgressRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [newRecord, setNewRecord] = useState({
    cr648_lessonplan: '',
    cr648_date: '',
    cr648_participantsevaluation: '',
    cr648_coachname: ''
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLessonPlan, setFilterLessonPlan] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterParticipantEval, setFilterParticipantEval] = useState("");
  const [filterCoachName, setFilterCoachName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [userMessage, setUserMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    if (accounts.length === 0) return;
    setIsLoading(true);
    setUserMessage({ text: '', type: '' });
    const request = {
      scopes: [`${dataverseUrl}/.default`],
      account: accounts[0]
    };
    try {
      const response = await instance.acquireTokenSilent(request);
      const token = response.accessToken;
      let filterClauses = [];
      if (searchTerm) {
        filterClauses.push(`contains(cr648_lessonplan, '''${searchTerm.replace(/'/g, "''")}''')`);
      }
      if (filterLessonPlan) {
        filterClauses.push(`cr648_lessonplan eq '''${filterLessonPlan.replace(/'/g, "''")}''')`);
      }
      if (filterDateFrom) {
        filterClauses.push(`cr648_date ge ${filterDateFrom}`);
      }
      if (filterDateTo) {
        filterClauses.push(`cr648_date le ${filterDateTo}`);
      }
      if (filterParticipantEval) {
        filterClauses.push(`contains(cr648_participantsevaluation, '''${filterParticipantEval.replace(/'/g, "''")}''')`);
      }
      if (filterCoachName) {
        filterClauses.push(`contains(cr648_coachname, '''${filterCoachName.replace(/'/g, "''")}''')`);
      }
      const filterQuery = filterClauses.join(' and ');
      let apiUrl = `${dataverseUrl}/api/data/v9.2/cr648_lessonevaluations?$count=true`;
      if (filterQuery) {
        apiUrl += `&$filter=${filterQuery}`;
      }
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'odata.include-annotations="OData.Community.Display.V1.FormattedValue",odata.maxpagesize=50'
        }
      });
      if (!res.ok) {
        const errData = await res.json();
        console.error("Fetch failed with status:", res.status, errData);
        setUserMessage({ text: `Error fetching records: ${errData.error?.message || res.statusText}`, type: 'error' });
        setProgressRecords([]);
        setAllProgressRecords([]);
        setTotalRecords(0);
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      const allData = data.value || [];
      setAllProgressRecords(allData);
      setTotalRecords(allData.length);
    } catch (err) {
      console.error("Fetch operation failed:", err);
      setUserMessage({ text: `Error during fetch operation: ${err.message}`, type: 'error' });
      setProgressRecords([]);
      setAllProgressRecords([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [accounts, instance, searchTerm, filterLessonPlan, filterDateFrom, filterDateTo, filterParticipantEval, filterCoachName]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    if (allProgressRecords.length > 0) {
      const startIndex = (currentPage - 1) * recordsPerPage;
      const endIndex = startIndex + recordsPerPage;
      const paginatedData = allProgressRecords.slice(startIndex, endIndex);
      setProgressRecords(paginatedData);
    } else {
      setProgressRecords([]);
    }
  }, [currentPage, allProgressRecords, recordsPerPage]);

  const handleEdit = (record) => {
    setEditingId(record.cr648_lessonevaluationid);
    setEditFormData({
      cr648_lessonplan: record.cr648_lessonplan,
      cr648_date: record.cr648_date.split('T')[0],
      cr648_participantsevaluation: record.cr648_participantsevaluation,
      cr648_coachname: record.cr648_coachname
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateRecord = (record) => {
    if (!record.cr648_lessonplan || record.cr648_lessonplan.trim() === "") {
      setUserMessage({ text: "Lesson Plan is required.", type: 'error' });
      return false;
    }
    if (!record.cr648_date) {
      setUserMessage({ text: "Date is required.", type: 'error' });
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recordDate = new Date(record.cr648_date);
    if (recordDate > today) {
      setUserMessage({ text: "Date cannot be in the future.", type: 'error' });
      return false;
    }
    return true;
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setUserMessage({ text: '', type: '' });
    if (!validateRecord(editFormData)) {
      return;
    }
    const request = {
      scopes: [`${dataverseUrl}/.default`],
      account: accounts[0]
    };
    try {
      const response = await instance.acquireTokenSilent(request);
      const token = response.accessToken;
      const apiResponse = await fetch(`${dataverseUrl}/api/data/v9.2/cr648_lessonevaluations(${editingId})`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        setUserMessage({ text: `Update failed: ${errorData.error?.message || apiResponse.statusText}`, type: 'error' });
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }
      fetchRecords();
      setEditingId(null);
      setEditFormData({});
      setUserMessage({ text: "Record updated successfully!", type: 'success' });
    } catch (err) {
      console.error("Save operation failed:", err);
      if (!userMessage.text) {
        setUserMessage({ text: `Save operation failed: ${err.message}`, type: 'error' });
      }
    }
  };

  const handleNewRecordChange = (event) => {
    const { name, value } = event.target;
    setNewRecord((prevRecord) => ({
      ...prevRecord,
      [name]: value
    }));
  };

  const handleCreateRecord = async (event) => {
    event.preventDefault();
    setUserMessage({ text: '', type: '' });
    if (!validateRecord(newRecord)) {
      return;
    }
    if (accounts.length === 0) {
      setUserMessage({ text: "No active account. Please log in.", type: 'error' });
      return;
    }
    const request = {
      scopes: [`${dataverseUrl}/.default`],
      account: accounts[0]
    };
    try {
      const response = await instance.acquireTokenSilent(request);
      const token = response.accessToken;
      const apiResponse = await fetch(`${dataverseUrl}/api/data/v9.2/cr648_lessonevaluations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRecord)
      });
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        setUserMessage({ text: `Create failed: ${errorData.error?.message || apiResponse.statusText}`, type: 'error' });
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }
      fetchRecords();
      setCurrentPage(1);
      setNewRecord({ cr648_lessonplan: '', cr648_date: '', cr648_participantsevaluation: '', cr648_coachname: '' });
      setUserMessage({ text: "Record created successfully!", type: 'success' });
    } catch (err) {
      console.error("Create operation failed:", err);
      if (!userMessage.text) {
        setUserMessage({ text: `Create operation failed: ${err.message}`, type: 'error' });
      }
    }
  };

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    if (name === "searchTerm") setSearchTerm(value);
    else if (name === "filterLessonPlan") setFilterLessonPlan(value);
    else if (name === "filterDateFrom") setFilterDateFrom(value);
    else if (name === "filterDateTo") setFilterDateTo(value);
    else if (name === "filterParticipantEval") setFilterParticipantEval(value);
    else if (name === "filterCoachName") setFilterCoachName(value);
    setCurrentPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Lesson Evaluations
      </Typography>

      {userMessage.text && (
        <Alert severity={userMessage.type === 'error' ? 'error' : 'success'} sx={{ mb: 2 }}>
          {userMessage.text}
        </Alert>
      )}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading records...</Typography>
        </Box>
      )}

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'grey.200', bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>Search & Filter Records</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Search Lesson Plan (contains)" name="searchTerm" value={searchTerm} onChange={handleSearchChange} variant="outlined" size="small" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Lesson Plan (exact)" name="filterLessonPlan" value={filterLessonPlan} onChange={handleSearchChange} variant="outlined" size="small" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Date From" name="filterDateFrom" type="date" value={filterDateFrom} onChange={handleSearchChange} variant="outlined" size="small" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Date To" name="filterDateTo" type="date" value={filterDateTo} onChange={handleSearchChange} variant="outlined" size="small" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Participant's Eval (contains)" name="filterParticipantEval" value={filterParticipantEval} onChange={handleSearchChange} variant="outlined" size="small" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Coach Name (contains)" name="filterCoachName" value={filterCoachName} onChange={handleSearchChange} variant="outlined" size="small" />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'grey.200', bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>Create New Record</Typography>
        <Box component="form" onSubmit={handleCreateRecord} noValidate>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth required label="Lesson Plan" name="cr648_lessonplan" value={newRecord.cr648_lessonplan} onChange={handleNewRecordChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth required label="Date" name="cr648_date" type="date" value={newRecord.cr648_date} onChange={handleNewRecordChange} variant="outlined" size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Participant's Evaluation" name="cr648_participantsevaluation" value={newRecord.cr648_participantsevaluation} onChange={handleNewRecordChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Coach Name" name="cr648_coachname" value={newRecord.cr648_coachname} onChange={handleNewRecordChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Create Record
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200' }}>
        <Table sx={{ minWidth: 650 }} aria-label="lesson evaluations table">
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Lesson Plan</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Participant's Evaluation</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Coach Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {progressRecords.map((record) => (
              <TableRow key={record.cr648_lessonevaluationid}>
                <TableCell>
                  {editingId === record.cr648_lessonevaluationid ? (
                    <TextField size="small" fullWidth name="cr648_lessonplan" value={editFormData.cr648_lessonplan || ''} onChange={handleEditFormChange} required />
                  ) : (record['cr648_lessonplan@OData.Community.Display.V1.FormattedValue'] || record.cr648_lessonplan)}
                </TableCell>
                <TableCell>
                  {editingId === record.cr648_lessonevaluationid ? (
                    <TextField size="small" fullWidth name="cr648_date" type="date" value={editFormData.cr648_date || ''} onChange={handleEditFormChange} required InputLabelProps={{ shrink: true }} />
                  ) : (record['cr648_date@OData.Community.Display.V1.FormattedValue'] || new Date(record.cr648_date).toLocaleDateString())}
                </TableCell>
                <TableCell>
                  {editingId === record.cr648_lessonevaluationid ? (
                    <TextField size="small" fullWidth name="cr648_participantsevaluation" value={editFormData.cr648_participantsevaluation || ''} onChange={handleEditFormChange} />
                  ) : (record['cr648_participantsevaluation@OData.Community.Display.V1.FormattedValue'] || record.cr648_participantsevaluation)}
                </TableCell>
                <TableCell>
                  {editingId === record.cr648_lessonevaluationid ? (
                    <TextField size="small" fullWidth name="cr648_coachname" value={editFormData.cr648_coachname || ''} onChange={handleEditFormChange} />
                  ) : (record['cr648_coachname@OData.Community.Display.V1.FormattedValue'] || record.cr648_coachname)}
                </TableCell>
                <TableCell>
                  {editingId === record.cr648_lessonevaluationid ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button onClick={handleSaveEdit} variant="contained" color="success" startIcon={<SaveIcon />} size="small">
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outlined" color="secondary" startIcon={<CancelIcon />} size="small">
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <IconButton onClick={() => handleEdit(record)} size="small" color="primary" aria-label="edit">
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(totalRecords / recordsPerPage) || 1}
          page={currentPage}
          onChange={(event, value) => setCurrentPage(value)}
          variant="outlined"
          shape="rounded"
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default DataverseCaller;