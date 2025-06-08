import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, Container, Box, createTheme, ThemeProvider, CssBaseline, Paper, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Import MenuIcon
import { CacheProvider } from '@emotion/react'; // Import CacheProvider from @emotion/react
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import CoachingSessionPlans from "./LessonEvaluations"; // Renamed import, path remains the same
import ParticipantInfo from "./ParticipantInfo"; // Import the new component
import HelpPage from "./HelpPage"; // Import the HelpPage component
import LandingPage from "./LandingPage"; // Import the LandingPage component
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
  const [anchorEl, setAnchorEl] = useState(null); // State for mobile menu

  console.log("Accounts:", accounts);

  const handleMobileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setAnchorEl(null);
  };

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
                      <Button color="inherit" onClick={handleLogout}>Logout</Button>
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
                <MenuItem onClick={() => { handleMobileMenuClose(); handleLogout(); }}>Logout</MenuItem>
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
