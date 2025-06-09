// filepath: /home/calum/rda-tracker/rda-tracker/src/ConsentModal.js
import React from 'react';
import { Modal, Box, Typography, Button, Paper, Checkbox, FormControlLabel, Link } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
};

const CONSENT_POLICY_VERSION = "1.0 - 2025-06-09"; // Update as your policy changes
const PRIVACY_POLICY_URL = "/privacy-policy"; // New React Router link

const ConsentModal = ({ open, onAgree, onDisagree, userName }) => {
  const [agreedToPolicy, setAgreedToPolicy] = React.useState(false);

  const handleAgree = () => {
    if (agreedToPolicy) {
      onAgree(CONSENT_POLICY_VERSION);
    } else {
      alert("Please acknowledge the data protection policy by checking the box.");
    }
  };

  return (
    <Modal
      open={open}
      aria-labelledby="consent-modal-title"
      aria-describedby="consent-modal-description"
    >
      <Paper sx={style}>
        <Typography id="consent-modal-title" variant="h6" component="h2" gutterBottom>
          Data Protection and Usage Consent
        </Typography>
        <Box sx={{ mb: 2, maxHeight: '300px', overflowY: 'auto' }}> {/* Wrap content in a Box */}
          <Typography id="consent-modal-description" variant="body1" component="div"> {/* Change component to div */}
            Welcome, {userName || 'User'}!
            <br /><br />
            To use this application, which involves accessing and managing information related to coaching sessions and participants (client data), you must agree to our data protection policy.
            <br /><br />
            <strong>Key Points:</strong>
          </Typography>
          <ul>
            <li>We are committed to protecting the privacy and security of all data processed through this application.</li>
            <li>Client data accessed includes lesson plans, evaluation notes, dates, and coach names.</li>
            <li>This data is used solely for the purpose of tracking and managing RDA coaching sessions and participant progress.</li>
            <li>Data is stored securely within the Microsoft Dataverse environment, adhering to Microsoft's security standards.</li>
            <li>You are responsible for ensuring that any data you input or manage complies with relevant data protection regulations and organizational policies.</li>
          </ul>
          <Typography variant="body1" component="div" sx={{ mt: 2 }}> {/* Change component to div */}
            By clicking "Agree", you confirm that you have read, understood, and agree to the terms outlined here and in our full <Link href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer">Data Protection Policy</Link> (Version: {CONSENT_POLICY_VERSION}). This consent is specific to your use of this application for managing RDA session data.
            <br /><br />
            If you do not agree, you will not be able to proceed to use the application features that involve client data.
          </Typography>
        </Box>
        <FormControlLabel
          control={<Checkbox checked={agreedToPolicy} onChange={(e) => setAgreedToPolicy(e.target.checked)} />}
          label="I have read and agree to the Data Protection Policy."
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 'auto' }}>
          <Button variant="outlined" onClick={onDisagree}>
            Disagree
          </Button>
          <Button variant="contained" onClick={handleAgree} disabled={!agreedToPolicy}>
            Agree
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default ConsentModal;
