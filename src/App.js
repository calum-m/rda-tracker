import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import LessonEvaluations from "./LessonEvaluations"; // Corrected import
import ParticipantInfo from "./ParticipantInfo"; // Import the new component

const loginRequest = {
  scopes: ["https://orgdbcfb9bc.crm11.dynamics.com/.default"],
};

const App = () => {
  const { instance, accounts } = useMsal();

  console.log("Accounts:", accounts);

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch(e => {
      console.error("Login redirect error:", e);
    });
  };

  const handleLogout = () => {
    instance.logoutRedirect().catch(e => {
      console.error("Logout redirect error:", e);
    });
  };

  // Apply base Tailwind classes for background and text color to the main app container
  // This ensures consistency and leverages Tailwind's theme.
  return (
    <Router>
      <div className="App bg-gray-100 text-gray-900 min-h-screen flex flex-col">
        <header className="bg-indigo-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex flex-wrap justify-between items-center">
            <h1 className="text-xl font-semibold mr-auto">RDA Tracker</h1>
            <nav className="flex items-center space-x-2 sm:space-x-4 order-last sm:order-none w-full sm:w-auto mt-2 sm:mt-0 justify-center sm:justify-start">
              {accounts.length > 0 && (
                <>
                  <Link to="/participant-info" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white">Participant Info</Link>
                  <Link to="/lesson-evaluations" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white">Lesson Evaluations</Link>
                </>
              )}
            </nav>
            <div className="sm:ml-4 mt-2 sm:mt-0">
              {accounts.length > 0 ? (
                <button 
                  onClick={handleLogout} 
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-500 w-full sm:w-auto"
                >
                  Logout
                </button>
              ) : (
                <button 
                  onClick={handleLogin} 
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-500 w-full sm:w-auto"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
          <AuthenticatedTemplate>
            <Routes>
              <Route path="/participant-info" element={<ParticipantInfo />} />
              <Route path="/lesson-evaluations" element={<LessonEvaluations />} />
              <Route path="/" element={<Navigate to="/participant-info" />} />
            </Routes>
          </AuthenticatedTemplate>

          <UnauthenticatedTemplate>
            <div className="text-center p-10">
              <h2 className="text-2xl font-semibold mb-4">Welcome</h2>
              <p className="mb-6 text-gray-700">Please login to access the application.</p>
              <button 
                onClick={handleLogin} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Login
              </button>
            </div>
          </UnauthenticatedTemplate>
        </main>

        <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
          <p>&copy; {new Date().getFullYear()} RDA Tracker. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
