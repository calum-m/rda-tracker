import React, { useState, useEffect, useCallback } from "react";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { Route, Routes, Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Container, Box, ThemeProvider, CssBaseline, Paper, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { CacheProvider } from '@emotion/react';
import ConsentModal from "./ConsentModal";
import PrivacyDashboard from "./gdpr/PrivacyDashboard";
import GDPRAdminPanel from "./gdpr/GDPRAdminPanel";
import DataDeletedPage from "./gdpr/DataDeletedPage";
import CoachingSessions from "./CoachingSessions"; // Renamed import
import ParticipantInfo from "./ParticipantInfo";
import HelpPage from "./HelpPage";
import LandingPage from "./LandingPage";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import LoggedOutPage from './LoggedOutPage';
import OfflineIndicator from './components/OfflineIndicator';
import { InteractionStatus } from "@azure/msal-browser";
import { theme, emotionCache } from './theme'; // Import theme and emotionCache
import { syncService } from './syncService'; // Import sync service

const loginRequest = {
  scopes: ["openid", "profile", "User.Read"],
};

const dataverseRequest = {
  scopes: [process.env.REACT_APP_DATAVERSE_SCOPE || "https://orgdbcfb9bc.crm11.dynamics.com/.default"].filter(scope => scope),
};

const AppWithEmotionCache = () => {
  const { instance, accounts, inProgress } = useMsal();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [userConsent, setUserConsent] = useState({ given: false, version: null });
  const [isConsentLoading, setIsConsentLoading] = useState(true);
  const account = accounts[0];
  const userName = account?.name || account?.username;
  const dataverseBaseUrl = process.env.REACT_APP_DATAVERSE_URL;

  console.log("Accounts:", accounts);

  const acquireDataverseToken = useCallback(async () => {
    if (!account) return null;
    console.log("Attempting to acquire Dataverse token with request:", dataverseRequest);
    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...dataverseRequest,
        account: account,
      });
      console.log("Dataverse token acquired successfully.");
      return tokenResponse.accessToken;
    } catch (error) {
      console.error("Dataverse token acquisition error:", error);
      if (error.name === "InteractionRequiredAuthError" || error.name === "BrowserAuthError") {
        try {
          const tokenResponse = await instance.acquireTokenRedirect({
             ...dataverseRequest,
             account: account,
          });
          console.log("Dataverse token acquired via redirect successfully.");
          return tokenResponse.accessToken;
        } catch (redirectError) {
          console.error("Dataverse token acquisition redirect error:", redirectError);
          return null;
        }
      }
      return null;
    }
  }, [account, instance]);

  const fetchConsentFromDataverse = useCallback(async () => {
    if (!account || !dataverseBaseUrl) return null;
    const token = await acquireDataverseToken();
    if (!token) {
      console.error("Fetch consent: No token acquired for Dataverse.");
      return null;
    }
    try {
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
        return data.value[0].cr648_new_policyversion;
      }
      return null;
    } catch (error) {
      console.error("Error fetching consent from Dataverse:", error);
      return null;
    }
  }, [account, dataverseBaseUrl, acquireDataverseToken]);

  const saveConsentToDataverse = useCallback(async (policyVersion) => {
    if (!account || !dataverseBaseUrl) return false;
    const token = await acquireDataverseToken();
    if (!token) {
      console.error("Save consent: No token acquired for Dataverse.");
      return false;
    }
    try {
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
          consentRecordId = getData.value[0].cr648_new_userconsentid;
        }
      } else {
        console.error("Failed to check existing consent:", getResponse.statusText);
      }
      const consentData = {
        cr648_new_policyversion: policyVersion,
        cr648_new_consenttimestamp: new Date().toISOString(),
      };
      let response;
      if (consentRecordId) {
        response = await fetch(
          `${dataverseBaseUrl}/api/data/v9.2/cr648_table1s(${consentRecordId})`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`, "Content-Type": "application/json", "OData-MaxVersion": "4.0", "OData-Version": "4.0", Accept: "application/json",
            },
            body: JSON.stringify(consentData),
          }
        );
      } else {
        const createData = { ...consentData, "cr648_new_userid": account.homeAccountId };
        response = await fetch(
          `${dataverseBaseUrl}/api/data/v9.2/cr648_table1s`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`, "Content-Type": "application/json", "OData-MaxVersion": "4.0", "OData-Version": "4.0", Accept: "application/json",
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
  }, [account, dataverseBaseUrl, acquireDataverseToken]);

  const latestPolicyVersion = "1.1 - 2025-06-10"; // Ensure this is the single source of truth

  useEffect(() => {
    const checkConsent = async () => {
      if (account && inProgress === InteractionStatus.None) {
        setIsConsentLoading(true);
        const consentedVersion = await fetchConsentFromDataverse();
        // const latestPolicyVersion = "1.1 - 2025-06-10"; // Commented out: Defined above useEffect
        if (consentedVersion && consentedVersion === latestPolicyVersion) {
          setUserConsent({ given: true, version: consentedVersion });
          setShowConsentModal(false);
        } else {
          setUserConsent({ given: false, version: null });
          setShowConsentModal(true);
        }
        setIsConsentLoading(false);
      } else if (!account && inProgress === InteractionStatus.None) {
        setShowConsentModal(false);
        setUserConsent({ given: false, version: null });
        setIsConsentLoading(false);
      }
    };
    if (dataverseBaseUrl) {
      checkConsent();
    } else {
      console.warn("REACT_APP_DATAVERSE_URL is not set. Consent check via Dataverse is skipped.");
      setIsConsentLoading(false);
    }
  }, [account, inProgress, dataverseBaseUrl, instance, fetchConsentFromDataverse]);

  // Initialize sync service when account is available
  useEffect(() => {
    if (account && instance) {
      syncService.init(instance);
      // Perform initial sync when user logs in
      if (navigator.onLine) {
        syncService.performSync();
      }
    }
  }, [account, instance]);

  // Global online/offline event handlers to ensure sync always triggers
  useEffect(() => {
    const handleAppOnline = async () => {
      if (account && instance && navigator.onLine) {
        console.log('App-level online event detected, triggering sync');
        try {
          await syncService.performSync();
        } catch (error) {
          console.error('Sync failed after coming online:', error);
        }
      }
    };

    const handleAppOffline = () => {
      console.log('App-level offline event detected');
    };

    window.addEventListener('online', handleAppOnline);
    window.addEventListener('offline', handleAppOffline);

    return () => {
      window.removeEventListener('online', handleAppOnline);
      window.removeEventListener('offline', handleAppOffline);
    };
  }, [account, instance]);

  const handleMobileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = useCallback(() => {
    instance.loginRedirect(loginRequest).catch(e => {
      console.error("Login redirect error:", e);
      setUserConsent({ given: false, version: null });
    });
  }, [instance]);

  const handleLogout = useCallback(() => {
    instance.logoutRedirect().catch(e => {
      console.error("Logout redirect error:", e);
    });
  }, [instance]);

  const handleAgreeToConsent = useCallback(async (policyVersion) => {
    if (account) {
      const success = await saveConsentToDataverse(policyVersion);
      if (success) {
        setUserConsent({ given: true, version: policyVersion });
        setShowConsentModal(false);
      } else {
        alert("Failed to save your consent. Please try again or contact support.");
      }
    }
  }, [account, saveConsentToDataverse, setUserConsent, setShowConsentModal]); // Added setUserConsent and setShowConsentModal to dependencies
  
  const handleDisagreeToConsent = useCallback(() => {
    setUserConsent({ given: false, version: null }); // Explicitly set consent state to not given
    setShowConsentModal(true); // Ensure the modal remains visible
    alert("You have not agreed to the data protection policy. Access to features requiring data access will be restricted until consent is provided. You can agree by interacting with the modal.");
    // handleLogout(); // Logout call removed
  }, [setUserConsent, setShowConsentModal]); // Dependencies updated

  const UnauthenticatedView = () => {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          backgroundImage: 'url(/field_background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Add overlay for better text readability
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1
          }
        }}
      >
        <Paper
          elevation={6}
          sx={{
            position: 'relative',
            zIndex: 2,
            p: { xs: 3, sm: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: 3,
            maxWidth: { xs: '90%', sm: '400px' },
            width: '100%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            textAlign: 'center'
          }}
        >
          <LockOpenIcon 
            sx={{ 
              fontSize: 50, 
              mb: 2, 
              color: 'primary.main',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }} 
          />
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              mb: 2
            }}
          >
            Welcome to RDA Tracker
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 4, 
              color: 'text.secondary',
              fontWeight: 'medium'
            }}
          >
            Sign in to access your RDA Sessions Tracker account.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            size="large"
            sx={{ 
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Sign In with Microsoft
          </Button>
        </Paper>
      </Box>
    );
  };
  
  // PRIORITY 1: If it's the privacy policy page, render it directly.
  if (location.pathname === '/privacy-policy') {
    return (
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <PrivacyPolicyPage />
        </ThemeProvider>
      </CacheProvider>
    );
  }

  // PRIORITY 2: If MSAL is busy or consent is loading (for other pages), show loading screen.
  if (inProgress !== InteractionStatus.None || isConsentLoading) {
    return (
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Typography>Loading, please wait...</Typography>
          </Box>
        </ThemeProvider>
      </CacheProvider>
    );
  }

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {showConsentModal && (
          <ConsentModal
            open={showConsentModal}
            onAgree={handleAgreeToConsent}
            onDisagree={handleDisagreeToConsent}
            userName={userName}
            latestPolicyVersion={latestPolicyVersion} // Pass latestPolicyVersion to ConsentModal
          />
        )}
        <Box sx={{ flexGrow: 1 }}>
          {(!account || (userConsent.given && !showConsentModal)) && (
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <AppBar position="static">
                  <Toolbar>
                    <Box sx={{ flexGrow: 1 }}>
                      <img src={process.env.PUBLIC_URL + '/RDALOGO.svg'} alt="RDA Tracker Logo" style={{ height: '40px', marginRight: '10px' }} />
                    </Box>
                    {accounts.length > 0 && (
                      <Box sx={{ mr: 2 }}>
                        <OfflineIndicator />
                      </Box>
                    )}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      {accounts.length > 0 && (
                        <>
                          <Button color="inherit" component={RouterLink} to="/">Home</Button>
                          <Button color="inherit" component={RouterLink} to="/coaching-sessions">Coaching Sessions</Button> {/* Renamed text and path */}
                          <Button color="inherit" component={RouterLink} to="/participant-info">Participant Info</Button>
                          <Button color="inherit" component={RouterLink} to="/help">Help</Button>
                          <Button color="inherit" onClick={handleLogout}>Logout ({userName})</Button>
                        </>
                      )}
                    </Box>
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
                    sx={{ mt: '45px' }} 
                  >
                    <MenuItem component={RouterLink} to="/" onClick={handleMobileMenuClose}>Home</MenuItem>
                    <MenuItem component={RouterLink} to="/coaching-sessions" onClick={handleMobileMenuClose}>Coaching Sessions</MenuItem> {/* Renamed text and path */}
                    <MenuItem component={RouterLink} to="/participant-info" onClick={handleMobileMenuClose}>Participant Info</MenuItem>
                    <MenuItem component={RouterLink} to="/help" onClick={handleMobileMenuClose}>Help</MenuItem>
                    <MenuItem onClick={() => { handleMobileMenuClose(); handleLogout(); }}>Logout ({userName})</MenuItem>
                  </Menu>
                )}
{(location.pathname === '/' && accounts.length > 0) || location.pathname === '/logged-out' || accounts.length === 0 ? (
                  // Full-screen layout for homepage, logged-out page, and sign-in
                  <Box component="main" sx={{ flexGrow: 1 }}>
                    <AuthenticatedTemplate>
                      {location.pathname === '/' && <LandingPage />}
                    </AuthenticatedTemplate>
                    <UnauthenticatedTemplate>
                      <Routes>
                        <Route path="/logged-out" element={<LoggedOutPage />} />
                        <Route path="/*" element={<UnauthenticatedView />} />
                      </Routes>
                    </UnauthenticatedTemplate>
                  </Box>
                ) : (
                  // Standard container layout for other pages
                  <Container component="main" sx={{ flexGrow: 1, py: 3, px: { xs: 2, sm: 3 } }}>
                    <AuthenticatedTemplate>
                      {accounts.length > 0 && (
                        <Routes>
                          <Route path="/coaching-sessions" element={<CoachingSessions />} /> {/* Renamed path and component */}
                          <Route path="/participant-info" element={<ParticipantInfo />} />
                          <Route path="/help" element={<HelpPage />} />
                          <Route path="/privacy-dashboard" element={<PrivacyDashboard />} />
                          <Route path="/gdpr-admin" element={<GDPRAdminPanel />} />
                          <Route path="/data-deleted" element={<DataDeletedPage />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                        </Routes>
                      )}
                    </AuthenticatedTemplate>
                  </Container>
                )}
{/* Hide footer on full-screen background pages */}
                {location.pathname !== '/' && location.pathname !== '/logged-out' && accounts.length > 0 && (
                  <Box
                    component="footer"
                    sx={{
                      py: 2,
                      px: 2,
                      mt: 'auto',
                      backgroundColor: (thm) =>
                        thm.palette.mode === 'light' ? thm.palette.grey[200] : thm.palette.grey[800],
                      textAlign: 'center',
                    }}
                  >
                  <Typography variant="caption" color="text.secondary" display="block">
                    Version 2.3.0
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
                )}
              </Box>
          )}
          {account && !userConsent.given && !showConsentModal && (
             <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 128px)', textAlign: 'center', p:3 }}>
              <Typography variant="h5" gutterBottom>Consent Required</Typography>
              <Typography variant="body1" sx={{mb:2}}>\
                You must agree to the Data Protection Policy to use this application.\
              </Typography>
              <Button variant="contained" onClick={() => setShowConsentModal(true)}>Review Policy</Button>
            </Box>
          )}
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default AppWithEmotionCache;
