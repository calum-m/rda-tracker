import React from "react";
import ReactDOM from "react-dom/client";
import AppWithEmotionCache from "./App"; // Import AppWithEmotionCache
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import './index.css'; // Corrected import: Ensure this points to your global CSS file for MUI
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router

const msalInstance = new PublicClientApplication(msalConfig);

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
