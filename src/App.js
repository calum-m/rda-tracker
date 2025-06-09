import React, { useState, useEffect, useMemo } from "react";
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { BrowserRouter as Router, Route, Routes, Link as RouterLink, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { AppBar, Toolbar, Button, Typography, Container, Box, createTheme, ThemeProvider, CssBaseline, Paper, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Import MenuIcon
import { CacheProvider } from '@emotion/react'; // Import CacheProvider from @emotion/react
import DataverseCaller from "./DataverseCaller";
import ConsentModal from "./ConsentModal";
import CoachingSessionPlans from "./LessonEvaluations"; // Renamed import, path remains the same
import ParticipantInfo from "./ParticipantInfo"; // Import the new component
import HelpPage from "./HelpPage"; // Import the HelpPage component
import LandingPage from "./LandingPage"; // Import the LandingPage component
import LockOpenIcon from '@mui/icons-material/LockOpen'; // Added import
import createCache from '@emotion/cache'; // Import createCache
import PrivacyPolicyPage from './PrivacyPolicyPage'; // Import the PrivacyPolicyPage component
import { InteractionStatus } from "@azure/msal-browser"; // Import InteractionStatus

const nonce = 'mui-csp-nonce-12345'; // Define a nonce

// Create an Emotion cache with the nonce
const emotionCache = createCache({ // Renamed cache to emotionCache to avoid conflict
  key: 'css',
  nonce: nonce,
});

const loginRequest = { // Moved loginRequest to a higher scope
  scopes: ["openid", "profile", "User.Read"], // Standard MSAL scopes for login
};

const dataverseRequest = { // Define dataverseRequest for token acquisition
  scopes: [process.env.REACT_APP_DATAVERSE_SCOPE || ""].filter(scope => scope), // Ensure it's an array and filter out empty strings
};

// Create a default MUI theme - THIS THEME IS USED
const theme = createTheme({
  palette: {
    primary: {
      main: '#57ab5d', // Example: MUI blue
    },
    secondary: {
      main: '#dc004e', // Example: MUI pink
    },
  },
});


const AppWithEmotionCache = () => { // Renamed App to AppWithEmotionCache
  const { instance, accounts, inProgress } = useMsal(); // Added inProgress
  const [anchorEl, setAnchorEl] = useState(null); // State for mobile menu
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [userConsent, setUserConsent] = useState({ given: false, version: null });
  const [isConsentLoading, setIsConsentLoading] = useState(true);
  const account = accounts[0];
  const userName = account?.name || account?.username;
  const dataverseBaseUrl = process.env.REACT_APP_DATAVERSE_URL;
  const navigate = useNavigate(); // Added useNavigate hook

  console.log("Accounts:", accounts);

  // Helper function to acquire Dataverse token
  const acquireDataverseToken = async () => {
    if (!account) return null;
    console.log("Attempting to acquire Dataverse token with request:", dataverseRequest); // Log the request
    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...dataverseRequest,
        account: account,
      });
      console.log("Dataverse token acquired successfully."); // Log success
      // console.log("Token:", tokenResponse.accessToken); // Avoid logging the full token in production
      return tokenResponse.accessToken;
    } catch (error) {
      console.error("Dataverse token acquisition error:", error);
      if (error.name === "InteractionRequiredAuthError" || error.name === "BrowserAuthError") {
        // Fallback to interactive method if silent fails
        try {
          const tokenResponse = await instance.acquireTokenRedirect({
             ...dataverseRequest,
             account: account, // ensure account is passed for redirect as well
          });
          console.log("Dataverse token acquired via redirect successfully."); // Log success via redirect
          // console.log("Token via redirect:", tokenResponse.accessToken); // Avoid logging full token
          return tokenResponse.accessToken;
        } catch (redirectError) {
          console.error("Dataverse token acquisition redirect error:", redirectError);
          return null;
        }
      }
      return null;
    }
  };

  // Fetch consent from Dataverse
  const fetchConsentFromDataverse = async () => {
    if (!account || !dataverseBaseUrl) return null;
    const token = await acquireDataverseToken();
    if (!token) {
      console.error("Fetch consent: No token acquired for Dataverse.");
      return null;
    }

    try {
      // IMPORTANT: Replace 'new_userconsents', 'new_userid', 'new_policyversion'
      // with your actual Dataverse entity and field logical names.
      const response = await fetch(
        `${dataverseBaseUrl}/api/data/v9.2/cr648_table1s?$filter=cr648_new_userid eq '${account.homeAccountId}'&$select=cr648_new_policyversion&$top=1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            Accept: "application/json",
          },
        }
      );
      if (!response.ok) {
        console.error("Failed to fetch consent from Dataverse. Status:", response.status, "Text:", response.statusText);
        return null;
      }
      const data = await response.json();
      if (data.value && data.value.length > 0) {
        return data.value[0].cr648_new_policyversion; // Assuming this field stores the consented version
      }
      return null;
    } catch (error) {
      console.error("Error fetching consent from Dataverse:", error);
      return null;
    }
  };

  // Save consent to Dataverse
  const saveConsentToDataverse = async (policyVersion) => {
    if (!account || !dataverseBaseUrl) return false;
    const token = await acquireDataverseToken();
    if (!token) {
      console.error("Save consent: No token acquired for Dataverse.");
      return false;
    }

    try {
      // IMPORTANT: Replace 'new_userconsents', 'new_userid', 'new_userconsentid', 
      // 'new_policyversion', 'new_consenttimestamp' with your actual Dataverse entity and field logical names.

      // Check if a consent record already exists for this user
      const getResponse = await fetch(
        `${dataverseBaseUrl}/api/data/v9.2/cr648_table1s?$filter=cr648_new_userid eq '${account.homeAccountId}'&$select=cr648_new_userconsentid`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            Accept: "application/json",
          },
        }
      );

      let consentRecordId = null;
      if (getResponse.ok) {
        const getData = await getResponse.json();
        if (getData.value && getData.value.length > 0) {
          consentRecordId = getData.value[0].cr648_new_userconsentid; // Assuming 'cr648_new_userconsentid' is the primary key
        }
      } else {
        console.error("Failed to check existing consent:", getResponse.statusText);
        // Proceed to create if check fails, or handle error more gracefully
      }

      const consentData = {
        cr648_new_policyversion: policyVersion,
        cr648_new_consenttimestamp: new Date().toISOString(),
      };

      let response;
      if (consentRecordId) {
        // Update existing record
        response = await fetch(
          `${dataverseBaseUrl}/api/data/v9.2/cr648_table1s(${consentRecordId})`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "OData-MaxVersion": "4.0",
              "OData-Version": "4.0",
              Accept: "application/json",
            },
            body: JSON.stringify(consentData),
          }
        );
      } else {
        // Create new record
        // Add the user identifier only when creating a new record
        const createData = { ...consentData, "cr648_new_userid": account.homeAccountId };
        response = await fetch(
          `${dataverseBaseUrl}/api/data/v9.2/cr648_table1s`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "OData-MaxVersion": "4.0",
              "OData-Version": "4.0",
              Accept: "application/json",
            },
            body: JSON.stringify(createData),
          }
        );
      }

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Failed to save consent to Dataverse. Status:", response.status, "Text:", response.statusText, "Body:", errorBody);
        return false;
      }
      console.log("Consent saved to Dataverse successfully.");
      return true;
    } catch (error) {
      console.error("Error saving consent to Dataverse:", error);
      return false;
    }
  };


  useEffect(() => {
    const checkConsent = async () => {
      if (account && inProgress === InteractionStatus.None) {
        setIsConsentLoading(true);
        // Fetch consent from Dataverse
        const consentedVersion = await fetchConsentFromDataverse();
        const latestPolicyVersion = "1.0 - 2025-06-09"; // Must match ConsentModal.js

        if (consentedVersion && consentedVersion === latestPolicyVersion) {
          setUserConsent({ given: true, version: consentedVersion });
          setShowConsentModal(false);
        } else {
          // If no consent in Dataverse, or consent is for an outdated policy
          setUserConsent({ given: false, version: null });
          setShowConsentModal(true);
        }
        setIsConsentLoading(false);
      } else if (!account && inProgress === InteractionStatus.None) {
        // No user logged in, reset consent state
        setShowConsentModal(false);
        setUserConsent({ given: false, version: null });
        setIsConsentLoading(false);
      }
    };

    if (dataverseBaseUrl) { // Only run if Dataverse URL is configured
      checkConsent();
    } else {
      console.warn("REACT_APP_DATAVERSE_URL is not set. Consent check via Dataverse is skipped.");
      setIsConsentLoading(false); // Stop loading if no URL
      // Fallback or error message if Dataverse URL is critical
    }
  }, [account, inProgress, dataverseBaseUrl, instance]); // Added instance and dataverseBaseUrl to dependency array

  const handleMobileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch(e => { // Use loginRequest which has general scopes
      console.error("Login redirect error:", e);
      // Potentially clear consent state on login error if needed
      // localStorage.removeItem(`consent_${account?.homeAccountId}`); // Keep this commented or remove
      setUserConsent({ given: false, version: null });
    });
  };

  const handleLogout = () => {
    // Optionally clear consent from localStorage on logout if desired
    // localStorage.removeItem(`consent_${account?.homeAccountId}`);
    instance.logoutRedirect().catch(e => {
      console.error("Logout redirect error:", e);
    });
  };

  const handleAgreeToConsent = async (policyVersion) => {
    if (account) {
      // Save consent to Dataverse
      const success = await saveConsentToDataverse(policyVersion);
      if (success) {
        setUserConsent({ given: true, version: policyVersion });
        setShowConsentModal(false);
      } else {
        // Handle failure to save consent, e.g., show an error message
        alert("Failed to save your consent. Please try again or contact support.");
      }
    }
  };

  const handleDisagreeToConsent = () => {
    // User disagreed, log them out or restrict access
    setShowConsentModal(false);
    alert("You have not agreed to the data protection policy. You will be logged out or have restricted access.");
    handleLogout(); // Example: log out user
  };


  const UnauthenticatedView = () => {
    return (
      <Container
        maxWidth="xs" // Constrain width for the login box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 128px)', // Adjust height considering header and footer
          py: 4, // Add some vertical padding
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4, // Padding inside the paper
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%', // Paper takes full width of the container
          }}
        >
          <LockOpenIcon sx={{ fontSize: 40, mb: 2 }} color="primary" />
          <Typography variant="h5" component="h1" gutterBottom>
            Sign In
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            Access your RDA Sessions Tracker account.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            fullWidth // Make button full width
            sx={{ py: 1.5 }} // Increase button padding
          >
            Sign In with Microsoft
          </Button>
        </Paper>
      </Container>
    );
  };
  
  if (inProgress !== InteractionStatus.None || isConsentLoading) {
    // Show a loading indicator while MSAL is processing or consent is being checked
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography>Loading, please wait...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <CacheProvider value={emotionCache}> {/* Use CacheProvider from @emotion/react and the created emotionCache */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {showConsentModal && account && (
          <ConsentModal
            open={showConsentModal}
            onAgree={handleAgreeToConsent}
            onDisagree={handleDisagreeToConsent}
            userName={userName}
          />
        )}
        {/* Render main app only if consent is given or not required (unauthenticated) */}
        {(!account || (userConsent.given && !showConsentModal)) && (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <AppBar position="static">
                <Toolbar>
                  {/* <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    RDA Tracker
                  </Typography> */}
                  <Box sx={{ flexGrow: 1 }}>
                    <img src={process.env.PUBLIC_URL + '/RDALOGO.svg'} alt="RDA Tracker Logo" style={{ height: '40px', marginRight: '10px' }} />
                  </Box>
                  {/* Desktop Menu Items */}
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {accounts.length > 0 && (
                      <>
                        <Button color="inherit" component={RouterLink} to="/">Home</Button> {/* Added Home link */}
                        <Button color="inherit" component={RouterLink} to="/participant-info">Participant Info</Button>
                        <Button color="inherit" component={RouterLink} to="/coaching-session-plans">Coaching Session Plans</Button>
                        <Button color="inherit" component={RouterLink} to="/help">Help</Button>
                        <Button color="inherit" onClick={handleLogout}>Logout ({userName})</Button>
                      </>
                    )}
                  </Box>
                  {/* Mobile Menu Icon */}
                  <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
                    {accounts.length > 0 && (
                      <IconButton
                        size="large"
                        edge="end"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleMobileMenuOpen}
                      >
                        <MenuIcon />
                      </IconButton>
                    )}
                  </Box>
                </Toolbar>
              </AppBar>
              {/* Mobile Menu Dropdown */}
              {accounts.length > 0 && (
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMobileMenuClose}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  sx={{ mt: '45px' }} // Adjust margin top to be below AppBar
                >
                  <MenuItem component={RouterLink} to="/" onClick={handleMobileMenuClose}>Home</MenuItem>
                  <MenuItem component={RouterLink} to="/participant-info" onClick={handleMobileMenuClose}>Participant Info</MenuItem>
                  <MenuItem component={RouterLink} to="/coaching-session-plans" onClick={handleMobileMenuClose}>Coaching Session Plans</MenuItem>
                  <MenuItem component={RouterLink} to="/help" onClick={handleMobileMenuClose}>Help</MenuItem>
                  <MenuItem onClick={() => { handleMobileMenuClose(); handleLogout(); }}>Logout ({userName})</MenuItem>
                </Menu>
              )}
              <Container component="main" sx={{ flexGrow: 1, py: 3, px: { xs: 2, sm: 3 } }}>
                <AuthenticatedTemplate>
                  {accounts.length > 0 && (
                    <Routes>
                      <Route path="/coaching-session-plans" element={<CoachingSessionPlans />} />
                      <Route path="/participant-info" element={<ParticipantInfo />} />
                      <Route path="/help" element={<HelpPage />} /> {/* Added HelpPage route */}
                      <Route path="/" element={<LandingPage />} /> {/* Default route updated to LandingPage */}
                      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} /> {/* Add route for PrivacyPolicyPage */}
                    </Routes>
                  )}
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                  <UnauthenticatedView />
                </UnauthenticatedTemplate>
              </Container>
              <Box
                component="footer"
                sx={{
                  py: 2,
                  px: 2,
                  mt: 'auto',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block">
                  Version 0.1.0
                </Typography>
                {account && (
                  <Typography variant="body2" color="text.secondary" component="span" sx={{ mr: 0.5 }}>
                    <RouterLink to="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>
                      Privacy Policy
                    </RouterLink>
                    {' | '}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" component="span">
                  © {new Date().getFullYear()} RDA Tracker
                </Typography>
              </Box>
            </Box>
        )}
        {/* Show a message if user is authenticated but consent is not given and modal is hidden (e.g. after disagreeing) */}
        {account && !userConsent.given && !showConsentModal && (
           <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 128px)', textAlign: 'center', p:3 }}>
            <Typography variant="h5" gutterBottom>Consent Required</Typography>
            <Typography variant="body1" sx={{mb:2}}>
              You must agree to the Data Protection Policy to use this application.
            </Typography>
            <Button variant="contained" onClick={() => setShowConsentModal(true)}>Review Policy</Button>
          </Box>
        )}
      </ThemeProvider>
    </CacheProvider>
  );
};

export default AppWithEmotionCache; // Ensure this exports the wrapped component
