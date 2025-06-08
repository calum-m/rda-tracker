import React from "react";
import { BrowserRouter as Router, Routes, Route, Link as RouterLink, Navigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, Container, Box, createTheme, ThemeProvider, CssBaseline, Paper } from '@mui/material';
import { CacheProvider } from '@emotion/react'; // Import CacheProvider from @emotion/react
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import CoachingSessionPlans from "./LessonEvaluations"; // Renamed import, path remains the same
import ParticipantInfo from "./ParticipantInfo"; // Import the new component
import HelpPage from "./HelpPage"; // Import the HelpPage component
import LockOpenIcon from '@mui/icons-material/LockOpen'; // Added import
import createCache from '@emotion/cache'; // Import createCache

const nonce = 'mui-csp-nonce-12345'; // Define a nonce

// Create an Emotion cache with the nonce
const emotionCache = createCache({ // Renamed cache to emotionCache to avoid conflict
  key: 'css',
  nonce: nonce,
});

const loginRequest = {
  scopes: [process.env.REACT_APP_DATAVERSE_SCOPE || ""], // Use environment variable with a fallback
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
  const { instance, accounts } = useMsal();

  console.log("Accounts:", accounts);

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch(e => {
      console.error("Login redirect error:", e);
    });
  };

  const handleLogout = () => {
    instance.logoutRedirect().catch(e => {
      console.error("Logout redirect error:", e);
    });
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
  
  return (
    <CacheProvider value={emotionCache}> {/* Use CacheProvider from @emotion/react and the created emotionCache */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  RDA Tracker
                </Typography>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {accounts.length > 0 && (
                    <>
                      <Button color="inherit" component={RouterLink} to="/participant-info">Participant Info</Button>
                      <Button color="inherit" component={RouterLink} to="/coaching-session-plans">Coaching Session Plans</Button>
                      <Button color="inherit" component={RouterLink} to="/help">Help</Button> {/* Added Help link */}
                      <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    </>
                  )}
                </Box>
                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                  {/* Add mobile menu/icon button here if needed */}
                </Box>
              </Toolbar>
            </AppBar>
            <Container component="main" sx={{ flexGrow: 1, py: 3, px: { xs: 2, sm: 3 } }}>
              <AuthenticatedTemplate>
                {accounts.length > 0 && (
                  <Routes>
                    <Route path="/coaching-session-plans" element={<CoachingSessionPlans />} />
                    <Route path="/participant-info" element={<ParticipantInfo />} />
                    <Route path="/help" element={<HelpPage />} /> {/* Added HelpPage route */}
                    <Route path="/" element={<Navigate to="/coaching-session-plans" />} /> {/* Default route */}
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
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} RDA Tracker
              </Typography>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default AppWithEmotionCache; // Ensure this exports the wrapped component
