import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import DataverseCaller from "./DataverseCaller";

const loginRequest = {
  scopes: ["https://orgdbcfb9bc.crm11.dynamics.com/.default"],
};

const App = () => {
  const { instance, accounts } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  console.log("Accounts:", accounts);


  useEffect(() => {
    if (accounts && accounts.length > 0) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [accounts]);

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  return (
    <div>
      <h1>RDA Rider Tracker</h1>

      {isAuthenticated ? (
        <>
          <p>Welcome {accounts[0].username}</p>
          <button onClick={handleLogout}>Sign out</button>
          <DataverseCaller />
        </>
      ) : (
        <button onClick={handleLogin}>Sign in with Microsoft</button>
      )}
    </div>
  );
};

export default App;
