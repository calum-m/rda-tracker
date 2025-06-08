# RDA Tracker Application

This React application is designed to track and manage information for an RDA (Riding for the Disabled Association) group. It provides functionalities for managing participant information and lesson evaluations, leveraging Azure Active Directory for authentication and Microsoft Dataverse as the backend data store. The application is styled with Material UI (MUI) and is intended to be deployed as an Azure Static Web App.

## Features

*   **Authentication**: Secure login via Azure AD (MSAL).
*   **Participant Information Management (`/participant-info`)**:
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
*   **Responsive UI**: The application is built with Material UI and aims for a good user experience on desktop, tablet, and mobile devices.

## Tech Stack

*   **Frontend**: React, React Router
*   **Authentication**: Microsoft Authentication Library (MSAL) for React (`@azure/msal-react`, `@azure/msal-browser`)
*   **Data Storage**: Microsoft Dataverse (accessed via Web API)
*   **Styling**: Material UI (MUI) - (`@mui/material`, `@emotion/react`, `@emotion/styled`)
*   **Deployment**: Azure Static Web Apps (intended)

## Project Structure

*   `public/`: Contains static assets and `index.html`.
*   `src/`: Contains the React application source code.
    *   `App.js`: Main application component, handles routing, theming, and overall layout.
    *   `index.js`: Entry point for the React application, MSAL Provider setup.
    *   `authConfig.js`: Configuration for MSAL.
    *   `ParticipantInfo.js`: Component for managing participant data.
    *   `LessonEvaluations.js`: Component for managing lesson evaluation data.
    *   `index.css`: Global base styles and MUI overrides.
*   `package.json`: Project dependencies and scripts.

## Getting Started

### Prerequisites

*   Node.js (version >=20.0.0 recommended) and npm (or yarn) installed.
*   An Azure AD application registration with appropriate permissions for Dataverse.
*   A Dataverse environment with the required tables (`cr648_participantinformations`, `cr648_lessonevaluations`) and fields.

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

3.  **Configure MSAL and Dataverse URL:**
    *   Update the `msalConfig` in `src/authConfig.js` with your Azure AD application details (client ID, authority, tenant ID).
    *   Update the `dataverseUrl` constant in `src/ParticipantInfo.js` and `src/LessonEvaluations.js` to point to your Dataverse environment URL (e.g., `https://yourorg.crm.dynamics.com`).
        *   *Note: This should ideally be centralized in a configuration file or environment variables.*

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

Refer to the [Azure Static Web Apps documentation](https://docs.microsoft.com/azure/static-web-apps/) for deployment instructions.

## Contributing

Please refer to the project\'s contribution guidelines if available.

## Learn More

*   [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
*   [React documentation](https://reactjs.org/)
*   [MSAL React documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)
*   [Dataverse Web API documentation](https://docs.microsoft.com/powerapps/developer/data-platform/webapi/overview)
*   [Material UI (MUI) documentation](https://mui.com/material-ui/getting-started/)

---

*This README was last updated on 7 June 2025.*
