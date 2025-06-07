import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";

// Replace this with your Dataverse URL
const dataverseUrl = "https://orgdbcfb9bc.crm11.dynamics.com";

const DataverseCaller = () => {
  const { instance, accounts } = useMsal();
  const [progressRecords, setProgressRecords] = useState([]);
  const [editingId, setEditingId] = useState(null); // ID of the record being edited
  const [editFormData, setEditFormData] = useState({}); // Form data for the record being edited
  // New state for creating a record
  const [newRecord, setNewRecord] = useState({
    cr648_lessonplan: '',
    cr648_date: '',
    cr648_participantsevaluation: '',
    cr648_coachname: ''
  });
  const [searchTerm, setSearchTerm] = useState("");

  // New states for advanced filtering
  const [filterLessonPlan, setFilterLessonPlan] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterParticipantEval, setFilterParticipantEval] = useState("");
  const [filterCoachName, setFilterCoachName] = useState("");

  useEffect(() => {
    if (accounts.length === 0) return;

    // Optional: setIsLoading(true); setError(null);
    const request = {
      scopes: [`${dataverseUrl}/.default`],
      account: accounts[0],
    };

    instance
      .acquireTokenSilent(request)
      .then((response) => {
        const token = response.accessToken;
        fetch(`${dataverseUrl}/api/data/v9.2/cr648_lessonevaluations`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
          },
        })
          .then((res) => {
            if (!res.ok) {
              return res.json().then(errData => {
                console.error("Fetch failed with status:", res.status, errData);
                return { value: [] };
              });
            }
            return res.json();
          })
          .then((data) => {
            setProgressRecords(data.value || []);
            console.log("Fetched data from Dataverse:", data);
          })
          .catch((err) => {
            console.error("Fetch processing failed:", err);
            setProgressRecords([]);
          });
      })
      .catch((err) => {
        console.error("Token acquisition failed:", err);
        setProgressRecords([]);
      });
  }, [accounts, instance]);

  const handleEdit = (record) => {
    setEditingId(record.cr648_lessonevaluationid);
    // Format date for input type="date" which expects YYYY-MM-DD
    const formattedDate = record.cr648_date ? new Date(record.cr648_date).toISOString().split('T')[0] : '';
    setEditFormData({ ...record, cr648_date: formattedDate });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
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

    const request = {
      scopes: [`${dataverseUrl}/.default`],
      account: accounts[0],
    };

    try {
      const response = await instance.acquireTokenSilent(request);
      const token = response.accessToken;

      // Prepare only the fields that are meant to be updated
      const updatePayload = {
        cr648_lessonplan: editFormData.cr648_lessonplan,
        cr648_date: editFormData.cr648_date, // Ensure this is in a format Dataverse accepts (YYYY-MM-DD is usually fine for Date only fields)
        cr648_participantsevaluation: editFormData.cr648_participantsevaluation,
        cr648_coachname: editFormData.cr648_coachname,
      };
      
      const apiResponse = await fetch(`${dataverseUrl}/api/data/v9.2/cr648_lessonevaluations(${editingId})`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Prefer': 'return=representation' // Gets the updated record back
        },
        body: JSON.stringify(updatePayload),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error("Update failed with status:", apiResponse.status, errorData);
        // Optional: setError(errorData.error?.message || `Update failed: ${apiResponse.status}`);
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
      console.log("Record updated successfully:", updatedRecord);

    } catch (err) {
      console.error("Save operation failed:", err);
      // Optional: setError(err.message || "Failed to save record");
    }
  };

  // New: handle changes in the create record form
  const handleNewRecordChange = (event) => {
    const { name, value } = event.target;
    setNewRecord((prev) => ({ ...prev, [name]: value }));
  };

  // New: handle create record submit
  const handleCreateRecord = async (event) => {
    event.preventDefault();
    if (accounts.length === 0) return;
    const request = {
      scopes: [`${dataverseUrl}/.default`],
      account: accounts[0],
    };
    try {
      const response = await instance.acquireTokenSilent(request);
      const token = response.accessToken;
      const payload = {
        cr648_lessonplan: newRecord.cr648_lessonplan,
        cr648_date: newRecord.cr648_date,
        cr648_participantsevaluation: newRecord.cr648_participantsevaluation,
        cr648_coachname: newRecord.cr648_coachname,
      };
      const apiResponse = await fetch(`${dataverseUrl}/api/data/v9.2/cr648_lessonevaluations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload),
      });
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error("Create failed with status:", apiResponse.status, errorData);
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
      console.log("Record created successfully:", createdRecord);
    } catch (err) {
      console.error("Create operation failed:", err);
    }
  };

  // New: handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // New: filter records based on search term
  const filteredRecords = progressRecords.filter((record) => {
    const lessonPlan = record.cr648_lessonplan || "";
    const participantEval = record.cr648_participantsevaluation || "";
    const coachName = record.cr648_coachname || "";
    const date = record.cr648_date ? new Date(record.cr648_date).toLocaleDateString() : "";
    const search = searchTerm.toLowerCase();
    return (
      lessonPlan.toLowerCase().includes(search) ||
      participantEval.toLowerCase().includes(search) ||
      coachName.toLowerCase().includes(search) ||
      date.includes(search)
    );
  });

  // Advanced filter logic
  const advancedFilteredRecords = filteredRecords.filter((record) => {
    // Lesson Plan filter (partial match)
    if (filterLessonPlan && !(record.cr648_lessonplan || "").toLowerCase().includes(filterLessonPlan.toLowerCase())) {
      return false;
    }
    // Participant's Evaluation filter (partial match)
    if (filterParticipantEval && !(record.cr648_participantsevaluation || "").toLowerCase().includes(filterParticipantEval.toLowerCase())) {
      return false;
    }
    // Coach Name filter (partial match)
    if (filterCoachName && !(record.cr648_coachname || "").toLowerCase().includes(filterCoachName.toLowerCase())) {
      return false;
    }
    // Date range filter
    if (filterDateFrom) {
      const recordDate = record.cr648_date ? new Date(record.cr648_date) : null;
      if (!recordDate || recordDate < new Date(filterDateFrom)) {
        return false;
      }
    }
    if (filterDateTo) {
      const recordDate = record.cr648_date ? new Date(record.cr648_date) : null;
      if (!recordDate || recordDate > new Date(filterDateTo)) {
        return false;
      }
    }
    return true;
  });

  // Optional: Handle loading and error states in the UI
  // if (isLoading) return <div>Loading records...</div>;
  // if (error) return <div>Error loading records: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Lesson Evaluations</h2>
      {/* Search box */}
      <input
        type="text"
        placeholder="Search records..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="mb-4 p-2 border border-gray-300 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {/* Advanced filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Filter by Lesson Plan"
          value={filterLessonPlan}
          onChange={e => setFilterLessonPlan(e.target.value)}
          className="p-2 border border-gray-300 rounded flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="date"
          placeholder="From Date"
          value={filterDateFrom}
          onChange={e => setFilterDateFrom(e.target.value)}
          className="p-2 border border-gray-300 rounded flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="date"
          placeholder="To Date"
          value={filterDateTo}
          onChange={e => setFilterDateTo(e.target.value)}
          className="p-2 border border-gray-300 rounded flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Filter by Participant's Evaluation"
          value={filterParticipantEval}
          onChange={e => setFilterParticipantEval(e.target.value)}
          className="p-2 border border-gray-300 rounded flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Filter by Coach Name"
          value={filterCoachName}
          onChange={e => setFilterCoachName(e.target.value)}
          className="p-2 border border-gray-300 rounded flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      {/* Create record form */}
      <form onSubmit={handleCreateRecord} className="mb-6 border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Create New Record</h3>
        <div className="flex flex-wrap gap-4 mb-2">
          <input type="text" name="cr648_lessonplan" placeholder="Lesson Plan" value={newRecord.cr648_lessonplan} onChange={handleNewRecordChange} required className="p-2 border border-gray-300 rounded flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="date" name="cr648_date" placeholder="Date" value={newRecord.cr648_date} onChange={handleNewRecordChange} required className="p-2 border border-gray-300 rounded flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="cr648_participantsevaluation" placeholder="Participant's Evaluation" value={newRecord.cr648_participantsevaluation} onChange={handleNewRecordChange} className="p-2 border border-gray-300 rounded flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="cr648_coachname" placeholder="Coach Name" value={newRecord.cr648_coachname} onChange={handleNewRecordChange} className="p-2 border border-gray-300 rounded flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Create</button>
      </form>
      {advancedFilteredRecords && advancedFilteredRecords.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Lesson Plan</th>
                <th className="py-2 px-4 border-b text-left">Evaluation Date</th>
                <th className="py-2 px-4 border-b text-left">Participant's Evaluation</th>
                <th className="py-2 px-4 border-b text-left">Coach Name</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {advancedFilteredRecords.map((record) => (
                record ? (
                  <tr key={record.cr648_lessonevaluationid} className="hover:bg-gray-50">
                    {editingId === record.cr648_lessonevaluationid ? (
                      <React.Fragment>
                        <td className="py-2 px-4 border-b"><input type="text" name="cr648_lessonplan" value={editFormData.cr648_lessonplan || ''} onChange={handleEditFormChange} className="p-1 border border-gray-300 rounded w-full" /></td>
                        <td className="py-2 px-4 border-b"><input type="date" name="cr648_date" value={editFormData.cr648_date || ''} onChange={handleEditFormChange} className="p-1 border border-gray-300 rounded w-full" /></td>
                        <td className="py-2 px-4 border-b"><input type="text" name="cr648_participantsevaluation" value={editFormData.cr648_participantsevaluation || ''} onChange={handleEditFormChange} className="p-1 border border-gray-300 rounded w-full" /></td>
                        <td className="py-2 px-4 border-b"><input type="text" name="cr648_coachname" value={editFormData.cr648_coachname || ''} onChange={handleEditFormChange} className="p-1 border border-gray-300 rounded w-full" /></td>
                        <td className="py-2 px-4 border-b">
                          <button onClick={handleSaveEdit} className="mr-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition">Save</button>
                          <button onClick={handleCancelEdit} className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition">Cancel</button>
                        </td>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <td className="py-2 px-4 border-b">{record.cr648_lessonplan || "N/A"}</td>
                        <td className="py-2 px-4 border-b">{record.cr648_date ? new Date(record.cr648_date).toLocaleDateString() : "N/A"}</td>
                        <td className="py-2 px-4 border-b">{record.cr648_participantsevaluation || "No comments"}</td>
                        <td className="py-2 px-4 border-b">{record.cr648_coachname || "N/A"}</td>
                        <td className="py-2 px-4 border-b">
                          <button onClick={() => handleEdit(record)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Edit</button>
                        </td>
                      </React.Fragment>
                    )}
                  </tr>
                ) : null
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No lesson evaluation records found.</p>
      )}
    </div>
  );
};

export default DataverseCaller;
