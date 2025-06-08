import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';

const dataverseUrl = process.env.REACT_APP_DATAVERSE_URL;

const DataverseCaller = () => {
  const { instance, accounts } = useMsal();
  const [progressRecords, setProgressRecords] = useState([]);
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

  // New state for user-facing messages (errors, successes)
  const [userMessage, setUserMessage] = useState({ text: '', type: '' }); // type can be 'error' or 'success'
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    if (accounts.length === 0) return;

    setIsLoading(true); 
    setUserMessage({ text: '', type: '' }); // Clear previous messages

    const request = {
      scopes: [`${dataverseUrl}/.default`], // Corrected scope
      account: accounts[0]
    };

    instance
      .acquireTokenSilent(request)
      .then((response) => {
        const token = response.accessToken;
        fetch(`${dataverseUrl}/api/data/v9.2/cr648_lessonevaluations`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'odata.include-annotations="*"'
          }
        })
          .then((res) => {
            if (!res.ok) {
              return res.json().then(errData => {
                console.error("Fetch failed with status:", res.status, errData);
                setUserMessage({ text: `Error fetching records: ${errData.error?.message || res.statusText}`, type: 'error' });
                return { value: [] };
              });
            }
            return res.json();
          })
          .then((data) => {
            setProgressRecords(data.value || []);
            // console.log("Fetched data from Dataverse:", data); // Keep for debugging if needed
          })
          .catch((err) => {
            console.error("Fetch processing failed:", err);
            setUserMessage({ text: `Error processing fetched records: ${err.message}`, type: 'error' });
            setProgressRecords([]);
          })
          .finally(() => setIsLoading(false));
      })
      .catch((err) => {
        console.error("Token acquisition failed:", err);
        setUserMessage({ text: `Token acquisition failed: ${err.message}`, type: 'error' });
        setProgressRecords([]);
        setIsLoading(false);
      });
  }, [accounts, instance]);

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
    setUserMessage({ text: '', type: '' }); // Clear previous messages

    if (!validateRecord(editFormData)) {
      return; // Validation failed
    }

    const request = {
      scopes: [`${dataverseUrl}/.default`], // Corrected scope
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

      const updatedRecord = await apiResponse.json();
      setProgressRecords((prevRecords) =>
        prevRecords.map((rec) =>
          rec.cr648_lessonevaluationid === editingId ? updatedRecord : rec
        )
      );
      setEditingId(null);
      setEditFormData({});
      setUserMessage({ text: "Record updated successfully!", type: 'success' });
      // console.log("Record updated successfully:", updatedRecord);
    } catch (err) {
      console.error("Save operation failed:", err);
      // setUserMessage is already set if it's an API error, otherwise set a generic one
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
    setUserMessage({ text: '', type: '' }); // Clear previous messages

    if (!validateRecord(newRecord)) {
      return; // Validation failed
    }

    if (accounts.length === 0) {
      setUserMessage({ text: "No active account. Please log in.", type: 'error' });
      return;
    }

    const request = {
      scopes: [`${dataverseUrl}/.default`], // Corrected scope
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
      const createdRecord = await apiResponse.json();
      setProgressRecords((prev) => [createdRecord, ...prev]);
      setNewRecord({
        cr648_lessonplan: '',
        cr648_date: '',
        cr648_participantsevaluation: '',
        cr648_coachname: ''
      });
      setUserMessage({ text: "Record created successfully!", type: 'success' });
      // console.log("Record created successfully:", createdRecord);
    } catch (err) {
      console.error("Create operation failed:", err);
      if (!userMessage.text) {
        setUserMessage({ text: `Create operation failed: ${err.message}`, type: 'error' });
      }
    }
  };

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    setSearchTerm(value);

    // Simple client-side filtering
    if (name === "lessonPlan") {
      setFilterLessonPlan(value);
    } else if (name === "dateFrom") {
      setFilterDateFrom(value);
    } else if (name === "dateTo") {
      setFilterDateTo(value);
    } else if (name === "participantEval") {
      setFilterParticipantEval(value);
    } else if (name === "coachName") {
      setFilterCoachName(value);
    }
  };

  const filteredRecords = progressRecords.filter((record) => {
    return (
      record.cr648_lessonplan.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!filterLessonPlan || record.cr648_lessonplan === filterLessonPlan) &&
      (!filterDateFrom || new Date(record.cr648_date) >= new Date(filterDateFrom)) &&
      (!filterDateTo || new Date(record.cr648_date) <= new Date(filterDateTo)) &&
      (!filterParticipantEval || record.cr648_participantsevaluation === filterParticipantEval) &&
      (!filterCoachName || record.cr648_coachname === filterCoachName)
    );
  });

  // Optional: Handle loading and error states in the UI
  // if (isLoading) return <div>Loading records...</div>; // Replaced by inline message
  // if (error) return <div>Error loading records: {error}</div>; // Replaced by inline message

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

      {/* Search box */}
      <div className="mb-4 p-4 rounded-lg bg-gray-50 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Search Records</h3>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="lessonPlan" placeholder="Lesson Plan" value={searchTerm} onChange={handleSearchChange} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="date" name="dateFrom" placeholder="Date From" value={filterDateFrom} onChange={handleSearchChange} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="date" name="dateTo" placeholder="Date To" value={filterDateTo} onChange={handleSearchChange} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="participantEval" placeholder="Participant's Evaluation" value={filterParticipantEval} onChange={handleSearchChange} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="coachName" placeholder="Coach Name" value={filterCoachName} onChange={handleSearchChange} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
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
        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
          Create Record
        </button>
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
            {filteredRecords.map((record) => (
              <tr key={record.cr648_lessonevaluationid}>
                <td className="py-2 px-4 border-b">{editingId === record.cr648_lessonevaluationid ? (
                  <input type="text" name="cr648_lessonplan" value={editFormData.cr648_lessonplan || ''} onChange={handleEditFormChange} required className="p-1 border border-gray-300 rounded w-full" />
                ) : record.cr648_lessonplan}</td>
                <td className="py-2 px-4 border-b">{editingId === record.cr648_lessonevaluationid ? (
                  <input type="date" name="cr648_date" value={editFormData.cr648_date || ''} onChange={handleEditFormChange} required className="p-1 border border-gray-300 rounded w-full" />
                ) : new Date(record.cr648_date).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{editingId === record.cr648_lessonevaluationid ? (
                  <input type="text" name="cr648_participantsevaluation" value={editFormData.cr648_participantsevaluation || ''} onChange={handleEditFormChange} className="p-1 border border-gray-300 rounded w-full" />
                ) : record.cr648_participantsevaluation}</td>
                <td className="py-2 px-4 border-b">{editingId === record.cr648_lessonevaluationid ? (
                  <input type="text" name="cr648_coachname" value={editFormData.cr648_coachname || ''} onChange={handleEditFormChange} className="p-1 border border-gray-300 rounded w-full" />
                ) : record.cr648_coachname}</td>
                <td className="py-2 px-4 border-b">
                  {editingId === record.cr648_lessonevaluationid ? (
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} className="px-3 py-1 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors">
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className="px-3 py-1 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit(record)} className="px-3 py-1 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataverseCaller;