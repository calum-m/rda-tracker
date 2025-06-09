import { createTheme } from '@mui/material/styles';
import createCache from '@emotion/cache';

// This nonce must match the one in public/index.html CSP header for style-src
export const nonce = 'mui-csp-nonce-12345';

export const emotionCache = createCache({
  key: 'css',
  nonce: nonce,
});

export const theme = createTheme({
  palette: {
    primary: {
      main: '#57ab5d', // Your primary color
    },
    secondary: {
      main: '#dc004e', // Your secondary color
    },
  },
  // You can add other theme customizations here (typography, components, etc.)
});
