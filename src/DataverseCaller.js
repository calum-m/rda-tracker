import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import { useMsal } from '@azure/msal-react';
import { Pagination, Box, Button, IconButton } from '@mui/material'; // Import Pagination, Box, Button, and IconButton
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material'; // Import icons

const dataverseUrl = process.env.REACT_APP_DATAVERSE_URL;

const DataverseCaller = () => {
  const { instance, accounts } = useMsal();
  const [progressRecords, setProgressRecords] = useState([]);
  const [allProgressRecords, setAllProgressRecords] = useState([]); // Store all fetched data for client-side pagination
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [newRecord, setNewRecord] = useState({
    cr648_lessonplan: '',
    cr648_date: '',
    cr648_participantsevaluation: '',
    cr648_coachname: ''
  });
  // Filter states
  const [searchTerm, setSearchTerm] = useState(""); // General search, primarily for lesson plan
  const [filterLessonPlan, setFilterLessonPlan] = useState(""); // Specific lesson plan filter
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterParticipantEval, setFilterParticipantEval] = useState("");
  const [filterCoachName, setFilterCoachName] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // New state for user-facing messages (errors, successes)
  const [userMessage, setUserMessage] = useState({ text: '', type: '' }); // type can be 'error' or 'success'
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
        filterClauses.push(`contains(cr648_lessonplan, '''${searchTerm.replace(/'/g, "''")}'')`);
      }
      if (filterLessonPlan) {
        filterClauses.push(`cr648_lessonplan eq '''${filterLessonPlan.replace(/'/g, "''")}'')`);
      }
      if (filterDateFrom) {
        filterClauses.push(`cr648_date ge ${filterDateFrom}`);
      }
      if (filterDateTo) {
        filterClauses.push(`cr648_date le ${filterDateTo}`);
      }
      if (filterParticipantEval) {
        filterClauses.push(`contains(cr648_participantsevaluation, '''${filterParticipantEval.replace(/'/g, "''")}'')`);
      }
      if (filterCoachName) {
        filterClauses.push(`contains(cr648_coachname, '''${filterCoachName.replace(/'/g, "''")}'')`);
      }
      
      const filterQuery = filterClauses.join(' and ');
      
      // Note: $skip is not supported in some CRM environments, so we'll fetch all data and paginate client-side
      let apiUrl = `${dataverseUrl}/api/data/v9.2/cr648_lessonevaluations?$count=true`;
      if (filterQuery) {
        apiUrl += `&$filter=${filterQuery}`;
      }
      // Add order by if needed, e.g., &$orderby=cr648_date desc

      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'odata.include-annotations="OData.Community.Display.V1.FormattedValue",odata.maxpagesize=50' // Request formatted values and count
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
      
      // Store all data for client-side pagination
      setAllProgressRecords(allData);
      setTotalRecords(allData.length); // Use actual fetched data length
      // console.log("Fetched data from Dataverse:", data);

    } catch (err) {
      console.error("Fetch operation failed:", err);
      setUserMessage({ text: `Error during fetch operation: ${err.message}`, type: 'error' });
      setProgressRecords([]);
      setAllProgressRecords([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [accounts, instance, dataverseUrl, recordsPerPage, searchTerm, filterLessonPlan, filterDateFrom, filterDateTo, filterParticipantEval, filterCoachName]); // Removed page from dependencies since we handle pagination client-side

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]); // Re-fetch when search/filter changes

  // Handle pagination changes (client-side)
  useEffect(() => {
    if (allProgressRecords.length > 0) {
      const startIndex = (currentPage - 1) * recordsPerPage;
      const endIndex = startIndex + recordsPerPage;
      const paginatedData = allProgressRecords.slice(startIndex, endIndex);
      setProgressRecords(paginatedData);
    }
  }, [currentPage, allProgressRecords, recordsPerPage]);

  const handleEdit = (record) => {
    setEditingId(record.cr648_lessonevaluationid);
    setEditFormData({
      cr648_lessonplan: record.cr648_lessonplan,
      cr648_date: record.cr648_date.split('T')[0], // Simplified date handling
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

  // Helper function to validate record data
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
    today.setHours(0, 0, 0, 0); // Normalize today's date
    const recordDate = new Date(record.cr648_date);
    if (recordDate > today) {
      setUserMessage({ text: "Date cannot be in the future.", type: 'error' });
      return false;
    }
    // Add more validation rules as needed (e.g., length, format)
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
        body: JSON.stringify({
          cr648_lessonplan: editFormData.cr648_lessonplan,
          cr648_date: editFormData.cr648_date,
          cr648_participantsevaluation: editFormData.cr648_participantsevaluation,
          cr648_coachname: editFormData.cr648_coachname
        })
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error("Update failed with status:", apiResponse.status, errorData);
        setUserMessage({ text: `Update failed: ${errorData.error?.message || apiResponse.statusText}`, type: 'error' });
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }

      // const updatedRecord = await apiResponse.json(); // PATCH might return 204 No Content
      // Instead of relying on returned record, re-fetch to get the latest data
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
        body: JSON.stringify({
          cr648_lessonplan: newRecord.cr648_lessonplan,
          cr648_date: newRecord.cr648_date,
          cr648_participantsevaluation: newRecord.cr648_participantsevaluation,
          cr648_coachname: newRecord.cr648_coachname
        })
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error("Create failed with status:", apiResponse.status, errorData);
        setUserMessage({ text: `Create failed: ${errorData.error?.message || apiResponse.statusText}`, type: 'error' });
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }
      // const createdRecord = await apiResponse.json(); // POST returns 201 with the created record
      // To ensure pagination and total count is correct, re-fetch.
      // If new record should appear on first page, set currentPage to 1.
      fetchRecords();
      setCurrentPage(1); // Go to first page to see the new record
      setNewRecord({
        cr648_lessonplan: '',
        cr648_date: '',
        cr648_participantsevaluation: '',
        cr648_coachname: ''
      });
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
    // Update the respective filter state
    // Reset to page 1 when filters change
    if (name === "searchTerm") setSearchTerm(value);
    else if (name === "filterLessonPlan") setFilterLessonPlan(value);
    else if (name === "filterDateFrom") setFilterDateFrom(value);
    else if (name === "filterDateTo") setFilterDateTo(value);
    else if (name === "filterParticipantEval") setFilterParticipantEval(value);
    else if (name === "filterCoachName") setFilterCoachName(value);
    setCurrentPage(1); // Reset to page 1 on any filter change
  };

  // Client-side filtering is removed. progressRecords now holds the current page's data.
  // const filteredRecords = progressRecords.filter((record) => { ... });
  // const indexOfLastRecord = currentPage * recordsPerPage;
  // const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  // const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  // The 'currentRecords' variable can be replaced by 'progressRecords' directly in the map function.

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Lesson Evaluations</h2>

      {/* User Message Display */}
      {userMessage.text && (
        <div className={`p-3 mb-4 rounded-md ${userMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
          {userMessage.text}
        </div>
      )}
      {isLoading && <div className="p-3 mb-4 rounded-md bg-blue-100 text-blue-700 border border-blue-300">Loading records...</div>}

      {/* Search box - names should match the new handler logic */}
      <div className="mb-4 p-4 rounded-lg bg-gray-50 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Search & Filter Records</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input type="text" name="searchTerm" placeholder="Search Lesson Plan (contains)" value={searchTerm} onChange={handleSearchChange} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="filterLessonPlan" placeholder="Lesson Plan (exact)" value={filterLessonPlan} onChange={handleSearchChange} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="date" name="filterDateFrom" placeholder="Date From" value={filterDateFrom} onChange={handleSearchChange} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="date" name="filterDateTo" placeholder="Date To" value={filterDateTo} onChange={handleSearchChange} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="filterParticipantEval" placeholder="Participant's Eval (contains)" value={filterParticipantEval} onChange={handleSearchChange} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="filterCoachName" placeholder="Coach Name (contains)" value={filterCoachName} onChange={handleSearchChange} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      </div>

      {/* Create record form */}
      <form onSubmit={handleCreateRecord} className="mb-6 border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Create New Record</h3>
        <div className="flex flex-wrap gap-4 mb-2">
          <input type="text" name="cr648_lessonplan" placeholder="Lesson Plan *" value={newRecord.cr648_lessonplan} onChange={handleNewRecordChange} required className="p-2 border border-gray-300 rounded flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="date" name="cr648_date" placeholder="Date *" value={newRecord.cr648_date} onChange={handleNewRecordChange} required className="p-2 border border-gray-300 rounded flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="cr648_participantsevaluation" placeholder="Participant's Evaluation" value={newRecord.cr648_participantsevaluation} onChange={handleNewRecordChange} className="p-2 border border-gray-300 rounded flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="cr648_coachname" placeholder="Coach Name" value={newRecord.cr648_coachname} onChange={handleNewRecordChange} className="p-2 border border-gray-300 rounded flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 1 }}>
          Create Record
        </Button>
      </form>

      {/* Records table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Lesson Plan</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Participant's Evaluation</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Coach Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {progressRecords.map((record) => ( // Changed from currentRecords to progressRecords
              <tr key={record.cr648_lessonevaluationid}>
                <td className="py-2 px-4 border-b">{editingId === record.cr648_lessonevaluationid ? (
                  <input type="text" name="cr648_lessonplan" value={editFormData.cr648_lessonplan || ''} onChange={handleEditFormChange} required className="p-1 border border-gray-300 rounded w-full" />
                ) : record['cr648_lessonplan@OData.Community.Display.V1.FormattedValue'] || record.cr648_lessonplan}</td>
                <td className="py-2 px-4 border-b">{editingId === record.cr648_lessonevaluationid ? (
                  <input type="date" name="cr648_date" value={editFormData.cr648_date || ''} onChange={handleEditFormChange} required className="p-1 border border-gray-300 rounded w-full" />
                ) : record['cr648_date@OData.Community.Display.V1.FormattedValue'] || new Date(record.cr648_date).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{editingId === record.cr648_lessonevaluationid ? (
                  <input type="text" name="cr648_participantsevaluation" value={editFormData.cr648_participantsevaluation || ''} onChange={handleEditFormChange} className="p-1 border border-gray-300 rounded w-full" />
                ) : record['cr648_participantsevaluation@OData.Community.Display.V1.FormattedValue'] || record.cr648_participantsevaluation}</td>
                <td className="py-2 px-4 border-b">{editingId === record.cr648_lessonevaluationid ? (
                  <input type="text" name="cr648_coachname" value={editFormData.cr648_coachname || ''} onChange={handleEditFormChange} className="p-1 border border-gray-300 rounded w-full" />
                ) : record['cr648_coachname@OData.Community.Display.V1.FormattedValue'] || record.cr648_coachname}</td>
                <td className="py-2 px-4 border-b">
                  {editingId === record.cr648_lessonevaluationid ? (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} variant="contained" color="success" startIcon={<SaveIcon />} size="small" sx={{ mr: 1 }}>
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outlined" color="secondary" startIcon={<CancelIcon />} size="small">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <IconButton onClick={() => handleEdit(record)} size="small" color="primary" aria-label="edit">
                      <EditIcon />
                    </IconButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}> {/* Material-UI Box for pagination container */}
        <Pagination
          count={Math.ceil(totalRecords / recordsPerPage) || 1} // Ensure count is at least 1
          page={currentPage}
          onChange={(event, value) => setCurrentPage(value)}
          variant="outlined"
          shape="rounded"
          color="primary"
          size="medium"
        />
      </Box>
    </div>
  );
};

export default DataverseCaller;