import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";

// Replace this with your Dataverse URL
const dataverseUrl = "https://orgdbcfb9bc.crm11.dynamics.com";

const DataverseCaller = () => {
  const { instance, accounts } = useMsal();
  const [progressRecords, setProgressRecords] = useState([]);
  const [editingId, setEditingId] = useState(null); // ID of the record being edited
  const [editFormData, setEditFormData] = useState({}); // Form data for the record being edited
  // Optional: Add loading and error states for better UX
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);

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


  // Optional: Handle loading and error states in the UI
  // if (isLoading) return <div>Loading records...</div>;
  // if (error) return <div>Error loading records: {error}</div>;

  return (
    <div>
      <h2>Lesson Evaluations</h2>
      {progressRecords && progressRecords.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Lesson Plan</th>
              <th>Evaluation Date</th>
              <th>Participant's Evaluation</th>
              <th>Coach Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {progressRecords.map((record) => (
              record ? (
                <tr key={record.cr648_lessonevaluationid}>
                  {editingId === record.cr648_lessonevaluationid ? (
                    <>
                      <td><input type="text" name="cr648_lessonplan" value={editFormData.cr648_lessonplan || ''} onChange={handleEditFormChange} /></td>
                      <td><input type="date" name="cr648_date" value={editFormData.cr648_date || ''} onChange={handleEditFormChange} /></td>
                      <td><input type="text" name="cr648_participantsevaluation" value={editFormData.cr648_participantsevaluation || ''} onChange={handleEditFormChange} /></td>
                      <td><input type="text" name="cr648_coachname" value={editFormData.cr648_coachname || ''} onChange={handleEditFormChange} /></td>
                      <td>
                        <button onClick={handleSaveEdit}>Save</button>
                        <button onClick={handleCancelEdit}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{record.cr648_lessonplan || "N/A"}</td>
                      <td>{record.cr648_date ? new Date(record.cr648_date).toLocaleDateString() : "N/A"}</td>
                      <td>{record.cr648_participantsevaluation || "No comments"}</td>
                      <td>{record.cr648_coachname || "N/A"}</td>
                      <td><button onClick={() => handleEdit(record)}>Edit</button></td>
                    </>
                  )}
                </tr>
              ) : null
            ))}
          </tbody>
        </table>
      ) : (
        <p>No lesson evaluation records found.</p>
      )}
    </div>
  );
};

export default DataverseCaller;
