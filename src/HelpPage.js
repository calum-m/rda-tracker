import React from 'react';
import { Container, Typography, Paper, Box, List, ListItem, ListItemText, Divider } from '@mui/material';

function HelpPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
          Help & Support
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the RDA Tracker Help Page. Here you'll find information on how to use the application.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Getting Started
          </Typography>
          <Typography variant="body1" paragraph>
            To begin, please make sure you are logged in with your Microsoft account. Once logged in, you will see the main navigation options:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Participant Info" secondary="Manage participant details, add new participants, and update existing information." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Coaching Session Plans" secondary="View, create, and manage coaching session plans for participants." />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Participant Information
          </Typography>
          <Typography variant="body1" paragraph>
            In the "Participant Info" section, you can:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="View Participants:" secondary="A list of all participants is displayed. You can search for specific participants using the search bar." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Add New Participant:" secondary="Click the 'Add New Participant' button. A form will appear where you can enter the participant's details. Required fields are marked with an asterisk (*)." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Edit Participant:" secondary="Click the 'Edit' icon (pencil) next to a participant's name to expand their details. You can then modify the information and click 'Save Changes'." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Delete Participant:" secondary="Click the 'Delete' icon (trash can) next to a participant. You will be asked to confirm before the participant is removed." />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Coaching Session Plans
          </Typography>
          <Typography variant="body1" paragraph>
            This section is for managing coaching session plans. (Further details will be added here as the feature is developed).
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
