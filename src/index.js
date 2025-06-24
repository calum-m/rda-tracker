import React from "react";
import ReactDOM from "react-dom/client";
import AppWithEmotionCache from "./App"; // Import AppWithEmotionCache
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import './index.css'; // Corrected import: Ensure this points to your global CSS file for MUI
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router

const msalInstance = new PublicClientApplication(msalConfig);

// Register service worker for offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log('New content is available; please refresh.');
              } else {
                // Content is cached for offline use
                console.log('Content is cached for offline use.');
              }
            }
          });
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

msalInstance.initialize().then(() => {
  // handleRedirectPromise should be called after initialize an resolved
  msalInstance.handleRedirectPromise().then(() => {
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <MsalProvider instance={msalInstance}>
          <Router> {/* Add Router here */}
            <AppWithEmotionCache /> {/* Use AppWithEmotionCache */}
          </Router>
        </MsalProvider>
      </React.StrictMode>
    );
  }).catch((error) => {
    console.error("MSAL redirect error:", error);
    // Optionally render an error message to the DOM here
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <div>
          <h1>Login Error</h1>
          <p>There was an issue processing the login redirect. Please try again.</p>
          <pre>{error.toString()}</pre>
        </div>
      </React.StrictMode>
    );
  });
}).catch((error) => {
  console.error("MSAL initialization error:", error);
  // Optionally render an error message to the DOM here
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <div>
        <h1>Application Initialization Error</h1>
        <p>There was an issue initializing the application. Please try again.</p>
        <pre>{error.toString()}</pre>
      </div>
    </React.StrictMode>
  );
});
