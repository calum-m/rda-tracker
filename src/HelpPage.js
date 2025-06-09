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
              <ListItemText primary="Lesson Evaluations" secondary="View, create, and manage lesson evaluations for participants." />
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
            Lesson Evaluations
          </Typography>
          <Typography variant="body1" paragraph>
            In the "Lesson Evaluations" section, you can manage coaching session evaluations:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="View Evaluations:" secondary="A list of all lesson evaluations is displayed." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Search & Filter:" secondary="Use the search bar and advanced filtering options to find specific evaluations (e.g., by lesson plan, date range, participant, coach)." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Create New Evaluation:" secondary="Click the 'Create New Record' or similar button to open a form for entering evaluation details." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Edit Evaluation:" secondary="Inline editing may be available for quick updates, or an 'Edit' option for more detailed changes." />
            </ListItem>
          </List>
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
