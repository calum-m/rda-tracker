import React from 'react';
import { Container, Typography, Paper, Box, List, ListItem, ListItemText, Link, Fab, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function HelpPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }} id="help-page-top">
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
          Help & Support
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the RDA Tracker Help Page. Click on any section below to expand and learn more about the application's features.
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Getting Started</Typography>
          </AccordionSummary>
          <AccordionDetails>
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
                <ListItemText primary="Coaching Sessions" secondary="View, create, and manage coaching sessions for participants." />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Offline Usage & Sync</Typography>
          </AccordionSummary>
          <AccordionDetails>
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
              Perfect for Field Work
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
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Data Protection & Privacy</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              RDA Tracker is fully GDPR compliant with comprehensive data protection features.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Privacy Dashboard" secondary="Access your privacy dashboard to manage your data rights, export your data, or request deletion" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Granular Consent" secondary="Separate consent options for medical data, photos, communications, and analytics" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Data Rights" secondary="Full implementation of GDPR rights including access, rectification, erasure, and portability" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Audit Trail" secondary="Complete logging of all data access and modifications for compliance" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Participant Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Manage comprehensive participant records with dual view/edit modes.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="View Mode (👁️)" secondary="Read-only display with formatted information and collapsible sections" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Edit Mode (✏️)" secondary="Full editing capabilities with save/cancel options and validation" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Real-time Search" secondary="Instant filtering by name or date of birth as you type" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Complete Records" secondary="Personal details, contact info, medical data, guardian info, consent tracking" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Data Export" secondary="Export participant records to Excel, PDF, or CSV with all 25 fields" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Coaching Sessions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Track and manage coaching sessions with comprehensive filtering and export capabilities.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Session Management" secondary="Create, view, edit, and delete coaching sessions with detailed structure" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Advanced Filtering" secondary="Filter by lesson plan, date range, participant, evaluation, or coach name" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Session Structure" secondary="Warm-up, main content, and cool-down sections with coaching points" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Participant Integration" secondary="Link sessions to participants with automatic name resolution" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Comprehensive Export" secondary="Export session data to Excel, PDF, or CSV with all 18 fields including participant names" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Data Export (Excel, PDF, CSV)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Export your data in multiple formats for reporting, backup, or external analysis.
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
              How to Export:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="1. Navigate" secondary="Go to Participant Information or Coaching Sessions page" />
              </ListItem>
              <ListItem>
                <ListItemText primary="2. Filter (optional)" secondary="Use search and filters to narrow down data" />
              </ListItem>
              <ListItem>
                <ListItemText primary="3. Export" secondary="Click Export button next to 'Add New', choose format" />
              </ListItem>
              <ListItem>
                <ListItemText primary="4. Download" secondary="File automatically saves with timestamp" />
              </ListItem>
            </List>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
              Export Features:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Complete Data" secondary="18 coaching session fields, 25 participant fields" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Smart Formatting" secondary="Dates, booleans, and codes automatically formatted" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Filtered Results" secondary="Exports respect current search and filter settings" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Works Offline" secondary="Export functionality available without internet connection" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>User Interface & Navigation</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Navigate the application efficiently with responsive design and intuitive controls.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Responsive Navigation" secondary="Desktop menu bar, mobile hamburger menu" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Icon System" secondary="👁️ View, ✏️ Edit, 💾 Save, ❌ Cancel, 🗑️ Delete" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Pagination" secondary="10 items per page with numbered page navigation" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Loading States" secondary="Progress indicators during data operations" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Status Indicators" secondary="Online/offline status, sync progress, pending changes" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Technical Features</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Advanced technical capabilities for enterprise-grade data management.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Offline-First Architecture" secondary="Full functionality without internet using IndexedDB storage" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Intelligent Sync" secondary="Bidirectional synchronization with conflict resolution" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Extended Authentication" secondary="All-day login sessions designed for field work" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Real-Time Search" secondary="Client-side search with instant results" />
              </ListItem>
              <ListItem>
                <ListItemText primary="PWA Support" secondary="Installable as desktop/mobile app" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Progressive Web App (PWA)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Install RDA Tracker as a native app on your device for better performance and offline access.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Desktop Installation" secondary="Chrome/Edge: Look for install icon in address bar" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Mobile Installation" secondary="Android: 'Add to Home Screen' | iOS: Safari Share menu" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Native App Experience" secondary="Full-screen mode, faster loading, offline capabilities" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Automatic Updates" secondary="App updates automatically when connected to internet" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Troubleshooting</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Common issues and solutions for optimal app performance.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Login Issues" secondary="Clear browser cache, check popup blockers, verify Microsoft account" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Sync Problems" secondary="Check internet connection, try manual sync, clear offline data if needed" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Data Not Loading" secondary="Refresh page, check offline status, verify data permissions" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Performance Issues" secondary="Close other browser tabs, clear browser cache, restart browser" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Export Problems" secondary="Check popup blockers, ensure sufficient storage space, try different format" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Typography variant="body2" sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          📧 Need more help? Contact your system administrator or refer to the{' '}
          <RouterLink to="/privacy-policy" style={{ color: 'inherit' }}>
            Privacy Policy
          </RouterLink>{' '}
          for additional information.
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