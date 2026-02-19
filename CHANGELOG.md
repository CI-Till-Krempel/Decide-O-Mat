# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.0] - 2026-02-18

### Added
- **Design System Foundation** (US-028): Dark-only theme with CSS custom properties, "Alfa Slab One" and "Open Sans" typography, CSS Modules architecture, and i18n support (English/German).
- **Navigation Bar Redesign** (US-029): Dark-themed responsive navigation with settings panel and language switcher.
- **Footer Redesign** (US-030): New footer with legal links (Terms, Privacy, Imprint) and version branding.
- **Home Page Redesign** (US-031): Full-bleed dark layout matching Figma design.
- **Voting Page Redesign** (US-032): New Election Hero component, floating argument input, statement cards, and FAB pattern.
- **Results Page Redesign** (US-033): Dedicated results mode on Election Hero with ballot icon and color-coded outcome (Approved/Rejected).
- **Archive / My Decisions Page Redesign** (US-034): Decision cards with running/archived variants, context menu with keyboard navigation, and localized relative timestamps via `Intl.RelativeTimeFormat`.
- **Decision Management Actions** (US-035): Owners can edit decision questions, delete decisions (with cascading subcollection cleanup), and close/reopen decisions from both the decision page and My Decisions.
- **Participant List**: Real-time participant list with owner badge and notification toggle.

### Changed
- Migrated all pages and components from inline styles to CSS Modules with design tokens.
- Replaced hardcoded color values with CSS custom properties throughout the application.

### Fixed
- **Firestore Batch Handling**: Fixed critical bug where Firestore batches were reused after `commit()` in cascading decision deletion.

 ## [1.5.2] - 2026-01-23
 
 ### Security
 - **Dependencies**: Fixed high severity vulnerabilities in `react-router` and `qs`.
 
 ## [1.5.1] - 2026-01-23
 
 ### Security
 - **App Check**: Stabilized App Check implementation on Staging environment.
     - Resolved "Permission Denied" errors by whitelisting API Key referrers.
     - Synced missing Firestore indexes.
     - Configured Firestore Rules and Cloud Functions to "Permissive Mode" for monitoring.

## [1.5.0] - 2025-12-15

### Added
- **User Authentication**: Integrated Firebase Authentication supporting Google Sign-In and Email/Password registration.
- **My Decisions**: A personalized list of decisions a user has created or participated in.
- **Anonymous Identity Upgrades**:
    - **One Vote Limit**: Enforced one vote per user per decision.
    - **Magic Link**: Ability to transfer anonymous identity to another device via a magic link.
    - **Profile Management**: Users can edit their display name and delete their account (GDPR compliance).
- **Security**: Enhanced Firestore rules and backend validation for user actions.

## [1.4.1] - 2025-12-12

### Fixed
- **Roles**: Corrected "Owner" badge visibility and added "Invitee" badge for participants.
- **List Styling**: Removed bullet points from decision lists for cleaner UI.
- **Testing**: Fixed frontend test failures in `Decision.test.jsx` related to encryption service mocking.

## [1.4.0] - 2025-12-10

### Added
- **End-to-End Encryption**: Decisions are now encrypted client-side using a key in the URL hash, ensuring only those with the link can decrypt the content.
- **Loading Spinner**: Added a loading spinner to indicate progress during decision loading and voting actions.

## [1.3.3] - 2025-12-10

### Fixed
- **Deployment Metadata**: Fixed "Local" environment display by strictly inferring environment name from Project ID and removing unreliable git hash dependence in remote builds.
- **Permissions**: Resolved App Hosting deployment permissions by escalating Service Account roles (`developerconnect.admin`).
- **Setup**: Added reproducible setup scripts for secrets and IAM configuration.

## [1.3.2] - 2025-12-09

### Fixed
- **Linting**: Fixed linter error in `vite.config.js` regarding undefined `process`.

## [1.3.1] - 2025-12-09

### Added
- **Footer**: Added a footer component to display version and environment information (in non-prod environments).
- **Deployment Documentation**: Added comprehensive deployment guide in `README.md` and `RELEASE.md`.

### Changed
- **Deployment Security**: Switched to using Google Cloud Service Accounts for GitHub Actions deployments instead of long-lived tokens.
- **CI/CD**: Updated deployment workflow to inject environment variables at build time.

## [1.3.0] - 2025-12-02

### Added
- **User Identification**: Users are now asked for their name when accessing a decision.
- **Name Persistence**: User names are persisted for future decisions.
- **Name Editing**: Users can edit their display name.
- **Vote Visualization**: User votes for arguments are now visualized with chips showing their name.
- **Final Vote Visualization**: User votes for the final decision are visualized with chips.

## [1.2.0] - 2025-11-20

### Added
- **Final Vote**: Users can vote "Yes" or "No" on the final decision.
- **Final Decision Display**: The final decision result is displayed prominently.

## [1.1.0] - 2025-11-15

### Added
- **Real-time Updates**: Changes are reflected in real-time for all users.
- **Close Decision**: Owners can close a decision to prevent further voting.
- **Export Results**: Users can export the decision results as an image.

## [1.0.0] - 2025-11-01

### Added
- **Create Decision**: Create a new decision with a question.
- **Share Decision**: Share decisions via a unique URL.
- **Add Arguments**: Add pro and con arguments.
- **Vote**: Upvote or downvote arguments.
- **View Results**: View the net score of arguments.
