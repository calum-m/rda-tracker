import React from 'react';
import { Container, Typography, Paper, Box, List, ListItem, ListItemText, Divider, Link, Card, CardContent, Fab } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function HelpPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }} id="help-page-top">
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
          Help & Support
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the RDA Tracker Help Page. Here you'll find information on how to use the application, understand its features, and manage your data.
        </Typography>

        {/* Table of Contents */}
        <Card elevation={2} sx={{ mb: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Table of Contents
            </Typography>
            <Box component="nav" aria-label="Help page navigation">
              <List dense sx={{ py: 0 }}>
                <ListItem sx={{ py: 0.5 }}>
                  <Link 
                    href="#getting-started" 
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('getting-started')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Getting Started
                  </Link>
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <Link 
                    href="#data-protection" 
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('data-protection')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Data Protection & Privacy
                  </Link>
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <Link 
                    href="#participant-info" 
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('participant-info')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Participant Information
                  </Link>
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <Link 
                    href="#coaching-sessions" 
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('coaching-sessions')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Coaching Sessions
                  </Link>
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <Link 
                    href="#ui-navigation" 
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('ui-navigation')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    User Interface & Navigation
                  </Link>
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <Link 
                    href="#data-management" 
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('data-management')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Data Management & Technical Features
                  </Link>
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <Link 
                    href="#pwa-install" 
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('pwa-install')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Installing as a Progressive Web App (PWA)
                  </Link>
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <Link 
                    href="#logging-out" 
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('logging-out')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Logging Out
                  </Link>
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <Link 
                    href="#troubleshooting" 
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('troubleshooting')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Troubleshooting
                  </Link>
                </ListItem>
              </List>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }} id="getting-started">
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

        <Box sx={{ my: 2 }} id="data-protection">
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

        <Box sx={{ my: 2 }} id="participant-info">
          <Typography variant="h5" component="h2" gutterBottom>
            Participant Information
          </Typography>
          <Typography variant="body1" paragraph>
            In the "Participant Info" section, you can manage all participant data:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="View Participants:" secondary="A paginated table displays all participants (10 per page). Each row shows first name, last name, and date of birth." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Search Participants:" secondary="Use the search bar to find participants by name or date of birth. Results are filtered instantly as you type." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Add New Participant:" secondary="Click 'Add New Participant' to open a dialog form. Fill in the required fields (marked with *) such as first name, last name, date of birth, and optional details like contact information and consent status." />
            </ListItem>
            <ListItem>
              <ListItemText primary="View Mode (Eye Icon):" secondary="Click the eye icon to view participant details in read-only mode. This expands the row to show all participant information in a formatted, non-editable display." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Edit Mode (Pencil Icon):" secondary="Click the edit icon to modify participant details. This opens an editable form where you can update any field. Click 'Save Changes' when finished." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Delete Participant:" secondary="Click the delete (trash) icon to remove a participant. A confirmation dialog will appear to prevent accidental deletions." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Pagination:" secondary="Use the page numbers at the bottom to navigate through participants. The system shows 10 participants per page with traditional page numbering (1, 2, 3, etc.)." />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }} id="coaching-sessions">
          <Typography variant="h5" component="h2" gutterBottom>
            Coaching Sessions
          </Typography>
          <Typography variant="body1" paragraph>
            In the "Coaching Sessions" section, you can manage all coaching session records:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="View Sessions:" secondary="A paginated table displays all coaching sessions (10 per page) with session details, date, participant evaluations, and coach names." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Search & Filter:" secondary="Use the main search bar for quick searches across all fields. Use Advanced Filters to search by specific criteria like lesson plan, date range, participant evaluation content, or coach name." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Create New Session:" secondary="Click 'Create New Coaching Session' to open a dialog form. Enter session details, date, participant evaluation/notes, and coach name." />
            </ListItem>
            <ListItem>
              <ListItemText primary="View Mode (Eye Icon):" secondary="Click the eye icon to view session details in read-only mode. The row expands to show all information in a formatted, non-editable display with a grey background." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Edit Mode (Pencil Icon):" secondary="Click the edit icon to modify session details. The row expands to show editable text fields. Click 'Save' to confirm changes or 'Cancel' to discard them." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Delete Session:" secondary="Click the delete (trash) icon to remove a session. A confirmation dialog will appear to prevent accidental deletions." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Pagination:" secondary="Navigate through sessions using page numbers at the bottom. The system shows 10 sessions per page with traditional page numbering." />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }} id="ui-navigation">
          <Typography variant="h5" component="h2" gutterBottom>
            User Interface & Navigation
          </Typography>
          <Typography variant="body1" paragraph>
            The application features a modern, responsive design built with Material-UI components:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Responsive Design:" secondary="The interface adapts to desktop, tablet, and mobile devices. On mobile devices, the navigation menu collapses into a hamburger menu for better usability." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Icon System:" secondary="Each action has a clear icon: eye (view mode), pencil (edit mode), trash (delete), plus (add new), and save icons for better visual recognition." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Pagination Controls:" secondary="All data tables use consistent pagination with page numbers (1, 2, 3...) showing 10 records per page. Pagination controls appear at the bottom center of each table." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Form Validation:" secondary="Required fields are marked with asterisks (*) and the system prevents submission of incomplete forms with clear error messages." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Loading States:" secondary="Progress indicators appear during data loading, saving, and deletion operations to provide clear feedback on system status." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Confirmation Dialogs:" secondary="All destructive actions (like deleting records) require confirmation through popup dialogs to prevent accidental data loss." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Dual Mode Operations:" secondary="Both participant and coaching session records support two viewing modes: View Mode (read-only with formatted display) and Edit Mode (fully editable with save/cancel options)." />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }} id="pwa-install">
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

        <Box sx={{ my: 2 }} id="logging-out">
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

        <Box sx={{ my: 2 }} id="data-management">
          <Typography variant="h5" component="h2" gutterBottom>
            Data Management & Technical Features
          </Typography>
          <Typography variant="body1" paragraph>
            The application includes several advanced features for efficient data management:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Client-Side Pagination:" secondary="Data is paginated on the client side to avoid server limitations and provide smooth navigation through large datasets." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Real-Time Search:" secondary="Search results update instantly as you type, with no need to press enter or click a search button." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Data Persistence:" secondary="All changes are automatically saved to Microsoft Dataverse, ensuring your data is securely stored and accessible across sessions." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Error Handling:" secondary="The system provides clear error messages for any issues and gracefully handles network interruptions or server errors." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Consistent Styling:" secondary="The entire application uses Material-UI components for a consistent, professional appearance across all features." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Advanced Filtering:" secondary="In Coaching Sessions, you can filter by specific date ranges, exact lesson plans, participant evaluations, and coach names simultaneously." />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }} id="troubleshooting">
          <Typography variant="h5" component="h2" gutterBottom>
            Troubleshooting
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Login Issues:</strong> If you have trouble logging in, please ensure you are using the correct Microsoft account. Try clearing your browser's cache and cookies, or try a different browser.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Data Not Saving:</strong> If your changes don't seem to save, check for any error messages displayed on the screen. Ensure all required fields are filled correctly. Look for the save confirmation or error alerts that appear after attempting to save.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Page Not Loading:</strong> Check your internet connection. If the problem persists, the application might be temporarily unavailable.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Pagination Not Working:</strong> If you can't navigate between pages, try refreshing the browser. The system automatically manages pagination for datasets larger than 10 records.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Search Not Responding:</strong> If search results don't update as you type, check your internet connection. The search function works in real-time and requires an active connection.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Modal Dialogs Not Opening:</strong> If create/edit forms don't appear when clicking buttons, try refreshing the page or check if your browser is blocking popups for this site.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body1" paragraph sx={{ mt: 3, fontStyle: 'italic' }}>
          If you need further assistance, please contact the system administrator.
        </Typography>

        {/* Back to Top Button */}
        <Fab 
          color="primary" 
          size="small" 
          aria-label="back to top"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            zIndex: 1000
          }}
          onClick={() => {
            document.getElementById('help-page-top')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Paper>
    </Container>
  );
}

export default HelpPage;
