export const msalConfig = {
  auth: {
    clientId: "6f7c94c6-dc0d-44dd-9349-35b67d355ddc",
    authority: "https://login.microsoftonline.com/9a55df51-bc84-4aad-8886-ff259fea7ca3",
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false
  }
};