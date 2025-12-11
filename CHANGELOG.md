# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
