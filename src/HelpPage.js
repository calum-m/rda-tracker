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
                    href="#offline-usage" 
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('offline-usage')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Offline Usage & Sync
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

        <Box sx={{ my: 2 }} id="offline-usage">
          <Typography variant="h5" component="h2" gutterBottom>
            Offline Usage & Sync
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>RDA Tracker is designed to work completely offline</strong>, making it perfect for field work where internet connection may be limited or unavailable.
          </Typography>
          
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            How Offline Mode Works
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Automatic Data Download:" 
                secondary="When you have internet connection, the app automatically downloads the latest participant and session data to your device." 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Full Offline Functionality:" 
                secondary="All features work without internet: view, edit, create, and delete participants and sessions. Everything is saved locally on your device." 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Intelligent Sync:" 
                secondary="When internet connection returns, all your offline changes are automatically uploaded to the server with smart conflict resolution." 
              />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            Offline Status Indicator
          </Typography>
          <Typography variant="body1" paragraph>
            Look for the status indicator in the top navigation bar:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="🌐 Online (Green):" 
                secondary="Connected to internet, data syncs automatically" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="📱 Offline (Red):" 
                secondary="No internet connection, working with local data" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="🔄 Syncing (Blue):" 
                secondary="Uploading your changes to the server" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="⏳ X Pending (Orange):" 
                secondary="Shows number of changes waiting to sync when you're back online" 
              />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            Perfect for Field Work
          </Typography>
          <Typography variant="body1" paragraph>
            The app is specifically designed for typical RDA field scenarios:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="🌅 Morning Setup:" 
                secondary="When you arrive and have 4G signal, open the app to download the latest data automatically" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="🏇 All-Day Offline Work:" 
                secondary="Work normally throughout the day - create sessions, update participant info, take notes - everything saves locally" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="🌆 Evening Sync:" 
                secondary="When you return to an area with 4G signal, all your day's work automatically syncs to the server" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="🔒 No Data Loss:" 
                secondary="Your work is always safe - even if the app closes or device restarts, everything is preserved locally" 
              />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            Managing Sync Status
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="View Sync Details:" 
                secondary="Click the status indicator to see detailed sync information, pending changes, and sync history" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Manual Sync:" 
                secondary="You can trigger a manual sync by clicking 'Sync Now' in the status details (when online)" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Conflict Resolution:" 
                secondary="If someone else changed the same data while you were offline, the app intelligently merges changes and shows you any conflicts" 
              />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            Extended Authentication
          </Typography>
          <Typography variant="body1" paragraph>
            Your login session is designed to last all day offline. The app stores authentication tokens securely on your device, so you won't need to log in again during typical field work hours.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }} id="data-protection">
          <Typography variant="h5" component="h2" gutterBottom>
            Data Protection & Privacy
          </Typography>
          <Typography variant="body1" paragraph>
            RDA Tracker includes a comprehensive GDPR compliance toolkit to protect your personal data and give you complete control over your information.
          </Typography>
          
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            Enhanced Consent Management
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Granular Consent Categories:" 
                secondary="On first login, you'll see detailed consent options for different types of data: essential functionality, medical information, progress photos, communications, analytics, and data sharing." 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Parental Consent for Minors:" 
                secondary="Special protection for participants under 16 - requires explicit parental or guardian consent with additional safeguards." 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Update Preferences Anytime:" 
                secondary="You can modify your consent preferences at any time through your Privacy Dashboard." 
              />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            Your Data Rights (GDPR)
          </Typography>
          <Typography variant="body1" paragraph>
            Access your complete data rights through the{' '}
            <Link component={RouterLink} to="/privacy-dashboard" sx={{ fontWeight: 'bold' }}>
              Privacy Dashboard
            </Link>{' '}
            in your account:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Right of Access:" 
                secondary="Download a complete copy of all your personal data in a portable format with one click" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Right to Rectification:" 
                secondary="Correct any inaccurate personal information directly through the participant info page" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Right to Erasure ('Right to be Forgotten'):" 
                secondary="Permanently delete all your personal data from our systems with a simple request" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Right to Data Portability:" 
                secondary="Transfer your data to another RDA center or service provider in a machine-readable format" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Right to Restrict Processing:" 
                secondary="Limit how your data is used while maintaining essential safety records" 
              />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            Data Retention & Cleanup
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Automated Retention Policies:" 
                secondary="Different types of data are automatically deleted after appropriate periods: medical data (7 years), progress photos (2 years), communications (3 years)" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Legal Compliance:" 
                secondary="Safeguarding and insurance-required records are retained for the minimum legal period, then automatically deleted" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Data Minimization:" 
                secondary="We only collect and store data that's necessary for RDA services and safety requirements" 
              />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            Privacy Dashboard Features
          </Typography>
          <Typography variant="body1" paragraph>
            Navigate to{' '}
            <Link component={RouterLink} to="/privacy-dashboard" sx={{ fontWeight: 'bold' }}>
              /privacy-dashboard
            </Link>{' '}
            to access:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Consent Status Overview:" 
                secondary="See exactly what you've consented to and when, with easy options to update preferences" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Data Overview:" 
                secondary="View statistics about your stored data including number of sessions, photos, and data retention periods" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="One-Click Data Export:" 
                secondary="Download all your data in JSON format for portability or backup purposes" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Account Deletion:" 
                secondary="Complete data removal with confirmation and audit trail (cannot be undone)" 
              />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            Privacy Policy & Contact
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Full Privacy Policy:" 
                secondary={
                  <>
                    Review our complete privacy policy at{' '}
                    <Link component={RouterLink} to="/privacy-policy">
                      /privacy-policy
                    </Link>{' '}
                    for detailed information about data processing
                  </>
                } 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Data Protection Officer:" 
                secondary="Contact privacy@highlandgrouprda.org.uk for any data protection questions or to exercise your rights" 
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
              <ListItemText primary="Offline-First Architecture:" secondary="All data is stored locally on your device using IndexedDB, allowing full functionality without internet connection." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Intelligent Data Sync:" secondary="Bidirectional synchronization with automatic conflict resolution when connectivity returns. Failed sync attempts are automatically retried." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Client-Side Pagination:" secondary="Data is paginated on the client side to avoid server limitations and provide smooth navigation through large datasets." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Real-Time Search:" secondary="Search results update instantly as you type, with no need to press enter or click a search button." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Extended Authentication:" secondary="Login sessions are designed to last all day offline, with secure token storage for field work scenarios." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Progressive Web App (PWA):" secondary="Install the app on your device for native app-like experience with enhanced offline capabilities and faster loading." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Data Persistence:" secondary="All changes are saved both locally (immediate) and to Microsoft Dataverse (when online), ensuring your data is never lost." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Enhanced Error Handling:" secondary="The system provides clear error messages and gracefully handles network interruptions, server errors, and offline scenarios." />
            </ListItem>
            <ListItem>
              <ListItemText primary="GDPR Compliance Automation:" secondary="Built-in data protection features including automated retention policies, audit trails, and comprehensive user rights management." />
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
            <strong>Login Issues:</strong> If you have trouble logging in, please ensure you are using the correct Microsoft account. Try clearing your browser's cache and cookies, or try a different browser. Your login session is designed to last all day for offline work.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Data Not Saving:</strong> Don't worry - your data is saved! All changes are immediately saved locally on your device. If you're offline, check the sync status indicator - your changes will upload automatically when you're back online.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Offline Mode Issues:</strong> If the app shows you're offline but you think you have internet, try refreshing the page. The offline indicator should update automatically. All functionality works offline, so you can continue working normally.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Sync Problems:</strong> If changes aren't syncing when you're back online, click the sync status indicator and try 'Sync Now'. Check for any error messages. Failed syncs are automatically retried, so your data won't be lost.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Page Not Loading:</strong> The app works offline, so page loading issues are rare. Try refreshing the browser. If installed as a PWA, try opening from your app list instead of the browser.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Search Not Responding:</strong> Search works offline using your local data, so no internet connection is required. If search isn't working, try refreshing the page.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Privacy Dashboard Issues:</strong> If you can't access your privacy dashboard or data export features, ensure you're logged in and try refreshing the page. Contact privacy@highlandgrouprda.org.uk for data protection assistance.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>PWA Installation Issues:</strong> If the app won't install as a PWA, try using Chrome or Edge browsers. Look for the install icon in the address bar. Some browsers require HTTPS for PWA installation.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body1" paragraph sx={{ mt: 3, fontStyle: 'italic' }}>
          <strong>For Technical Support:</strong> Contact the system administrator<br/>
          <strong>For Data Protection Questions:</strong> Contact privacy@highlandgrouprda.org.uk<br/>
          <strong>For GDPR Rights:</strong> Use your Privacy Dashboard or contact our Data Protection Officer
        </Typography>

        <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3, color: 'primary.main' }}>
          New in Version 2.1.0
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="🔄 Complete Offline Functionality" 
              secondary="Work all day without internet connection - perfect for field locations" 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="🔐 GDPR Compliance Toolkit" 
              secondary="Full data protection rights management with privacy dashboard" 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="📱 Enhanced PWA Features" 
              secondary="Improved app installation and offline performance" 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="🎯 Intelligent Sync" 
              secondary="Automatic background synchronization with conflict resolution" 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="🛡️ Extended Authentication" 
              secondary="All-day offline sessions designed for field work scenarios" 
            />
          </ListItem>
        </List>

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
