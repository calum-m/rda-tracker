# RDA Tracker Application (v2.1.0)

> **🌐 Live Demo**: [https://tracker.highlandgrouprda.org.uk](https://tracker.highlandgrouprda.org.uk)  
> **📱 PWA Support**: Install directly from your browser as a desktop/mobile app  
> **🔄 Offline Ready**: Full functionality without internet connection  
> **🔐 GDPR Compliant**: Complete data protection toolkit built-in

This React application is designed to track and manage information for an RDA (Riding for the Disabled Association) group. It provides comprehensive functionalities for managing participant information and coaching sessions, leveraging Azure Active Directory for authentication and Microsoft Dataverse as the backend data store. The application features a modern, responsive design built with Material-UI components throughout, complete offline capabilities, and enterprise-grade GDPR compliance.

> **🎯 Portfolio Project**: This application demonstrates enterprise-level React development with Azure integration, offline-first architecture, GDPR compliance, modern UI patterns, and comprehensive security implementation.

## ✨ Current Features (v2.1.0)

### 🔐 **Authentication & Security**
*   **Secure Authentication**: Azure AD integration via MSAL with extended token lifetime for offline use
*   **GDPR Compliance Toolkit**: Complete data protection framework with granular consent management
*   **Privacy Dashboard**: Users can manage their data rights, export data, and control consent preferences (`/privacy-dashboard`)
*   **Data Protection**: Comprehensive audit logging, automated retention policies, and "right to be forgotten"
*   **Admin Controls**: GDPR compliance management panel for administrators (`/gdpr-admin`)

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
*   **Offline-First Architecture**: Complete functionality without internet connection using IndexedDB
*   **Intelligent Sync**: Automatic background synchronization when connectivity returns
*   **Progressive Web App (PWA)**: Installable on desktop and mobile devices with offline support
*   **Real-Time Status**: Offline indicator showing sync status and pending changes
*   **Extended Token Lifetime**: MSAL configured for all-day offline usage scenarios
*   **Service Worker**: App shell caching and offline API request handling
*   **Form Validation**: Required field checking with clear error messages
*   **Confirmation Dialogs**: Safety measures for all destructive actions

### 🔄 **Offline Capabilities**
*   **Complete Offline Functionality**: Full CRUD operations work without internet
*   **Automatic Data Sync**: Intelligent bidirectional synchronization with conflict resolution
*   **Offline Status Indicator**: Real-time display of connection status and pending changes
*   **Background Sync**: Automatic upload when connectivity returns
*   **Data Persistence**: IndexedDB storage ensures no data loss
*   **Retry Logic**: Failed sync attempts automatically retried with exponential backoff
*   **Perfect for Field Use**: Designed for morning-to-afternoon offline scenarios

### 🔐 **GDPR Compliance Features**
*   **Granular Consent Management**: Separate consent for medical data, photos, communications, analytics
*   **Data Subject Rights**: Complete implementation of all GDPR rights
    *   Right of Access (data export)
    *   Right to Rectification (data correction)
    *   Right to Erasure ("right to be forgotten")
    *   Right to Restrict Processing
    *   Right to Data Portability
*   **Privacy Dashboard**: User-friendly interface for managing data rights
*   **Automated Data Retention**: Configurable policies with automatic deletion
*   **Comprehensive Audit Trail**: Every data access and modification logged
*   **Minor Protection**: Special handling for under-16 users with parental consent
*   **Admin Tools**: Complete compliance management for data protection officers

## 🛠️ Tech Stack

*   **Frontend Framework**: React 19 with React Router v7 for navigation
*   **Authentication**: Microsoft Authentication Library (MSAL) for React (`@azure/msal-react`, `@azure/msal-browser`)
*   **Data Storage**: 
    *   **Online**: Microsoft Dataverse (accessed via OData Web API)
    *   **Offline**: IndexedDB with `idb` library for local storage
*   **UI Framework**: Material-UI (MUI) v5 - Complete component library (`@mui/material`, `@emotion/react`, `@emotion/styled`)
*   **Icons**: Material-UI Icons (`@mui/icons-material`)
*   **Styling**: 
    *   Primary: Material-UI theming and `sx` prop styling
    *   Legacy: Some Tailwind CSS components (being phased out)
*   **State Management**: React Hooks (useState, useEffect, useCallback)
*   **Offline Storage**: IndexedDB with intelligent sync queuing and conflict resolution
*   **HTTP Client**: Fetch API for Dataverse integration with offline fallbacks
*   **Service Worker**: Custom implementation for offline caching and background sync
*   **GDPR Compliance**: Custom toolkit with audit logging and data retention automation
*   **Configuration**: Environment variables via `.env` file
*   **Deployment**: Azure Static Web Apps with automatic CI/CD
*   **PWA Features**: Enhanced service worker, manifest, and offline capabilities

## 📁 Project Structure

*   **`public/`**: Static assets and configuration
    *   `index.html`: Main HTML file with CSP security headers
    *   `sw.js`: Service worker for offline functionality and background sync
    *   `staticwebapp.config.json`: Azure Static Web Apps routing configuration
    *   `manifest.json`: PWA manifest with enhanced offline features
    *   `RDALOGO.svg`: Application logo and branding assets
*   **`src/`**: React application source code
    *   `App.js`: Main application component with routing, authentication, offline integration
    *   `authConfig.js`: Enhanced MSAL configuration with extended token lifetime
    *   `index.js`: Application bootstrap with service worker registration
    *   **Core Components**:
        *   `ParticipantInfo.js`: Complete participant management with offline support
        *   `CoachingSessions.js`: Coaching session management with sync capabilities
        *   `HelpPage.js`: Comprehensive help documentation with navigation
        *   `LandingPage.js`: Application home page
        *   `PrivacyPolicyPage.js`: Privacy policy display
        *   `LoggedOutPage.js`: Post-logout confirmation page
    *   **UI Components** (`src/components/`):
        *   `OfflineIndicator.js`: Real-time sync status and offline indicator
    *   **Offline System**:
        *   `offlineStorage.js`: IndexedDB wrapper with GDPR-compliant data storage
        *   `syncService.js`: Intelligent bidirectional sync with conflict resolution
        *   `offlineDataService.js`: Offline-first data abstraction layer
    *   **GDPR Toolkit** (`src/gdpr/`):
        *   `GDPRConsentModal.js`: Enhanced consent management with granular controls
        *   `PrivacyDashboard.js`: User data rights management interface
        *   `GDPRAdminPanel.js`: Administrative compliance tools
        *   `gdprService.js`: Complete GDPR compliance automation
        *   `DataDeletedPage.js`: Confirmation page for data deletion
    *   **Configuration**:
        *   `theme.js`: Material-UI theme configuration and styling
        *   `index.css`: Global styles and base CSS
*   **Configuration Files**:
    *   `CLAUDE.md`: Developer guidance for Claude Code instances
    *   `package.json`: Dependencies and scripts (version 2.1.0) with offline libraries
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
- ✅ **Advanced Service Worker** for comprehensive offline capabilities
- ✅ **GDPR Compliance** with automated data protection
- ✅ **Extended Authentication** for all-day offline usage
- ✅ **Intelligent Caching** with background sync

## 📚 Documentation & Resources

### Application Help
- **In-app Help**: Navigate to `/help` for comprehensive user guide
- **Privacy Dashboard**: Access `/privacy-dashboard` to manage your data rights
- **GDPR Admin Panel**: Administrators can access `/gdpr-admin` for compliance management
- **Table of Contents**: Quick navigation to specific features
- **Troubleshooting**: Common issues and solutions included
- **Offline Usage**: Built-in guidance for working without internet connection

### External Resources
*   [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
*   [React Documentation](https://reactjs.org/)
*   [MSAL React Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)
*   [Microsoft Dataverse Web API](https://docs.microsoft.com/powerapps/developer/data-platform/webapi/overview)
*   [Material-UI Documentation](https://mui.com/material-ui/getting-started/)
*   [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
*   [IndexedDB API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
*   [GDPR Compliance Guide](https://gdpr.eu/)
*   [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 🔄 Version History

- **v2.1.0** (December 2024): **Major Update**
  - ✨ **Complete Offline Capabilities**: Full offline-first architecture with IndexedDB storage
  - 🔐 **GDPR Compliance Toolkit**: Comprehensive data protection framework
  - 🔄 **Intelligent Sync**: Bidirectional sync with conflict resolution and retry logic
  - 📱 **Enhanced PWA**: Advanced service worker with background sync
  - 🛡️ **Extended Authentication**: All-day offline token management
  - 📊 **Privacy Dashboard**: Complete user data rights management
  - ⚙️ **Admin Tools**: GDPR compliance management panel
  - 🎨 **Material-UI Redesign**: Complete UI overhaul with responsive design
  - 📄 **Dual Mode Operations**: View/edit modes with pagination
- **v0.1.0** (Initial release): Basic functionality with online-only capabilities

## 🤝 Contributing

We welcome contributions! Please ensure:
- ✅ Follow Material-UI design patterns
- ✅ Maintain offline-first architecture principles
- ✅ Respect GDPR compliance requirements
- ✅ Add appropriate error handling and offline fallbacks
- ✅ Update documentation as needed
- ✅ Test on multiple devices and browsers, including offline scenarios
- ✅ Ensure accessibility standards are maintained
- ✅ Follow the coding patterns established in `CLAUDE.md`

## 📧 Contact & License

- **Author**: [Calum Muir](https://github.com/calum-m)
- **License**: MIT (see [LICENSE](LICENSE) file)
- **Issues**: Please report bugs via [GitHub Issues](https://github.com/calum-m/rda-tracker/issues)

## 🚀 Key Features Summary

### What Makes RDA Tracker v2.1.0 Special:
- **🔄 Offline-First Architecture**: Complete functionality without internet connection - perfect for field use
- **🔐 Enterprise GDPR Compliance**: Full data protection toolkit with automated retention and user rights management
- **🎯 Intelligent Sync**: Seamless background synchronization with conflict resolution when connectivity returns
- **📱 Mobile-First Design**: Responsive PWA that works seamlessly on all devices, installable as a native app
- **⚡ Real-Time Operations**: Instant search, client-side pagination, and live status indicators
- **🛡️ Enterprise Security**: Extended Azure AD authentication designed for all-day offline scenarios
- **📊 Comprehensive Data Management**: Full CRUD operations with offline persistence and sync queuing
- **🎨 Professional UI**: Consistent Material-UI design with real-time offline status indicators
- **📚 Self-Service Help**: Built-in comprehensive help system with offline usage guidance
- **⚖️ Legal Compliance**: Complete GDPR toolkit with privacy dashboard, audit trails, and automated data retention

### Perfect for Field Work:
✅ **Morning**: Download latest data when you have 4G signal  
✅ **All Day**: Work completely offline with full app functionality  
✅ **Evening**: Automatic sync when you return to 4G coverage  
✅ **No Data Loss**: Everything saved locally with intelligent conflict resolution  

---

**RDA Tracker v2.1.0** - *Last updated: 24 December 2024*

*Built with ❤️ for the Riding for the Disabled Association community*  
*Enterprise-ready • Offline-capable • GDPR-compliant*
