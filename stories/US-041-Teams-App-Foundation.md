# User Story: Microsoft Teams App Manifest & SDK Integration

**As a** Microsoft Teams user and enterprise employee  
**I want to** install and run Decide-O-Mat inside the Microsoft Teams desktop, web, and mobile clients  
**So that** I have a seamless, embedded experience with native styling, dark theme synchronization, and proper iframe embedding without layout bugs.

## Acceptance Criteria

### Manifest & App Package
1. **Teams App Manifest (`manifest.json`)**:
   - Compliant with Microsoft Teams App Manifest Schema (v1.16+).
   - Configures App ID, Developer info, Version, Privacy/Terms links, and Valid Domains (`validDomains: ["decide-o-mat.web.app", "login.microsoftonline.com"]`).
   - Declares static personal tabs (`entityId: "decide-personal-tab"`, `contentUrl: "https://decide-o-mat.web.app/teams/tab"`).
2. **App Icons**:
   - High-resolution color icon (`192x192.png`) and outline icon (`32x32.png` with transparency).
3. **Packaging Script**: Automated `npm run package:teams` script that zips the manifest and icons into a ready-to-upload `DecideOMat-Teams.zip` package.

### Iframe & Hosting Security Policy (CSP)
4. **CSP Configuration**:
   - Firebase Hosting (`firebase.json`) headers updated to support Teams iframe embedding:
     `Content-Security-Policy: frame-ancestors https://teams.microsoft.com https://*.teams.microsoft.com https://*.skype.com https://*.office.com https://*.microsoft365.com;`
   - Ensure legacy `X-Frame-Options: DENY` is disabled for Teams routes.

### Teams SDK & UI Integration
5. **Host Detection & Layout Adaptation**:
   - Integrate `@microsoft/teams-js` v2.x.
   - When loaded inside Teams (`inTeamsHost: true`):
     - Hide redundant top navigation bars or footers that duplicate Teams shell UI.
     - Enable native back-button integration with Teams breadcrumbs.
6. **Theme Synchronization**:
   - Listen to Teams theme events (`app.getContext()` and `registerOnThemeChangeHandler()`).
   - Automatically switch Decide-O-Mat between Dark theme, Light theme, and High Contrast mode based on the user's active Teams theme.
7. **Locale Synchronization**:
   - Match Decide-O-Mat language (`en` / `de`) to Teams user locale (`context.app.locale`).

## Technical Notes
- **Dependencies**: `@microsoft/teams-js` (v2.x).
- **New Components**:
  - `frontend/src/contexts/TeamsContext.jsx`: Provides Teams host detection, context info, and theme sync.
  - `frontend/src/pages/TeamsTab.jsx`: Root entry point for Teams personal and configurable tabs.
- **Manifest Directory**:
  - `teams-manifest/manifest.json`, `teams-manifest/color.png`, `teams-manifest/outline.png`.

## Implementation Plan
- [IMP-041-Teams-App-Foundation](../plans/IMP-041-Teams-App-Foundation.md)
