import React from 'react';
import { Container, Typography, Paper, Box, List, ListItem, ListItemText, Divider, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function HelpPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
          Help & Support
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the RDA Tracker Help Page. Here you'll find information on how to use the application, understand its features, and manage your data.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Getting Started
          </Typography>
          <Typography variant="body1" paragraph>
            To begin, please make sure you are logged in with your Microsoft account. 
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>First-Time Login:</strong> Upon your first login, you will be presented with a Data Protection Consent form. Please review the information and provide your consent to proceed. This is a one-time step.
          </Typography>
          <Typography variant="body1" paragraph>
            Once logged in, you will see the main navigation options, typically including:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Participant Info" secondary="Manage participant details, add new participants, and update existing information." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Coaching Sessions" secondary="View, create, and manage coaching sessions for participants." /> {/* Renamed text */}
            </ListItem>
            {/* Add other main navigation items as they are developed */}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Data Protection & Privacy
          </Typography>
          <Typography variant="body1" paragraph>
            We take your data privacy seriously. 
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Consent Modal:" 
                secondary="As mentioned, on your first login, you'll be asked for consent regarding data processing. Your consent choice will be saved." 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Privacy Policy:" 
                secondary={
                  <>
                    You can review our detailed Privacy Policy at any time. A link to the policy is available in the footer of the application and on the consent modal. You can also access it directly by navigating to the <Link component={RouterLink} to="/privacy-policy">Privacy Policy page</Link>.
                  </>
                } 
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Participant Information
          </Typography>
          <Typography variant="body1" paragraph>
            In the "Participant Info" section (managed via the Dataverse Caller interface), you can:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="View Participants:" secondary="A list of all participants is displayed. You can search for specific participants using the search bar (e.g., by first or last name)." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Add New Participant:" secondary="Click the 'Create New Record' or similar button. A form will appear where you can enter the participant's details. Required fields are typically marked." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Edit Participant:" secondary="Inline editing is often available. Click on a field within the table to modify it, or look for an 'Edit' icon or button. Save changes as prompted." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Advanced Filtering:" secondary="Utilize advanced filtering options to narrow down the list of participants based on specific criteria." />
            </ListItem>
            {/* <ListItem>
              <ListItemText primary="Delete Participant:" secondary="Functionality for deleting participants may be available, typically marked with a 'Delete' icon (trash can). Confirmation is usually required." />
            </ListItem> */}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Coaching Sessions {/* Renamed text */}
          </Typography>
          <Typography variant="body1" paragraph>\
            In the "Coaching Sessions" section, you can manage coaching sessions: {/* Renamed text */}
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="View Sessions:" secondary="A list of all coaching sessions is displayed." /> {/* Renamed text */}
            </ListItem>
            <ListItem>
              <ListItemText primary="Search & Filter:" secondary="Use the search bar and advanced filtering options to find specific sessions (e.g., by session details, date range, participant, coach)." /> {/* Renamed text */}
            </ListItem>
            <ListItem>
              <ListItemText primary="Create New Session:" secondary="Click the \\\'Create New Coaching Session\\\' or similar button to open a form for entering session details." /> {/* Renamed text */}
            </ListItem>
            <ListItem>
              <ListItemText primary="Edit Session:" secondary="Inline editing may be available for quick updates, or an \\\'Edit\\\' option for more detailed changes." /> {/* Renamed text */}
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Installing as a Progressive Web App (PWA)
          </Typography>
          <Typography variant="body1" paragraph>
            You can install the RDA Tracker as an app on your desktop or mobile device for easier access.
          </Typography>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
            On Desktop (Chrome, Edge)
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="1. Open RDA Tracker in your Chrome or Edge browser." />
            </ListItem>
            <ListItem>
              <ListItemText primary="2. Look for an install icon in the address bar (often a computer screen with a downward arrow, or three vertical dots for the menu)." />
            </ListItem>
            <ListItem>
              <ListItemText primary="3. Click the icon or menu option and select 'Install RDA Tracker' or 'Add to Home screen'." />
            </ListItem>
            <ListItem>
              <ListItemText primary="4. Follow the on-screen prompts to complete the installation." />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
            On Android (Chrome)
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="1. Open RDA Tracker in the Chrome browser on your Android device." />
            </ListItem>
            <ListItem>
              <ListItemText primary="2. Tap the three vertical dots (menu icon) in the top-right corner." />
            </ListItem>
            <ListItem>
              <ListItemText primary="3. Tap 'Install app' or 'Add to Home screen'." />
            </ListItem>
            <ListItem>
              <ListItemText primary="4. Follow the on-screen prompts." />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
            On iOS (Safari)
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="1. Open RDA Tracker in the Safari browser on your iPhone or iPad." />
            </ListItem>
            <ListItem>
              <ListItemText primary="2. Tap the 'Share' button (an icon with an upward arrow coming out of a square) at the bottom of the screen." />
            </ListItem>
            <ListItem>
              <ListItemText primary="3. Scroll down in the share menu and tap 'Add to Home Screen'." />
            </ListItem>
            <ListItem>
              <ListItemText primary="4. Confirm the name for the app icon and tap 'Add' in the top-right corner." />
            </ListItem>
          </List>
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            Note: The exact wording and icon appearance may vary slightly depending on your browser version and operating system.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Logging Out
          </Typography>
          <Typography variant="body1" paragraph>
            When you have finished your session, you can log out of the application using the "Logout" button, typically found in the navigation bar or user menu.
          </Typography>
          <Typography variant="body1" paragraph>
            Upon successful logout, you will be redirected to a "Logged Out" page confirming that your session has ended. This page also provides a convenient link to sign back in if needed.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Troubleshooting
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Login Issues:</strong> If you have trouble logging in, please ensure you are using the correct Microsoft account. Try clearing your browser's cache and cookies, or try a different browser.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Data Not Saving:</strong> If your changes don't seem to save, check for any error messages displayed on the screen. Ensure all required fields are filled correctly.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Page Not Loading:</strong> Check your internet connection. If the problem persists, the application might be temporarily unavailable.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body1" paragraph sx={{ mt: 3, fontStyle: 'italic' }}>
          If you need further assistance, please contact the system administrator.
        </Typography>
      </Paper>
    </Container>
  );
}

export default HelpPage;
