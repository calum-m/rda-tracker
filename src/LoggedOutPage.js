import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const LoggedOutPage = () => {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundImage: 'url(/field_background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Add overlay for better text readability
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1
        }
      }}
    >
      <Paper
        elevation={6}
        sx={{
          position: 'relative',
          zIndex: 2,
          p: { xs: 3, sm: 4, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 3,
          maxWidth: { xs: '90%', sm: '400px' },
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          textAlign: 'center'
        }}
      >
        <LockOpenIcon 
          sx={{ 
            fontSize: 50, 
            mb: 2, 
            color: 'primary.main',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }} 
        />
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            mb: 2
          }}
        >
          Successfully Logged Out
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 4, 
            color: 'text.secondary',
            fontWeight: 'medium'
          }}
        >
          Thank you for using RDA Tracker.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/"
          startIcon={<LockOpenIcon />}
          size="large"
          sx={{ 
            py: 2,
            px: 4,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Sign In Again
        </Button>
      </Paper>
    </Box>
  );
};

export default LoggedOutPage;
