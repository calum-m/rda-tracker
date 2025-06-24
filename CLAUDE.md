# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Scripts
- `npm start` - Development server at localhost:3000 with hot reload
- `npm run build` - Production build to `build/` directory
- `npm test` - Jest test runner in watch mode
- `npm run eject` - Eject from Create React App (one-way operation)

### Environment Requirements
- Node.js >=20.0.0 (specified in package.json engines)
- npm for package management

## Project Architecture

### Technology Stack
- **Frontend**: React 19 with Create React App
- **Authentication**: Microsoft Authentication Library (MSAL) with Azure AD
- **Backend**: Microsoft Dataverse via OData Web API
- **UI Framework**: Material-UI (MUI) v5 with Emotion styling
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Routing**: React Router v7
- **Deployment**: Azure Static Web Apps

### Authentication Flow
The app uses Azure AD authentication via MSAL. Key configuration in `src/authConfig.js`:
- Dynamic redirect URIs based on hostname (localhost vs production)
- Scopes: `["openid", "profile", "User.Read"]` for login
- Dataverse scope: `process.env.REACT_APP_DATAVERSE_SCOPE`

### Core Components Architecture

**App.js** (src/App.js:1-448) - Main application orchestrator:
- MSAL authentication wrapper
- Consent management with Dataverse integration
- Material-UI theme provider and routing setup
- Responsive navigation with mobile hamburger menu

**Key Data Flow**:
1. MSAL handles Azure AD authentication
2. Consent modal checks/stores user consent in Dataverse
3. Token acquisition for Dataverse API calls
4. CRUD operations via fetch API to Dataverse OData endpoints

### Component Structure
- `ParticipantInfo.js` - Participant management with dual view/edit modes
- `CoachingSessions.js` - Session tracking (renamed from LessonEvaluations)
- `ConsentModal.js` - GDPR consent handling
- `HelpPage.js` - Comprehensive help system with navigation
- `LandingPage.js` - Application home page
- `theme.js` - Material-UI theme configuration

### Data Storage Pattern
All data is stored in Microsoft Dataverse with these patterns:
- Consent records: `cr648_table1s` table with user ID and policy version
- Authentication tokens acquired via MSAL for Dataverse API access
- OData Web API calls with proper headers and versioning

### Styling Approach
- **Primary**: Material-UI `sx` prop and theme system
- **Legacy**: Some Tailwind CSS (being phased out)
- Responsive design with Material-UI breakpoints
- Consistent Material Design patterns throughout

### Environment Variables Required
```
REACT_APP_DATAVERSE_URL=https://yourorg.crm11.dynamics.com
REACT_APP_DATAVERSE_SCOPE=https://yourorg.crm11.dynamics.com/.default
```

### Key Architectural Patterns
- Authentication state managed globally via MSAL hooks
- Component-level state for UI interactions
- Callback hooks for API operations to prevent re-renders
- Conditional rendering based on authentication and consent status
- Error handling with user-friendly messages
- Loading states for better UX

### PWA Configuration
- Service worker for offline capabilities
- Manifest.json for installable app experience
- Static Web App configuration in `public/staticwebapp.config.json`

### Security Considerations
- Azure AD integration with proper scopes
- GDPR compliance with consent tracking
- Content Security Policy headers
- No sensitive data in client-side code
- Proper token handling and storage