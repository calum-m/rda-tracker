import React, { useEffect, useState, useCallback } from 'react';
import { useMsal } from "@azure/msal-react";

// Dataverse URL (should ideally be in a shared config or passed as prop if different entities use different base URLs)
const dataverseUrl = "https://orgdbcfb9bc.crm11.dynamics.com";

// Helper function to format date strings
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    // Assuming dateString is in a format parsable by Date constructor (e.g., ISO format)
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString; // Fallback to original string if formatting fails
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

  const handleToggleDetails = (participantId) => {
    setExpandedParticipantId(prevId => (prevId === participantId ? null : participantId));
  };

  const handleCreateFormChange = (e) => {
    const { name, value, type } = e.target;
    setNewParticipant(prev => ({
      ...prev,
      [name]: type === 'date' && value === '' ? null : value // Store empty date as null
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(creationFormFields).some(field => field.required && !newParticipant[Object.keys(creationFormFields).find(key => creationFormFields[key] === field)])) {
        alert("Please fill in all required fields.");
        return;
    }
    setIsSubmitting(true);
    setError(null);

    if (accounts.length === 0 || !instance) {
      setError("Authentication error. Cannot submit form.");
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

      // Prepare data for Dataverse (remove empty strings, convert to correct types if necessary)
      const participantToCreate = { ...newParticipant };
      for (const key in participantToCreate) {
        if (participantToCreate[key] === '') {
          delete participantToCreate[key]; // Dataverse expects missing fields, not empty strings for some types
        }
        // Ensure date is in YYYY-MM-DD format if it's a date field and not null
        if (creationFormFields[key]?.type === 'date' && participantToCreate[key]) {
            // Assuming newParticipant[key] is already in 'YYYY-MM-DD' from input type="date"
            // If not, conversion would be needed here:
            // const dateObj = new Date(participantToCreate[key]);
            // participantToCreate[key] = dateObj.toISOString().split('T')[0];
        }
      }
      
      // Log the payload before sending
      console.log("Submitting to Dataverse:", JSON.stringify(participantToCreate, null, 2));

      const apiResponse = await fetch(`${dataverseUrl}/api/data/v9.2/cr648_participantinformations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Prefer': 'return=representation' // To get the created record back
        },
        body: JSON.stringify(participantToCreate),
      });

      if (!apiResponse.ok) {
        const errData = await apiResponse.json();
        console.error("Create failed with status:", apiResponse.status, errData);
        setError(errData.error?.message || `Failed to create participant: ${apiResponse.status}`);
      } else {
        const createdRecord = await apiResponse.json();
        console.log("Successfully created participant:", createdRecord);
        setNewParticipant({}); // Reset form
        setIsCreateModalOpen(false); // Close modal
        // Refresh data - either by re-fetching or adding to state
        // For simplicity, re-fetch. For better UX, add to state directly if ID is returned.
        fetchParticipantInfo(false); // Re-fetch without full page loading indicator
        alert('Participant created successfully!');
      }
    } catch (err) {
      console.error("Create operation failed:", err);
      if (err.name === "InteractionRequiredAuthError" || err.name === "BrowserAuthError") {
        setError("Token acquisition failed for creation. Please try signing out and signing back in.");
      } else {
        setError(err.message || "An unexpected error occurred during creation.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered data based on search term
  const filteredParticipantData = participantData.filter(participant => {
    const firstName = String(participant[basicInfoFields.firstName] || '').toLowerCase();
    const lastName = String(participant[basicInfoFields.lastName] || '').toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    return firstName.includes(searchTermLower) || lastName.includes(searchTermLower);
  });

  if (isLoading && !isSubmitting) { // Don't show main loading if only submitting
    return <div className="p-4 text-center">Loading participant information...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600 bg-red-100 border border-red-400 rounded">Error: {error}</div>;
  }

  // Main error display (could be separate from form error)
  const mainError = error && !isSubmitting ? error : null;


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Participant Information</h1>

      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by first or last name..."
          className="w-2/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => { setIsCreateModalOpen(true); setError(null); setNewParticipant({}); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create New Participant
        </button>
      </div>
      
      {mainError && (
        <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-400 rounded-md">
          Error: {mainError}
        </div>
      )}

      {/* Create Participant Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Create New Participant</h2>
            {error && isSubmitting && ( // Show error specific to form submission
                <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-400 rounded-md">
                    Error: {error}
                </div>
            )}
            <form onSubmit={handleCreateSubmit}>
              {Object.entries(creationFormFields).map(([fieldName, fieldConfig]) => (
                <div className="mb-4" key={fieldName}>
                  <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
                    {fieldConfig.label}{fieldConfig.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={fieldConfig.type}
                    id={fieldName}
                    name={fieldName}
                    value={newParticipant[fieldName] || ''}
                    onChange={handleCreateFormChange}
                    required={fieldConfig.required}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              ))}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setIsCreateModalOpen(false); setError(null); }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Create Participant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Existing table display */}
      {filteredParticipantData.length > 0 ? (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date of Birth</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Ensure no whitespace text nodes directly inside tbody to prevent hydration errors */}
              {filteredParticipantData.map((record) => {
                const currentRecordId = record[basicInfoFields.id];
                // Log details for each record to debug expansion issue
                // console.log(`Record Map - ID: '${currentRecordId}', Type: ${typeof currentRecordId} --- Expanded ID: '${expandedParticipantId}', Type: ${typeof expandedParticipantId} --- Match: ${expandedParticipantId === currentRecordId}`);

                return (
                  <React.Fragment key={currentRecordId || Math.random()}> {/* Fallback key if ID is undefined, though not ideal */}
                    <tr className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record[basicInfoFields.firstName] || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record[basicInfoFields.lastName] || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(record[basicInfoFields.dob])}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            // console.log(`Button Click - Toggling details for ID: '${currentRecordId}'`);
                            handleToggleDetails(currentRecordId);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
                          aria-expanded={expandedParticipantId === record[basicInfoFields.id]}
                          aria-controls={`details-${record[basicInfoFields.id]}`}
                        >
                          {expandedParticipantId === record[basicInfoFields.id] ? 'Hide Details' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                    {expandedParticipantId === record[basicInfoFields.id] && (
                      <tr id={`details-${record[basicInfoFields.id]}`}>
                        <td colSpan="4" className="px-6 py-4 bg-indigo-50 border-t border-indigo-200">
                          <div className="text-sm text-gray-800">
                            <h4 className="font-semibold text-lg mb-3 text-indigo-700">
                              Full Details for {record[basicInfoFields.firstName]} {record[basicInfoFields.lastName]}:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                              {Object.entries(record).map(([key, value]) => {
                                // Exclude already displayed basic info, internal OData fields, and the ID field itself from this detailed list
                                if (!key.startsWith('@odata.') && !key.startsWith('_') &&
                                    key !== basicInfoFields.firstName &&
                                    key !== basicInfoFields.lastName &&
                                    key !== basicInfoFields.dob &&
                                    key !== basicInfoFields.id) {
                                  return (
                                    <div key={key} className="py-1">
                                      <strong className="block font-medium text-gray-600 capitalize">
                                        {key.replace('cr648_', '').replace(/([A-Z])/g, ' $1').trim()}:
                                      </strong>
                                      <span className="block text-gray-800 mt-0.5">{valueToString(value)}</span>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 mt-4">
          {participantData.length > 0 && filteredParticipantData.length === 0 
            ? 'No participants match your search criteria.' 
            : isLoading ? 'Loading...' : 'No participant information found.'} 
        </p>
      )}
    </div>
  );
}

export default ParticipantInfo;
