import React, { useEffect, useState, useCallback } from 'react';
import { useMsal } from "@azure/msal-react";

// MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Container from '@mui/material/Container'; // Added Container import
import DialogContentText from '@mui/material/DialogContentText'; // Added DialogContentText
import Grid from '@mui/material/Grid'; // Import Grid
import Pagination from '@mui/material/Pagination'; // Import Pagination

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility'; // Added VisibilityIcon for view mode
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete'; // Added DeleteIcon
import EditIcon from '@mui/icons-material/Edit'; // Added EditIcon
import SaveIcon from '@mui/icons-material/Save'; // Added SaveIcon

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
  [basicInfoFields.firstName]: { label: 'First Name', type: 'text', required: true, gridSpan: 6 },
  [basicInfoFields.lastName]: { label: 'Last Name', type: 'text', required: true, gridSpan: 6 },
  [basicInfoFields.dob]: { label: 'Date of Birth', type: 'date', required: false, gridSpan: 6 },
  'cr648_age': { label: 'Age', type: 'number', required: false, gridSpan: 6 },
  'cr648_emailaddress': { label: 'Email', type: 'email', required: false, gridSpan: 6 },
  'cr648_phonenumber': { label: 'Phone Number', type: 'tel', required: false, gridSpan: 6 },
  'cr648_mobilenumber': { label: 'Mobile Number', type: 'tel', required: false, gridSpan: 6 },
  'cr648_addressline1': { label: 'Address Line 1', type: 'text', required: false, gridSpan: 12 },
  'cr648_addressline2': { label: 'Address Line 2', type: 'text', required: false, gridSpan: 12 },
  'cr648_addressline3': { label: 'Address Line 3', type: 'text', required: false, gridSpan: 12 },
  'cr648_postalcode': { label: 'Postal Code', type: 'text', required: false, gridSpan: 6 },
  'cr648_guardianorparent': { label: 'Guardian/Parent', type: 'select', required: false, gridSpan: 6, options: [{value: true, label: 'Yes'}, {value: false, label: 'No'}] },
  'cr648_guardianphone': { label: 'Guardian Phone', type: 'tel', required: false, gridSpan: 6 },
  'cr648_heightincm': { label: 'Height (cm)', type: 'number', required: false, gridSpan: 6 },
  'cr648_heightinftandin': { label: 'Height (ft/in)', type: 'text', required: false, gridSpan: 6 },
  'cr648_weightinkg': { label: 'Weight (kg)', type: 'number', required: false, gridSpan: 6 },
  'cr648_weightinstones': { label: 'Weight (stones/lbs)', type: 'text', required: false, gridSpan: 6 },
  'cr648_disabilitystatus': {
    label: 'Disability Status',
    type: 'select',
    required: false,
    gridSpan: 12,
    options: [
      {value: 791310000, label: 'A - Physical Sensory Only'},
      {value: 791310001, label: 'B - Learning'},
      {value: 791310002, label: 'C - Physical + Learning'},
      {value: 791310003, label: 'D - Autistic Spectrum'},
      {value: 791310005, label: 'Disability'}
    ]
  },
  'cr648_epilepsystatus': { label: 'Epilepsy Status', type: 'select', required: false, gridSpan: 12, options: [{value: true, label: 'Yes'}, {value: false, label: 'No'}] },
  'cr648_startdate': { label: 'Start Date', type: 'date', required: false, gridSpan: 6 },
  'cr648_ApprovedOn': { label: 'Approved On', type: 'date', required: false, gridSpan: 6 },
  'cr648_sessiondateandtime': { label: 'Preferred Session Date/Time', type: 'datetime-local', required: false, gridSpan: 6 },
  'cr648_volunteerstatus': { label: 'Volunteer Status', type: 'select', required: false, gridSpan: 6, options: [{value: true, label: 'Yes'}, {value: false, label: 'No'}] },
  'cr648_dataprotectionconsent': { label: 'Data Protection Consent', type: 'select', required: false, gridSpan: 6, options: [{value: true, label: 'Yes'}, {value: false, label: 'No'}] },
  'cr648_photosconsent': { label: 'Photos Consent', type: 'select', required: false, gridSpan: 6, options: [{value: true, label: 'Yes'}, {value: false, label: 'No'}] },
};


function ParticipantInfo() {
  const { instance, accounts } = useMsal();
  const [allParticipantData, setAllParticipantData] = useState([]); // Store all fetched data
  const [participantData, setParticipantData] = useState([]); // Data to display (can be filtered)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedParticipantId, setExpandedParticipantId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false); // Track if we're in view mode vs edit mode
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // For create form submission state
  const [editFormData, setEditFormData] = useState({});
  const [originalEditData, _setOriginalEditData] = useState({}); // Prefix setter with _
  const [isUpdating, setIsUpdating] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState(null); // For delete confirmation
  const [isDeleting, setIsDeleting] = useState(false); // For delete operation loading state

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  }; 

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
        setAllParticipantData([]); // Clear all data on error
        setParticipantData([]);
      } else {
        const data = await apiResponse.json();
        setAllParticipantData(data.value || []); // Populate all data
        setParticipantData(data.value || []);    // Initially display all data
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
      setAllParticipantData([]); // Clear all data on error
      setParticipantData([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [accounts, instance]); // Removed dataverseUrl from dependencies as it's constant

  useEffect(() => {
    fetchParticipantInfo();
  }, [fetchParticipantInfo]);

  const handleDeleteParticipant = useCallback(async (participantIdToDelete) => {
    if (!participantIdToDelete) return;

    setIsDeleting(true);
    setError(null);

    if (accounts.length === 0 || !instance) {
      setError("Authentication error. Cannot delete participant.");
      setIsDeleting(false);
      setParticipantToDelete(null); // Close dialog
      return;
    }

    const request = {
      scopes: [`${dataverseUrl}/.default`],
      account: accounts[0],
    };

    try {
      const response = await instance.acquireTokenSilent(request);
      const token = response.accessToken;

      const apiResponse = await fetch(`${dataverseUrl}/api/data/v9.2/cr648_participantinformations(${participantIdToDelete})`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
      });

      if (!apiResponse.ok) {
        // For DELETE, a 204 No Content is success, but other errors might return JSON
        let errMessage = `Failed to delete participant: ${apiResponse.status}`;
        if (apiResponse.headers.get("content-type")?.includes("application/json")) {
            const errData = await apiResponse.json();
            console.error("Delete failed with status:", apiResponse.status, errData);
            errMessage = errData.error?.message || errMessage;
        } else {
            console.error("Delete failed with status:", apiResponse.status, await apiResponse.text());
        }
        setError(errMessage);
      } else {
        console.log("Delete successful for participant:", participantIdToDelete);
        setError(null);
        // Refetch participant info to update the list
        fetchParticipantInfo(false); // false to not show loading spinner
        // If the deleted participant was expanded, collapse it
        if (expandedParticipantId === participantIdToDelete) {
            setExpandedParticipantId(null);
            setEditFormData({});
            _setOriginalEditData({});
        }
      }
    } catch (err) {
      console.error("Delete operation failed:", err);
      setError(err.message || "An unexpected error occurred during delete.");
    } finally {
      setIsDeleting(false);
      setParticipantToDelete(null); // Close dialog
    }
  }, [accounts, instance, fetchParticipantInfo, expandedParticipantId]);

  const openDeleteConfirmDialog = (participantId) => {
    setParticipantToDelete(participantId);
  };

  const closeDeleteConfirmDialog = () => {
    setParticipantToDelete(null);
  };


  const handleUpdateParticipant = useCallback(async (participantIdToUpdate, dataToUpdate) => {
    if (Object.keys(dataToUpdate).length === 0) {
      // console.log("No changes to update for participant:", participantIdToUpdate);
      // setError("No changes detected to save."); // Optionally inform user
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
        const fieldDef = creationFormFields[key]; // Get field definition

        if (currentValue === '') {
          // Prioritize creationFormFields for type info
          if (fieldDef) {
            if (fieldDef.type === 'number') {
              payload[key] = null;
            } else if (fieldDef.type === 'checkbox' || (fieldDef.type === 'select' && fieldDef.options?.some(opt => typeof opt.value === 'boolean'))) {
              payload[key] = null; 
            }
            // For other types like 'text', 'email', 'tel', an empty string is often acceptable.
            // Date fields are handled by handleEditFormChange to be null if empty.
          }
          // Fallback to originalValueFromState's type if not in creationFormFields
          else if (typeof originalValueFromState === 'number') {
            payload[key] = null;
          } else if (typeof originalValueFromState === 'boolean') {
            payload[key] = null; 
          }
          // If it's a string field and empty, payload[key] remains ''.
        } else if (fieldDef?.type === 'select') {
            const isBooleanSelect = fieldDef.options?.some(opt => typeof opt.value === 'boolean');
            const isDisabilityStatusSelect = key === 'cr648_disabilitystatus';

            if (isBooleanSelect && (currentValue === 'true' || currentValue === 'false')) {
                payload[key] = (currentValue === 'true');
            } else if (isDisabilityStatusSelect && currentValue !== null && currentValue !== '') {
                payload[key] = parseInt(currentValue, 10);
            }
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


  const handleSaveChanges = useCallback(async (participantId) => {
    const changes = {};
    for (const key in editFormData) {
      if (originalEditData && editFormData[key] !== originalEditData[key]) {
        changes[key] = editFormData[key];
      } else if (!originalEditData && typeof editFormData[key] !== 'undefined') {
        changes[key] = editFormData[key];
      }
    }

    if (Object.keys(changes).length > 0) {
      console.log('Saving changes for:', participantId, changes);
      await handleUpdateParticipant(participantId, changes);
    } else {
      console.log('No changes to save for participant:', participantId);
      // Optionally, provide feedback to the user that there are no changes.
      // setError("No changes to save."); 
      // setTimeout(() => setError(null), 3000); // Clear message after 3 seconds
    }
  }, [editFormData, originalEditData, handleUpdateParticipant]);


  // Handle view mode toggle (read-only)
  const handleViewRecord = useCallback((participantId) => {
    const currentlyExpandedId = expandedParticipantId;
    const newExpandedId = currentlyExpandedId === participantId ? null : participantId;
    
    setExpandedParticipantId(newExpandedId);
    setIsViewMode(true); // Set to view mode
    
    if (newExpandedId) {
      const participantToView = participantData.find(p => p[basicInfoFields.id] === newExpandedId);
      if (participantToView) {
        // Just set the data for viewing, no edit form preparation needed
        setEditFormData(participantToView);
        _setOriginalEditData({ ...participantToView });
      }
    } else {
      setEditFormData({});
      _setOriginalEditData({});
    }
  }, [expandedParticipantId, participantData, _setOriginalEditData, setEditFormData, setExpandedParticipantId]);

  // Handle edit mode toggle (editable)
  const handleEditRecord = useCallback((participantId) => {
    const currentlyExpandedId = expandedParticipantId;
    const newExpandedId = currentlyExpandedId === participantId ? null : participantId;
    
    setExpandedParticipantId(newExpandedId);
    setIsViewMode(false); // Set to edit mode
    
    if (newExpandedId) {
      const participantToEdit = participantData.find(p => p[basicInfoFields.id] === newExpandedId);
      if (participantToEdit) {
        const initialFormValues = {};
        Object.keys(participantToEdit).forEach(key => {
            const fieldDefinition = creationFormFields[key];
            const value = participantToEdit[key];

            if (fieldDefinition?.type === 'datetime-local' && typeof value === 'string' && value.match(/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z?$/)) {
              initialFormValues[key] = value.substring(0, 16); // YYYY-MM-DDTHH:MM
            } else if (fieldDefinition?.type === 'date' && typeof value === 'string' && value.match(/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z?$/)) {
              initialFormValues[key] = formatDateForInput(value); // YYYY-MM-DD
            } else if (fieldDefinition?.type === 'checkbox'){
              initialFormValues[key] = value === null || typeof value === 'undefined' ? false : Boolean(value);
            } else {
              initialFormValues[key] = value;
            }
        });
        setEditFormData(initialFormValues);
        _setOriginalEditData({ ...participantToEdit });
      }
    } else {
      setEditFormData({});
      _setOriginalEditData({});
    }
  }, [expandedParticipantId, participantData, _setOriginalEditData, setEditFormData, setExpandedParticipantId]);


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
        const fieldDef = creationFormFields[key]; // Get field definition
        if (payload[key] === '') {
          // For empty strings, decide based on field type
          if (fieldDef?.type === 'number') {
            payload[key] = null;
          } else if (fieldDef?.type === 'checkbox') { // This was for actual checkbox types, boolean selects are handled by their onChange or below
            payload[key] = false; // Or null, depending on desired default
          }
        } else if (fieldDef?.type === 'select' && key === 'cr648_disabilitystatus' && payload[key] !== null && payload[key] !== '') {
            payload[key] = parseInt(payload[key], 10); // Convert to integer
        }
        // Boolean values from select are already handled by the newParticipant state via its specific onChange
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
        let errMessage = `Failed to create participant: ${apiResponse.status}`;
        try {
            const errData = await apiResponse.json();
            console.error("Creation failed with status:", apiResponse.status, errData);
            errMessage = errData.error?.message || errMessage;
        } catch (jsonError) {
            // If parsing error response as JSON fails, use the raw text
            const errText = await apiResponse.text();
            console.error("Creation failed with status:", apiResponse.status, errText);
            errMessage = errText || errMessage;
        }
        setError(errMessage);
      } else {
        // Handle successful creation
        if (apiResponse.status === 204) { // HTTP 204 No Content
          console.log("Participant created successfully (204 No Content).");
        } else { // Assuming HTTP 201 Created or other success with a body
          try {
            const createdParticipant = await apiResponse.json();
            console.log("Participant created successfully:", createdParticipant);
          } catch (jsonError) {
            console.warn("Successfully created participant, but response body was not valid JSON or was empty:", jsonError);
            // Still proceed as if successful, as the main operation completed.
          }
        }
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
        // If search term is empty, display all participants from the stored full list
        setParticipantData(allParticipantData);
      } else {
        const filteredData = allParticipantData.filter(participant => { // Filter from allParticipantData
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
  }, [searchTerm, allParticipantData]); // Depend on searchTerm and allParticipantData

  // Update total records and paginate data when participantData changes
  useEffect(() => {
    setTotalRecords(participantData.length);
    // Reset to page 1 if current page exceeds total pages
    const totalPages = Math.ceil(participantData.length / recordsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [participantData, currentPage, recordsPerPage]);

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return participantData.slice(startIndex, endIndex);
  };

  const currentPageData = getCurrentPageData();


  // Render the table
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Participant Information
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Search Participants (by Name, DOB)"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: '40%' }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add New Participant
        </Button>
      </Box>
      {isLoading && !participantData.length && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
      {!isLoading && !error && participantData.length === 0 && searchTerm === '' && (
         <Typography sx={{textAlign: 'center', my: 3}}>No participants found. Click "Add New Participant" to get started.</Typography>
      )}
      {!isLoading && !error && participantData.length === 0 && searchTerm !== '' && (
         <Typography sx={{textAlign: 'center', my: 3}}>No participants match your search criteria.</Typography>
      )}

      {participantData.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table aria-label="collapsible participant table">
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                {/* Removed expand icon TableCell -> <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }} /> */}
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>First Name</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Last Name</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Date of Birth</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Actions</TableCell> {/* Actions column */}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageData.map((participant) => (
                <React.Fragment key={participant[basicInfoFields.id]}>
                  <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    {/* <TableCell> // This cell is removed as the edit icon is now in actions
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => handleToggleDetails(participant[basicInfoFields.id])}
                      >
                        {expandedParticipantId === participant[basicInfoFields.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell> */}
                    <TableCell component="th" scope="row">
                      {valueToString(participant[basicInfoFields.firstName])}
                    </TableCell>
                    <TableCell>{valueToString(participant[basicInfoFields.lastName])}</TableCell>
                    <TableCell>{formatDate(participant[basicInfoFields.dob])}</TableCell>
                    <TableCell>
                      <IconButton 
                        aria-label="view participant" 
                        size="small" 
                        onClick={() => handleViewRecord(participant[basicInfoFields.id])}
                        sx={{ mr: 1 }}
                        color="info"
                      >
                        {expandedParticipantId === participant[basicInfoFields.id] && isViewMode ? <KeyboardArrowUpIcon /> : <VisibilityIcon />}
                      </IconButton>
                      <IconButton 
                        aria-label="edit participant" 
                        size="small" 
                        onClick={() => handleEditRecord(participant[basicInfoFields.id])}
                        sx={{ mr: 1 }}
                        color="primary"
                      >
                        {expandedParticipantId === participant[basicInfoFields.id] && !isViewMode ? <KeyboardArrowUpIcon /> : <EditIcon />}
                      </IconButton>
                      <IconButton 
                        aria-label="delete participant" 
                        size="small" 
                        onClick={() => openDeleteConfirmDialog(participant[basicInfoFields.id])}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}> {/* Adjusted colSpan since one cell was removed */}
                      <Collapse in={expandedParticipantId === participant[basicInfoFields.id]} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            {isViewMode ? 'Participant Details' : 'Edit Participant Details'}
                          </Typography>
                          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                          
                          {isViewMode ? (
                            // View Mode - Read-only display
                            <Box sx={{ mt: 1 }}>
                              <Grid container spacing={2}>
                                {Object.keys(creationFormFields).map(fieldKey => {
                                  const field = creationFormFields[fieldKey];
                                  if (fieldKey === basicInfoFields.id) return null; // Don't show ID field

                                  const gridSpan = field.gridSpan || 6;
                                  const value = editFormData[fieldKey];
                                  
                                  let displayValue = '';
                                  if (field.type === 'date' && value) {
                                    displayValue = formatDate(value);
                                  } else if (field.type === 'datetime-local' && value) {
                                    displayValue = new Date(value).toLocaleString();
                                  } else if (field.type === 'checkbox') {
                                    displayValue = value ? 'Yes' : 'No';
                                  } else if (field.type === 'select' && field.options) {
                                    const option = field.options.find(opt => opt.value === value);
                                    displayValue = option ? option.label : value || 'N/A';
                                  } else {
                                    displayValue = value || 'N/A';
                                  }

                                  return (
                                    <Grid item xs={12} sm={gridSpan} key={fieldKey}>
                                      <Box sx={{ mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                          {field.label}
                                        </Typography>
                                        <Typography variant="body1">
                                          {displayValue}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  );
                                })}
                              </Grid>
                            </Box>
                          ) : (
                            // Edit Mode - Editable form
                            <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                              {Object.keys(creationFormFields).map(fieldKey => {
                                const field = creationFormFields[fieldKey];
                                if (fieldKey === basicInfoFields.id) return null; // Don\'t show ID field

                                const gridSpan = field.gridSpan || 6; // Default to half-width if not specified

                                if (field.type === 'checkbox') {
                                  return (
                                    <Grid item xs={12} sm={gridSpan} key={fieldKey}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={editFormData[fieldKey] || false}
                                            onChange={handleEditFormChange}
                                            name={fieldKey}
                                            disabled={isUpdating}
                                          />
                                        }
                                        label={field.label + (field.required ? '*' : '')}
                                      />
                                    </Grid>
                                  );
                                }
                                if (field.type === 'select') {
                                  return (
                                    <Grid item xs={12} sm={gridSpan} key={fieldKey}>
                                      <TextField
                                        select
                                        label={field.label}
                                        name={fieldKey}
                                        value={editFormData[fieldKey] === null || typeof editFormData[fieldKey] === 'undefined' ? '' : String(editFormData[fieldKey])} // Ensure value is string for select
                                        onChange={handleEditFormChange}
                                        required={field.required}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        disabled={isUpdating}
                                        SelectProps={{
                                          native: true,
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                      >
                                        <option value=""></option> {/* Default empty option */}
                                        {field.options.map(option => (
                                          <option key={String(option.value)} value={String(option.value)}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </TextField>
                                    </Grid>
                                  );
                                }
                                return (
                                  <Grid item xs={12} sm={gridSpan} key={fieldKey}>
                                    <TextField
                                      label={field.label}
                                      type={field.type}
                                      name={fieldKey}
                                      value={editFormData[fieldKey] === null || typeof editFormData[fieldKey] === 'undefined' ? '' : editFormData[fieldKey]}
                                      onChange={handleEditFormChange}
                                      required={field.required}
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      disabled={isUpdating}
                                      InputLabelProps={(field.type === 'date' || field.type === 'datetime-local' || editFormData[fieldKey]) ? { shrink: true } : {}}
                                    />
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </Box>
                          )}
                          {!isViewMode && isUpdating && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                                <CircularProgress size={20} sx={{mr:1}}/> 
                                <Typography>Saving...</Typography>
                            </Box>
                          )}
                          {/* Save is explicit via button now */}
                          {!isViewMode && (
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                              <Button 
                                  variant="contained" 
                                  color="primary" 
                                  startIcon={<SaveIcon />}
                                  onClick={() => handleSaveChanges(participant[basicInfoFields.id])}
                                  disabled={isUpdating}
                              >
                                  {isUpdating ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Participant Dialog */}
      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Participant</DialogTitle> {/* Changed from "Create New Participant" */}
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {/* <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ mt: 1 }}> Changed to use id and submit via DialogActions */}
          <Box component="form" id="createParticipantForm" onSubmit={(e) => { e.preventDefault(); handleCreateParticipant(); }} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              {Object.keys(creationFormFields).map(fieldKey => {
                const field = creationFormFields[fieldKey];
                if (fieldKey === basicInfoFields.id) return null; // Don\'t show ID field for creation

                const gridSpan = field.gridSpan || 6; // Default to half-width

                if (field.type === 'checkbox') {
                  return (
                    <Grid item xs={12} sm={gridSpan} key={fieldKey}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={newParticipant[fieldKey] || false}
                            onChange={(e) => setNewParticipant({ ...newParticipant, [fieldKey]: e.target.checked })}
                            name={fieldKey}
                            disabled={isSubmitting}
                          />
                        }
                        label={field.label + (field.required ? '*' : '')}
                      />
                    </Grid>
                  );
                }
                if (field.type === 'select') {
                  return (
                    <Grid item xs={12} sm={gridSpan} key={fieldKey}>
                      <TextField
                        select
                        label={field.label}
                        name={fieldKey}
                        value={newParticipant[fieldKey] === null || typeof newParticipant[fieldKey] === 'undefined' ? '' : String(newParticipant[fieldKey])} // Ensure value is string for select
                        onChange={(e) => {
                            const fieldDefinition = creationFormFields[fieldKey];
                            let val = e.target.value;
                            // Convert back to boolean if it\'s a boolean select
                            if (fieldDefinition.options?.some(opt => typeof opt.value === 'boolean')) {
                                if (val === 'true') val = true;
                                else if (val === 'false') val = false;
                                // if val is empty string, it will be handled by submission logic to be null or default
                            }
                            // For disability status, the value is already the integer (as string), parsing happens on submission
                            setNewParticipant({ ...newParticipant, [fieldKey]: val });
                        }}
                        required={field.required}
                        variant="outlined"
                        fullWidth
                        disabled={isSubmitting}
                        SelectProps={{
                          native: true,
                        }}
                        InputLabelProps={{ shrink: true }}
                      >
                        <option value=""></option> {/* Default empty option */}
                        {field.options.map(option => (
                          <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                          </option>
                        ))}
                      </TextField>
                    </Grid>
                  );
                }
                return (
                  <Grid item xs={12} sm={gridSpan} key={fieldKey}>
                    <TextField
                      label={field.label}
                      type={field.type}
                      name={fieldKey}
                      value={newParticipant[fieldKey] || ''}
                      onChange={(e) => setNewParticipant({ ...newParticipant, [fieldKey]: e.target.value })}
                      required={field.required}
                      variant="outlined"
                      fullWidth
                      disabled={isSubmitting}
                      InputLabelProps={(field.type === 'date' || field.type === 'datetime-local' || newParticipant[fieldKey]) ? { shrink: true } : {}}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button> {/* Removed color="primary" to use default */}
          <Button 
            type="submit" 
            form="createParticipantForm" // Submit the form by ID
            variant="contained" // Added variant
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />} // Added icon
          >
            {isSubmitting ? 'Creating...' : 'Create Participant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(participantToDelete)}
        onClose={closeDeleteConfirmDialog}
        aria-labelledby="delete-confirmation-dialog"
      >
        <DialogTitle id="delete-confirmation-dialog">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this participant? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={() => { 
              handleDeleteParticipant(participantToDelete); 
              closeDeleteConfirmDialog(); // Close dialog after delete action
            }} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={24} /> : 'Delete Participant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pagination Component - Always show, even if 1 page */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(totalRecords / recordsPerPage)}
          page={currentPage}
          onChange={(event, value) => setCurrentPage(value)}
          color="primary"
          variant="outlined"
          shape="rounded"
          size="medium"
          sx={{ '& .MuiPaginationItem-root': { borderRadius: '8px' } }}
        />
      </Box>
    </Container>
  );
}

export default ParticipantInfo;
