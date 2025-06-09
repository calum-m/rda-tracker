# RDA Tracker Application

This React application is designed to track and manage information for an RDA (Riding for the Disabled Association) group. It provides functionalities for managing participant information and lesson evaluations, leveraging Azure Active Directory for authentication and Microsoft Dataverse as the backend data store. The application is styled primarily with Material UI (MUI), with some components utilizing Tailwind CSS, and is intended to be deployed as an Azure Static Web App.

## Features

*   **Authentication**: Secure login via Azure AD (MSAL).
*   **Data Protection Consent**:
    *   A modal (`ConsentModal.js`) displays upon first sign-in to obtain user consent for data protection.
    *   Consent status is persisted in Dataverse.
    *   Includes a link to the Privacy Policy.
*   **Participant Information Management (`/participant-info`)** (Component: `DataverseCaller.js` - UI refactored with Tailwind CSS):
    *   View a list of all participants.
    *   Search for participants by first or last name.
    *   Create new participant records through a dialog form.
    *   View detailed information for each participant.
    *   Inline editing of participant details directly in the table, with changes saved to Dataverse.
    *   Responsive design for use on various devices.
*   **Lesson Evaluations Management (`/lesson-evaluations`)**:
    *   View a list of lesson evaluations.
    *   Search and filter evaluations by lesson plan, date range, participant evaluation content, and coach name.
    *   Create new lesson evaluation records through a dialog form.
    *   Inline editing of lesson evaluation details directly in the table.
    *   Responsive design.
*   **Privacy Policy Page (`/privacy-policy`)**:
    *   A dedicated, themed page (`PrivacyPolicyPage.js`) displaying the organization's privacy policy.
*   **Logged-Out Page (`/logged-out`)**:
    *   A styled page (`LoggedOutPage.js`) shown after successful logout, with an option to sign in again.
*   **Responsive UI**: The application is built with Material UI and aims for a good user experience on desktop, tablet, and mobile devices.
*   **Security**:
    *   Content Security Policy (CSP) implemented in `public/index.html` to enhance security, compatible with MUI's dynamic styling.

## Tech Stack

*   **Frontend**: React, React Router
*   **Authentication**: Microsoft Authentication Library (MSAL) for React (`@azure/msal-react`, `@azure/msal-browser`)
*   **Data Storage**: Microsoft Dataverse (accessed via Web API)
*   **Styling**:
    *   Material UI (MUI) - (`@mui/material`, `@emotion/react`, `@emotion/styled`) - Primary styling library.
    *   Tailwind CSS - Used for specific components like `DataverseCaller.js`.
*   **Configuration**: `.env` file for environment-specific variables.
*   **Deployment**: Azure Static Web Apps.

## Project Structure

*   `public/`: Contains static assets, `index.html`, and Azure SWA configuration.
    *   `index.html`: Main HTML file, includes CSP meta tags.
    *   `staticwebapp.config.json`: Configuration for Azure Static Web Apps, including routing rules for SPA fallback.
    *   `privacy-policy.html`: Static version of the privacy policy (React component version is preferred).
*   `src/`: Contains the React application source code.
    *   `App.js`: Main application component, handles routing, theming, MSAL setup, and overall layout.
    *   `index.js`: Entry point for the React application.
    *   `authConfig.js`: Configuration for MSAL, including client ID, authority, and redirect URIs.
    *   `DataverseCaller.js`: Component for managing participant and lesson evaluation data (uses Tailwind CSS).
    *   `ConsentModal.js`: Component for the data protection consent modal.
    *   `PrivacyPolicyPage.js`: React component for the privacy policy page.
    *   `LoggedOutPage.js`: Component for the post-logout page.
    *   `index.css`: Global base styles.
    *   `tailwind.css`: Base Tailwind styles and directives.
*   `package.json`: Project dependencies and scripts.
*   `tailwind.config.js`: Configuration file for Tailwind CSS.
*   `postcss.config.js`: Configuration file for PostCSS (used with Tailwind CSS).

## Getting Started

### Prerequisites

*   Node.js (version specified in `package.json`'s `engines` field, e.g., `>=20.0.0`) and npm installed.
*   An Azure AD application registration with appropriate permissions for Dataverse.
*   A Dataverse environment with the required tables (e.g., for participants, lesson evaluations, consent records) and fields.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd rda-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

3.  **Configure Environment Variables:**
    *   Create a `.env` file in the root of the project.
    *   Add the following environment variables, replacing the placeholder values with your actual configuration:
        ```env
        REACT_APP_DATAVERSE_URL=https://yourorg.crm.dynamics.com
        REACT_APP_DATAVERSE_SCOPE=https://yourorg.crm.dynamics.com/.default
        # Add other Azure AD app registration details if needed, e.g.,
        # REACT_APP_MSAL_CLIENT_ID=your-client-id
        # REACT_APP_MSAL_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
        # REACT_APP_MSAL_REDIRECT_URI=http://localhost:3000
        ```
    *   **Important**: Ensure your `src/authConfig.js` is set up to use these environment variables (e.g., `process.env.REACT_APP_MSAL_CLIENT_ID`). The `msalConfig` should define `postLogoutRedirectUri: '/logged-out'` or similar.
    *   The Dataverse URL and scope are used for API calls to Dataverse.

### Available Scripts

In the project directory, you can run:

*   **`npm start`**:\
    Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will reload when you make changes.

*   **`npm test`**:\
    Launches the test runner in interactive watch mode.

*   **`npm run build`**:\
    Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

*   **`npm run eject`**:\
    **Note: this is a one-way operation. Once you `eject`, you can\'t go back!**\
    This command removes the single build dependency (react-scripts) and copies all configuration files (webpack, Babel, ESLint, etc.) and transitive dependencies into your project, giving you full control.

## Deployment

This application is designed to be deployed as an Azure Static Web App. The `npm run build` command creates a `build` directory with the static assets ready for deployment.

Key considerations for Azure SWA:
*   **`public/staticwebapp.config.json`**: This file is crucial for correct SPA routing. It should include a navigation fallback rule to serve `index.html` for all routes not matching static files, allowing React Router to handle client-side navigation.
    ```json
    {
      "navigationFallback": {
        "rewrite": "/index.html",
        "exclude": ["/static/*", "/*.ico", "/*.png", "/*.svg", "/*.json", "/*.txt", "/privacy-policy.html"]
      },
      "mimeTypes": {
        ".json": "application/json",
        ".webmanifest": "application/manifest+json"
      }
    }
    ```
*   Ensure your build output directory is correctly configured in your Azure SWA deployment workflow (usually `build`).

Refer to the [Azure Static Web Apps documentation](https://docs.microsoft.com/azure/static-web-apps/) for detailed deployment instructions.

## Contributing

Please refer to the project\'s contribution guidelines if available.

## Learn More

*   [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
*   [React documentation](https://reactjs.org/)
*   [MSAL React documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)
*   [Dataverse Web API documentation](https://docs.microsoft.com/powerapps/developer/data-platform/webapi/overview)
*   [Material UI (MUI) documentation](https://mui.com/material-ui/getting-started/)
*   [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

*This README was last updated on 9 June 2025.*
