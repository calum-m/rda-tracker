import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Security,
  Home
} from '@mui/icons-material';

const DataDeletedPage = () => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Box display="flex" justifyContent="center" mb={3}>
          <CheckCircle color="success" sx={{ fontSize: 80 }} />
        </Box>
        
        <Typography variant="h4" gutterBottom color="success.main">
          Data Successfully Deleted
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          Your personal data has been permanently deleted from our systems as requested.
        </Typography>

        <Alert severity="info" sx={{ my: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>What we've deleted:</strong>
          </Typography>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Personal information and contact details</li>
            <li>All session records and evaluations</li>
            <li>Progress photos and videos</li>
            <li>Medical information and notes</li>
            <li>Communication preferences</li>
            <li>Consent history (except this deletion record)</li>
          </ul>
        </Alert>

        <Typography variant="body2" paragraph color="text.secondary">
          We have retained a minimal record of this deletion request for compliance purposes only. 
          This record contains no personal data and will be deleted after 6 years as required by law.
        </Typography>

        <Box display="flex" alignItems="center" gap={1} justifyContent="center" my={3}>
          <Security color="primary" />
          <Typography variant="body2" color="text.secondary">
            Deletion completed in compliance with GDPR Article 17
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={handleGoHome}
          size="large"
        >
          Return to Home
        </Button>

        <Typography variant="caption" display="block" sx={{ mt: 3 }} color="text.secondary">
          If you have any questions about this process, please contact our Data Protection Officer at privacy@highlandgrouprda.org.uk
        </Typography>
      </Paper>
    </Container>
  );
};

export default DataDeletedPage;