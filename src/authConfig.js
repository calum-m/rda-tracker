const productionRedirectUri = "https://tracker.highlandgrouprda.org.uk";
const localRedirectUri = "http://localhost:3000";

// Dynamically set the redirectUri based on the hostname
const currentRedirectUri = window.location.hostname === "localhost" 
                            ? localRedirectUri 
                            : productionRedirectUri;

const postLogoutRedirectUri = window.location.hostname === "localhost"
                            ? `${localRedirectUri}/logged-out`
                            : `${productionRedirectUri}/logged-out`;

export const msalConfig = {
  auth: {
    clientId: "6f7c94c6-dc0d-44dd-9349-35b67d355ddc", // This should be your actual app registration's client ID
    authority: "https://login.microsoftonline.com/9a55df51-bc84-4aad-8886-ff259fea7ca3", 
    redirectUri: currentRedirectUri,
    postLogoutRedirectUri: postLogoutRedirectUri, // Added post-logout redirect
  },
  cache: {
    cacheLocation: "localStorage", // Use localStorage for persistence across sessions
    storeAuthStateInCookie: false,
    // Extended token lifetime for offline scenarios
    tokenRenewalOffsetSeconds: 300, // Renew 5 minutes before expiry
  },
  system: {
    allowNativeBroker: false, // Disable for web apps
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        console.log(`MSAL [${level}]: ${message}`);
      },
      logLevel: 3, // Info level
    },
    // Configure for longer offline periods
    networkTimeout: 10000, // 10 second timeout
    navigationTimeout: 30000, // 30 second navigation timeout
  },
};