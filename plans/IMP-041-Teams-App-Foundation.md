# Implementation Plan - US-041: Microsoft Teams App Manifest & SDK Integration

## Goal
Build the Microsoft Teams app manifest package, configure hosting headers for iframe embedding (CSP `frame-ancestors`), and integrate `@microsoft/teams-js` for seamless host context, locale, and theme synchronization.

## Proposed Changes

### Teams Manifest & Package
#### [NEW] `teams-manifest/manifest.json`
- Define Teams schema v1.16 manifest:
  - App ID, icons (`color.png`, `outline.png`), version, descriptions.
  - Personal tab pointing to `/teams/personal`.
  - Configurable tab pointing to `/teams/config`.
  - `validDomains`: `["decide-o-mat.web.app", "login.microsoftonline.com"]`.

#### [NEW] `scripts/package-teams.js`
- Node script to generate `dist/teams/DecideOMat-Teams.zip` containing `manifest.json` and icons.

### Hosting & CSP Headers
#### [MODIFY] `firebase.json`
- Add headers for iframe hosting:
  ```json
  "headers": [
    {
      "source": "**",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors https://teams.microsoft.com https://*.teams.microsoft.com https://*.skype.com https://*.office.com https://*.microsoft365.com;"
        }
      ]
    }
  ]
  ```

### Frontend Teams SDK Integration
#### [MODIFY] `frontend/package.json`
- Add `@microsoft/teams-js` dependency.

#### [NEW] `frontend/src/contexts/TeamsContext.jsx`
- Initialize Teams SDK with `app.initialize()`.
- Detect if running inside Teams host (`isTeamsHost`).
- Provide `theme`, `locale`, `context` (channel, user, meeting info).
- Register `app.registerOnThemeChangeHandler()` and sync with Decide-O-Mat theme tokens.

#### [MODIFY] `frontend/src/App.jsx`
- Wrap app with `TeamsProvider`.
- If `isTeamsHost` is true, apply conditional CSS classes (hide redundant global header/footer).

## Verification Plan

### Automated Tests
- Unit tests for `TeamsContext`:
  - Detects standard web vs. Teams host environment.
  - Switches CSS theme variable class on theme change event.
- Linting & Build:
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`
