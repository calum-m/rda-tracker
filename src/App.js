import React from "react";
import { BrowserRouter as Router, Routes, Route, Link as RouterLink, Navigate } from "react-router-dom";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import LessonEvaluations from "./LessonEvaluations"; // Corrected import
import ParticipantInfo from "./ParticipantInfo"; // Import the new component

// MUI Imports
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const loginRequest = {
  scopes: ["https://orgdbcfb9bc.crm11.dynamics.com/.default"],
};

// Create a default MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Example: MUI blue
    },
    secondary: {
      main: '#dc004e', // Example: MUI pink
    },
  },
});


const App = () => {
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

  return (
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
                    <Button color="inherit" component={RouterLink} to="/lesson-evaluations">Lesson Evaluations</Button>
                  </>
                )}
              </Box>
              {accounts.length > 0 ? (
                <Button color="inherit" onClick={handleLogout}>Logout</Button>
              ) : (
                <Button color="inherit" onClick={handleLogin}>Login</Button>
              )}
            </Toolbar>
          </AppBar>

          {/* Mobile Navigation (Optional - can be implemented with a Drawer) */}
          {accounts.length > 0 && (
            <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', p: 1, bgcolor: 'primary.main' }}>
                 <Button sx={{color: 'white'}} component={RouterLink} to="/participant-info">Participant Info</Button>
                 <Button sx={{color: 'white'}} component={RouterLink} to="/lesson-evaluations">Lesson Evaluations</Button>
            </Box>
          )}


          <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
            <AuthenticatedTemplate>
              <Routes>
                <Route path="/participant-info" element={<ParticipantInfo />} />
                <Route path="/lesson-evaluations" element={<LessonEvaluations />} />
                <Route path="/" element={<Navigate to="/participant-info" />} />
              </Routes>
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
              <Box sx={{ textAlign: 'center', mt: 8 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                  Welcome
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                  Please login to access the application.
                </Typography>
                <Button variant="contained" color="primary" onClick={handleLogin} size="large">
                  Login
                </Button>
              </Box>
            </UnauthenticatedTemplate>
          </Container>

          <Box component="footer" sx={{ bgcolor: 'background.paper', py: 3, mt: 'auto', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              &copy; {new Date().getFullYear()} RDA Tracker. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
