import React, { useEffect, useState, useCallback } from 'react';
import { useMsal } from "@azure/msal-react";

// Dataverse URL (should ideally be in a shared config or passed as prop if different entities use different base URLs)
const dataverseUrl = "https://orgdbcfb9bc.crm11.dynamics.com";

// Helper function to format date strings
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { // Check if date is invalid
        // Try to parse if it's already in YYYY-MM-DD format (from input type="date")
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) -1; // Month is 0-indexed
            const day = parseInt(parts[2], 10);
            const newDate = new Date(year, month, day);
            if (!isNaN(newDate.getTime())) {
                 return newDate.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
            }
        }
        return 'Invalid Date';
    }
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString; // Fallback to original string if formatting fails
  }
};

// Helper function to format date strings for input type="date"
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { // Check if date is invalid
        // If it's already in YYYY-MM-DD, it's fine for input
        if (/^\\d{4}-\\d{2}-\\d{2}$/.test(dateString)) {
            return dateString;
        }
        return ''; // Or handle error appropriately
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date for input:", e);
    return ''; // Fallback to empty string if formatting fails
  }
};

// Helper function to convert values to string for display, handling boolean and null/undefined
const valueToString = (value) => {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (value === null || typeof value === 'undefined') {
    return 'N/A';
  }
  // Add more sophisticated formatting here if needed (e.g., for numbers, currency)
  return String(value);
};

// Define which fields are considered "basic" and shown in the main table
// IMPORTANT: User needs to verify/update these with actual Dataverse field names
const basicInfoFields = {
  firstName: 'cr648_firstname',
  lastName: 'cr648_lastname',
  dob: 'cr648_dateofbirth',
  id: 'cr648_participantinformationid' // Corrected to lowercase 'id' at the end based on logs
};

// Define fields for the creation form
// IMPORTANT: User needs to verify/update these with actual Dataverse field names
const creationFormFields = {
  [basicInfoFields.firstName]: { label: 'First Name', type: 'text', required: true },
  [basicInfoFields.lastName]: { label: 'Last Name', type: 'text', required: true },
  [basicInfoFields.dob]: { label: 'Date of Birth', type: 'date', required: false },
  'cr648_emailaddress': { label: 'Email', type: 'email', required: false },
  'cr648_phonenumber': { label: 'Phone Number', type: 'tel', required: false },
  'cr648_mobilenumber': { label: 'Mobile Number', type: 'tel', required: false },
  'cr648_addressline1': { label: 'Address Line 1', type: 'text', required: false },
  'cr648_addressline2': { label: 'Address Line 2', type: 'text', required: false },
  'cr648_addressline3': { label: 'Address Line 3', type: 'text', required: false },
  'cr648_postalcode': { label: 'Postal Code', type: 'text', required: false },
  'cr648_guardianorparent': { label: 'Guardian/Parent Name', type: 'text', required: false },
  'cr648_guardianphone': { label: 'Guardian Phone', type: 'tel', required: false },
  // Add other fields from the image if needed, e.g.:
  // 'cr648_age': { label: 'Age', type: 'number', required: false },
  // 'cr648_dataprotectionconsent': { label: 'Data Protection Consent', type: 'checkbox', required: false }, // Note: boolean fields might need special handling for 'checkbox' type
  // 'cr648_disabilitystatus': { label: 'Disability Status', type: 'text', required: false },
  // 'cr648_epilepsystatus': { label: 'Epilepsy Status', type: 'text', required: false },
  // 'cr648_heightincm': { label: 'Height (cm)', type: 'number', required: false },
  // 'cr648_photosconsent': { label: 'Photos Consent', type: 'checkbox', required: false },
  // 'cr648_startdate': { label: 'Start Date', type: 'date', required: false },
  // 'cr648_volunteerstatus': { label: 'Volunteer Status', type: 'text', required: false },
  // 'cr648_weightinkg': { label: 'Weight (kg)', type: 'number', required: false },
};


function ParticipantInfo() {
  const { instance, accounts } = useMsal();
  const [participantData, setParticipantData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedParticipantId, setExpandedParticipantId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // For create form submission state
  const [editFormData, setEditFormData] = useState({});
  const [originalEditData, _setOriginalEditData] = useState({}); // Prefix setter with _
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchParticipantInfo = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);

    if (accounts.length === 0) {
      setError("No authenticated account found. Please sign in.");
      if (showLoading) setIsLoading(false);
      return;
    }
    if (!instance) {
      setError("MSAL instance not available.");
      if (showLoading) setIsLoading(false);
      return;
    }

    const request = {
      scopes: [`${dataverseUrl}/.default`],
      account: accounts[0],
    };

    try {
      const response = await instance.acquireTokenSilent(request);
      const token = response.accessToken;
      const apiResponse = await fetch(`${dataverseUrl}/api/data/v9.2/cr648_participantinformations?$orderby=${basicInfoFields.lastName}, ${basicInfoFields.firstName}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
      });

      if (!apiResponse.ok) {
        const errData = await apiResponse.json();
        console.error("Fetch failed with status:", apiResponse.status, errData);
        setError(errData.error?.message || `Failed to fetch participant information: ${apiResponse.status}`);
        setParticipantData([]);
      } else {
        const data = await apiResponse.json();
        setParticipantData(data.value || []);
        if (data.value && data.value.length > 0) {
          console.log("First participant record from API:", data.value[0]);
          console.log("Keys of first participant record:", Object.keys(data.value[0]));
        }
        // console.log("Fetched participant data from Dataverse:", data); // Optional: can be noisy
      }
    } catch (err) {
      console.error("Operation failed:", err);
      if (err.name === "InteractionRequiredAuthError" || err.name === "BrowserAuthError") {
        setError("Token acquisition failed. Please try signing out and signing back in.");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
      setParticipantData([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [accounts, instance]); // Removed dataverseUrl from dependencies as it's constant

  useEffect(() => {
    fetchParticipantInfo();
  }, [fetchParticipantInfo]);

  const handleUpdateParticipant = useCallback(async (participantIdToUpdate, dataToUpdate) => {
    if (Object.keys(dataToUpdate).length === 0) {
      // console.log("No changes to update for participant:", participantIdToUpdate);
      return;
    }
    setIsUpdating(true);
    setError(null);

    if (accounts.length === 0 || !instance) {
      setError("Authentication error. Cannot update participant.");
      setIsUpdating(false);
      return;
    }

    const request = {
      scopes: [`${dataverseUrl}/.default`],
      account: accounts[0],
    };

    try {
      const response = await instance.acquireTokenSilent(request);
      const token = response.accessToken;

      const payload = { ...dataToUpdate };
      for (const key in payload) {
        const currentValue = payload[key];
        const originalValueFromState = originalEditData[key];

        if (currentValue === '') {
          // Prioritize creationFormFields for type info
          if (creationFormFields[key]) {
            if (creationFormFields[key].type === 'number') {
              payload[key] = null;
            } else if (creationFormFields[key].type === 'checkbox') { // Assuming checkbox implies boolean
              payload[key] = null; // Or false, depending on Dataverse nullable boolean handling
            }
            // For other types like 'text', 'email', 'tel', an empty string is often acceptable.
            // Date fields are handled by handleEditFormChange to be null if empty.
          }
          // Fallback to originalValueFromState's type if not in creationFormFields
          else if (typeof originalValueFromState === 'number') {
            payload[key] = null;
          } else if (typeof originalValueFromState === 'boolean') {
            payload[key] = null; // Or false
          }
          // If it's a string field and empty, payload[key] remains ''.
        }
      }
      // Remove the ID field from the payload as it's part of the URL
      delete payload[basicInfoFields.id];
      // Remove OData ETag if present, as it's usually handled by headers or specific mechanisms
      delete payload['@odata.etag'];


      // Log the payload
      console.log(`Updating participant ${participantIdToUpdate} with payload:`, JSON.stringify(payload, null, 2));

      const apiResponse = await fetch(`${dataverseUrl}/api/data/v9.2/cr648_participantinformations(${participantIdToUpdate})`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(payload),
      });

      if (!apiResponse.ok) {
        const errData = await apiResponse.json();
        console.error("Update failed with status:", apiResponse.status, errData);
        setError(errData.error?.message || `Failed to update participant information: ${apiResponse.status}`);
      } else {
        console.log("Update successful for participant:", participantIdToUpdate);
        setError(null);
        // Optionally, refetch the participant info or update the state to reflect changes
        fetchParticipantInfo(false); // false to not show loading spinner
      }
    } catch (err) {
      console.error("Update operation failed:", err);
      setError(err.message || "An unexpected error occurred during update.");
    } finally {
      setIsUpdating(false);
    }
  }, [accounts, instance, fetchParticipantInfo, originalEditData]);


  const handleToggleDetails = useCallback(async (participantId) => {
    const currentlyExpandedId = expandedParticipantId;
    const newExpandedId = currentlyExpandedId === participantId ? null : participantId;

    // If a row was expanded and it's different from the one being toggled (i.e., switching rows)
    if (currentlyExpandedId && currentlyExpandedId !== participantId) {
      const changes = {};
      for (const key in editFormData) {
        if (editFormData[key] !== originalEditData[key]) {
          changes[key] = editFormData[key];
        }
      }
      if (Object.keys(changes).length > 0) {
        console.log('Saving changes for (switch):', currentlyExpandedId, changes);
        await handleUpdateParticipant(currentlyExpandedId, changes); // Ensure this call is present and correct
      }
    } else if (currentlyExpandedId && newExpandedId === null) { // Closing the currently open row
        const changes = {};
        for (const key in editFormData) {
            if (editFormData[key] !== originalEditData[key]) { 
                changes[key] = editFormData[key]; 
            }
        }
        if (Object.keys(changes).length > 0) {
            console.log('Saving changes for (close):', currentlyExpandedId, changes);
            await handleUpdateParticipant(currentlyExpandedId, changes); // Ensure this call is present and correct
        }
    }


    setExpandedParticipantId(newExpandedId);

    if (newExpandedId) {
      const participantToEdit = participantData.find(p => p[basicInfoFields.id] === newExpandedId);
      if (participantToEdit) {
        const initialFormValues = {};
        Object.keys(participantToEdit).forEach(key => {
            if (typeof participantToEdit[key] === 'string' && participantToEdit[key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)) {
              initialFormValues[key] = formatDateForInput(participantToEdit[key]);
            } else {
              initialFormValues[key] = participantToEdit[key];
            }
        });
        setEditFormData(initialFormValues);
        _setOriginalEditData({ ...participantToEdit }); // Use prefixed setter
      }
    } else {
      setEditFormData({});
      _setOriginalEditData({}); // Use prefixed setter
    }
  }, [expandedParticipantId, editFormData, originalEditData, handleUpdateParticipant, participantData]); // Removed basicInfoFields


  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for checkbox to ensure boolean true/false is sent
    if (type === 'checkbox') {
      setEditFormData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setEditFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleCreateParticipant = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    if (accounts.length === 0 || !instance) {
      setError("Authentication error. Cannot create participant.");
      setIsSubmitting(false);
      return;
    }

    const request = {
      scopes: [`${dataverseUrl}/.default`],
      account: accounts[0],
    };

    try {
      const response = await instance.acquireTokenSilent(request);
      const token = response.accessToken;

      const payload = { ...newParticipant };
      for (const key in payload) {
        if (payload[key] === '') {
          // For empty strings, decide based on field type
          if (creationFormFields[key]?.type === 'number') {
            payload[key] = null;
          } else if (creationFormFields[key]?.type === 'checkbox') {
            payload[key] = false; // Or null, depending on desired default
          }
          // Strings and other types can remain as empty strings if that's the desired value
        }
      }

      const apiResponse = await fetch(`${dataverseUrl}/api/data/v9.2/cr648_participantinformations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(payload),
      });

      if (!apiResponse.ok) {
        const errData = await apiResponse.json();
        console.error("Creation failed with status:", apiResponse.status, errData);
        setError(errData.error?.message || `Failed to create participant: ${apiResponse.status}`);
      } else {
        console.log("Participant created successfully:", await apiResponse.json());
        setError(null);
        setIsCreateModalOpen(false);
        setNewParticipant({}); // Reset new participant state
        fetchParticipantInfo(false); // Refresh list without loading spinner
      }
    } catch (err) {
      console.error("Creation operation failed:", err);
      setError(err.message || "An unexpected error occurred during creation.");
    } finally {
      setIsSubmitting(false);
    }
  }, [accounts, instance, newParticipant, fetchParticipantInfo]);


  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim() === '') {
        // If search term is empty, refetch all participants
        fetchParticipantInfo();
      } else {
        const filteredData = participantData.filter(participant => {
          return Object.values(participant).some(value =>
            valueToString(value).toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
        setParticipantData(filteredData);
      }
    }, 300); // Adjust debounce delay as needed

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, participantData, fetchParticipantInfo]);


  return (
    <div>
      <h1>Participant Information</h1>
      {error && <div className="error">{error}</div>}
      <div>
        <input
          type="text"
          placeholder="Search participants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => setIsCreateModalOpen(true)}>Create New Participant</button>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Date of Birth</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {participantData.map(participant => (
              <React.Fragment key={participant[basicInfoFields.id]}>
                <tr>
                  <td>{valueToString(participant[basicInfoFields.firstName])}</td>
                  <td>{valueToString(participant[basicInfoFields.lastName])}</td>
                  <td>{formatDate(participant[basicInfoFields.dob])}</td>
                  <td>{valueToString(participant['cr648_emailaddress'])}</td>
                  <td>{valueToString(participant['cr648_phonenumber'])}</td>
                  <td>
                    <button onClick={() => handleToggleDetails(participant[basicInfoFields.id])}>
                      {expandedParticipantId === participant[basicInfoFields.id] ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>
                {expandedParticipantId === participant[basicInfoFields.id] && (
                  <tr>
                    <td colSpan="6"> {/* Adjusted colSpan to match number of headers */}
                      <div className="p-4 bg-gray-100 rounded-b-md">
                        <h3 className="text-lg font-semibold mb-2">Edit Participant Details</h3>
                        {error && <div className="text-red-500 mb-2">{error}</div>}
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                          {Object.keys(creationFormFields).map(fieldKey => {
                            const field = creationFormFields[fieldKey];
                            // Skip non-editable or ID fields if necessary, though creationFormFields should be fine
                            if (fieldKey === basicInfoFields.id) return null;

                            return (
                              <div key={fieldKey} className="flex flex-col">
                                <label htmlFor={fieldKey} className="mb-1 text-sm font-medium text-gray-700">
                                  {field.label}{field.required ? '*' : ''}
                                </label>
                                <input
                                  type={field.type === 'checkbox' ? 'checkbox' : field.type}
                                  id={fieldKey}
                                  name={fieldKey}
                                  checked={field.type === 'checkbox' ? (editFormData[fieldKey] || false) : undefined}
                                  value={field.type !== 'checkbox' ? (editFormData[fieldKey] || '') : undefined}
                                  onChange={handleEditFormChange}
                                  className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            );
                          })}
                          {isUpdating && <p className="text-blue-500">Saving...</p>}
                          {/* Save button is implicit via handleToggleDetails auto-save */}
                        </form>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {/* Create Participant Modal */}
      {isCreateModalOpen && (
        <div className="modal">
          <h2>Create Participant</h2>
          {error && <div className="error">{error}</div>}
          <form onSubmit={(e) => { e.preventDefault(); handleCreateParticipant(); }}>
            {Object.keys(creationFormFields).map(fieldKey => {
              const field = creationFormFields[fieldKey];
              return (
                <div key={fieldKey}>
                  <label>{field.label}{field.required ? '*' : ''}</label>
                  <input
                    type={field.type}
                    name={fieldKey}
                    value={newParticipant[fieldKey] || ''}
                    onChange={(e) => setNewParticipant({ ...newParticipant, [fieldKey]: e.target.value })}
                    required={field.required}
                  />
                </div>
              );
            })}
            <div>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Participant'}
              </button>
              <button type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ParticipantInfo;
