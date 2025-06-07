import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import DataverseCaller from "./DataverseCaller";
import ParticipantInfo from "./ParticipantInfo"; // Import the new component

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
    <Router>
      <div>
        <nav className="bg-gray-800 text-white p-4">
          <ul className="flex space-x-4">
            <li><Link to="/">Home</Link></li>
            <AuthenticatedTemplate>
              <li><Link to="/lesson-evaluations">Lesson Evaluations</Link></li>
              <li><Link to="/participant-info">Participant Information</Link></li>
            </AuthenticatedTemplate>
          </ul>
        </nav>

        <div className="p-4">
          <h1 className="text-3xl font-bold mb-6">RDA Rider Tracker</h1>

          <AuthenticatedTemplate>
            <p className="mb-4">Welcome {accounts.length > 0 ? accounts[0].username : 'User'}</p>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4">
              Sign out
            </button>
            <Routes>
              <Route path="/lesson-evaluations" element={<DataverseCaller />} />
              <Route path="/participant-info" element={<ParticipantInfo />} />
              <Route path="/" element={<Navigate to="/lesson-evaluations" />} /> {/* Default to lesson evaluations when logged in */}
            </Routes>
          </AuthenticatedTemplate>

          <UnauthenticatedTemplate>
            <p className="mb-4">Please sign in to continue.</p>
            <button onClick={handleLogin} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Sign in with Microsoft
            </button>
          </UnauthenticatedTemplate>
        </div>
      </div>
    </Router>
  );
};

export default App;
