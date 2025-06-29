import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Button, Box, Paper } from '@mui/material';

const LandingPage = () => {
  return (
    <Box 
      sx={{ 
        minHeight: 'calc(100vh - 64px)', // Account for AppBar height
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
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 3,
          maxWidth: { xs: '90%', sm: '400px' },
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            fontWeight: 'bold',
            color: 'primary.main',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          What do you want to do?
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/coaching-sessions"
            size="large"
            sx={{ 
              py: 2,
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
            Go to Coaching Sessions
          </Button>
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/participant-info"
            size="large"
            sx={{ 
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              borderWidth: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                borderWidth: 2,
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Create/View Participants
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LandingPage;
