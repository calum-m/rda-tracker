import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Button, Container, Box, Paper } from '@mui/material';

const LandingPage = () => {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
          What do you want to do?
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/coaching-session-plans"
            fullWidth
            sx={{ py: 1.5 }}
          >
            Go to Coaching Session Plans
          </Button>
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/participant-info"
            fullWidth
            sx={{ py: 1.5 }}
          >
            Create/View Participants
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LandingPage;
