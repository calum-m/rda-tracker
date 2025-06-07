export const msalConfig = {
  auth: {
    clientId: "6f7c94c6-dc0d-44dd-9349-35b67d355ddc", // This should be your actual app registration's client ID
    authority: "https://login.microsoftonline.com/9a55df51-bc84-4aad-8886-ff259fea7ca3", // 👈 Replace YOUR_TENANT_ID with your actual Tenant ID
    redirectUri: "http://localhost:3000", // or your production URL
  },
  cache: {
    cacheLocation: "sessionStorage", // or "localStorage"
    storeAuthStateInCookie: false,
  },
};