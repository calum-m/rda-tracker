import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const LoggedOutPage = () => {
  return (
    <Container
      maxWidth="xs"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 128px)', // Adjust if your header/footer height is different
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          You have been successfully logged out.
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
          Thank you for using RDA Tracker.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/" // Or your login page if different
          startIcon={<LockOpenIcon />}
          sx={{ py: 1.5, width: '100%' }}
        >
          Sign In Again
        </Button>
      </Paper>
    </Container>
  );
};

export default LoggedOutPage;
