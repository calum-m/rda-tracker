# RDA Tracker Application (v2.1.0)

> **🌐 Live Demo**: [https://tracker.highlandgrouprda.org.uk](https://tracker.highlandgrouprda.org.uk)  
> **📱 PWA Support**: Install directly from your browser as a desktop/mobile app

This React application is designed to track and manage information for an RDA (Riding for the Disabled Association) group. It provides comprehensive functionalities for managing participant information and coaching sessions, leveraging Azure Active Directory for authentication and Microsoft Dataverse as the backend data store. The application features a modern, responsive design built with Material-UI components throughout, and is deployed as an Azure Static Web App.

> **🎯 Portfolio Project**: This application demonstrates enterprise-level React development with Azure integration, modern UI patterns, and comprehensive security implementation.

## ✨ Current Features (v2.1.0)

### 🔐 **Authentication & Security**
*   **Secure Authentication**: Azure AD integration via MSAL for secure user login
*   **Data Protection Consent**: First-time users see a consent modal for GDPR compliance
*   **Privacy Policy**: Dedicated privacy policy page accessible throughout the app

### 👥 **Participant Information Management** (`/participant-info`)
*   **Paginated Data View**: Modern table display with 10 participants per page
*   **Dual Mode Operations**:
    *   **View Mode** (👁️ eye icon): Read-only formatted display of participant details
    *   **Edit Mode** (✏️ pencil icon): Full editing capabilities with save/cancel options
*   **Real-time Search**: Instant filtering by name or date of birth as you type
*   **Create New Participants**: Modal dialog form with validation for required fields
*   **Delete with Confirmation**: Safety dialog prevents accidental deletions
*   **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🎯 **Coaching Sessions Management** (`/coaching-sessions`)
*   **Session Tracking**: Comprehensive management of all coaching sessions
*   **Advanced Filtering**: Search by lesson plan, date range, participant evaluation, or coach name
*   **Paginated Display**: 10 sessions per page with traditional page numbering
*   **Dual Mode Operations**:
    *   **View Mode**: Read-only session details with grey background formatting
    *   **Edit Mode**: Inline editing with immediate save/cancel options
*   **Create New Sessions**: Dialog form for entering session details and evaluations
*   **Delete Protection**: Confirmation dialogs for safe session removal

### 🎨 **User Interface & Experience**
*   **Material-UI Design**: Consistent, professional styling throughout the application
*   **Responsive Navigation**: Hamburger menu on mobile devices for better usability
*   **Clear Icon System**: Intuitive icons for all actions (view, edit, delete, save, cancel)
*   **Loading States**: Progress indicators during data operations
*   **Error Handling**: User-friendly error messages and graceful failure handling
*   **Pagination Controls**: Traditional page numbers (1, 2, 3...) with smooth navigation

### 📚 **Help & Documentation**
*   **Comprehensive Help Page**: Complete user guide with table of contents
*   **Navigation Features**: 
    *   Clickable table of contents with smooth scrolling
    *   "Back to Top" floating button for easy navigation
    *   Detailed feature explanations and troubleshooting guide

### 🔧 **Technical Features**
*   **Client-Side Pagination**: Efficient data handling without server limitations
*   **Progressive Web App (PWA)**: Installable on desktop and mobile devices
*   **Real-Time Updates**: Instant data synchronization with Dataverse
*   **Form Validation**: Required field checking with clear error messages
*   **Confirmation Dialogs**: Safety measures for all destructive actions

## 🛠️ Tech Stack

*   **Frontend Framework**: React 18 with React Router for navigation
*   **Authentication**: Microsoft Authentication Library (MSAL) for React (`@azure/msal-react`, `@azure/msal-browser`)
*   **Data Storage**: Microsoft Dataverse (accessed via OData Web API)
*   **UI Framework**: Material-UI (MUI) - Complete component library (`@mui/material`, `@emotion/react`, `@emotion/styled`)
*   **Icons**: Material-UI Icons (`@mui/icons-material`)
*   **Styling**: 
    *   Primary: Material-UI theming and `sx` prop styling
    *   Legacy: Some Tailwind CSS components (being phased out)
*   **State Management**: React Hooks (useState, useEffect, useCallback)
*   **HTTP Client**: Fetch API for Dataverse integration
*   **Configuration**: Environment variables via `.env` file
*   **Deployment**: Azure Static Web Apps with automatic CI/CD
*   **PWA Features**: Service worker and manifest for app-like experience

## 📁 Project Structure

*   **`public/`**: Static assets and configuration
    *   `index.html`: Main HTML file with CSP security headers
    *   `staticwebapp.config.json`: Azure Static Web Apps routing configuration
    *   `manifest.json`: PWA manifest for installable app features
    *   `RDALOGO.svg`: Application logo and branding assets
*   **`src/`**: React application source code
    *   `App.js`: Main application component with routing, authentication, and layout
    *   `authConfig.js`: MSAL configuration for Azure AD integration
    *   **Components**:
        *   `ParticipantInfo.js`: Complete participant management with view/edit modes
        *   `CoachingSessions.js`: Coaching session management (renamed from LessonEvaluations)
        *   `DataverseCaller.js`: Legacy component (being phased out)
        *   `ConsentModal.js`: GDPR consent dialog
        *   `HelpPage.js`: Comprehensive help documentation with navigation
        *   `LandingPage.js`: Application home page
        *   `PrivacyPolicyPage.js`: Privacy policy display
        *   `LoggedOutPage.js`: Post-logout confirmation page
    *   `theme.js`: Material-UI theme configuration and styling
    *   `index.css`: Global styles and base CSS
*   **Configuration Files**:
    *   `package.json`: Dependencies and scripts (version 2.1.0)
    *   `tailwind.config.js`: Tailwind CSS configuration (legacy)
    *   `postcss.config.js`: PostCSS configuration for CSS processing

## 🚀 Getting Started

### Prerequisites

*   **Node.js**: Version >=20.0.0 (specified in `package.json` engines field)
*   **npm**: Latest version for package management
*   **Azure AD App Registration**: Configured with appropriate Dataverse permissions
*   **Microsoft Dataverse Environment**: With required tables for participants, coaching sessions, and consent records

### 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/calumk/rda-tracker.git
    cd rda-tracker/rda-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the project root with your configuration:
    ```env
    # Dataverse Configuration
    REACT_APP_DATAVERSE_URL=https://yourorg.crm11.dynamics.com
    REACT_APP_DATAVERSE_SCOPE=https://yourorg.crm11.dynamics.com/.default
    
    # Azure AD Configuration (if not in authConfig.js)
    REACT_APP_MSAL_CLIENT_ID=your-azure-ad-client-id
    REACT_APP_MSAL_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
    REACT_APP_MSAL_REDIRECT_URI=https://yourdomain.com
    ```
    
    **Important**: Ensure your `src/authConfig.js` properly references these environment variables.

### 🏃‍♂️ Development Scripts

*   **`npm start`**: 
    * Runs development server at [http://localhost:3000](http://localhost:3000)
    * Hot reload enabled for instant development feedback
    * Automatic browser opening

*   **`npm run build`**: 
    * Creates optimized production build in `build/` directory
    * Minified and optimized for best performance
    * Ready for Azure Static Web Apps deployment

*   **`npm test`**: 
    * Launches test runner in interactive watch mode
    * Runs all unit tests and component tests

*   **`npm run eject`**: 
    * ⚠️ **One-way operation** - use with caution!
    * Exposes webpack configuration for advanced customization

## 🌐 Deployment

This application is optimized for **Azure Static Web Apps** deployment with automatic CI/CD integration.

### Azure Static Web Apps Configuration

The application includes production-ready configuration:

**`public/staticwebapp.config.json`**:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/static/*", "/*.ico", "/*.png", "/*.svg", "/*.json", "/*.txt"]
  },
  "mimeTypes": {
    ".json": "application/json",
    ".webmanifest": "application/manifest+json"
  }
}
```

### Deployment Steps

1. **Build the application**: `npm run build`
2. **Deploy the `build/` directory** to Azure Static Web Apps
3. **Configure environment variables** in Azure portal
4. **Set up custom domain** (optional)

### Progressive Web App (PWA) Features

The application supports PWA installation on:
- **Desktop**: Chrome, Edge (install from address bar)
- **Mobile**: Android Chrome, iOS Safari (Add to Home Screen)

### Performance & Security

- ✅ **Content Security Policy (CSP)** implemented
- ✅ **HTTPS-only** in production
- ✅ **Optimized build** with code splitting
- ✅ **Service worker** for offline capabilities

## 📚 Documentation & Resources

### Application Help
- **In-app Help**: Navigate to `/help` for comprehensive user guide
- **Table of Contents**: Quick navigation to specific features
- **Troubleshooting**: Common issues and solutions included

### External Resources
*   [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
*   [React Documentation](https://reactjs.org/)
*   [MSAL React Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)
*   [Microsoft Dataverse Web API](https://docs.microsoft.com/powerapps/developer/data-platform/webapi/overview)
*   [Material-UI Documentation](https://mui.com/material-ui/getting-started/)
*   [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)

## 🔄 Version History

- **v2.1.0** (June 2025): Current version with complete Material-UI redesign, pagination, dual view/edit modes, enhanced help system
- **v0.1.0** (Initial release): Basic functionality with mixed styling approaches

## 🤝 Contributing

We welcome contributions! Please ensure:
- ✅ Follow Material-UI design patterns
- ✅ Maintain responsive design principles
- ✅ Add appropriate error handling
- ✅ Update documentation as needed
- ✅ Test on multiple devices and browsers

## 📧 Contact & License

- **Author**: [Calum Muir](https://github.com/calum-m)
- **License**: MIT (see [LICENSE](LICENSE) file)
- **Issues**: Please report bugs via [GitHub Issues](https://github.com/calum-m/rda-tracker/issues)

## 🚀 Key Features Summary

### What Makes RDA Tracker v2.1.0 Special:
- **🎯 Dual-Mode Interface**: Every data table supports both view-only and edit modes
- **📱 Mobile-First Design**: Responsive interface that works seamlessly on all devices
- **⚡ Real-Time Operations**: Instant search, client-side pagination, and live data updates
- **🔒 Enterprise Security**: Azure AD integration with GDPR-compliant consent management
- **📊 Comprehensive Data Management**: Full CRUD operations for participants and coaching sessions
- **🎨 Professional UI**: Consistent Material-UI design throughout the application
- **📚 Self-Service Help**: Built-in comprehensive help system with navigation

---

**RDA Tracker v2.1.0** - *Last updated: 11 June 2025*

*Built with ❤️ for the Riding for the Disabled Association community*
