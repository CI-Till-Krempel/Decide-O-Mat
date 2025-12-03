# Implementation Plan - US-015: Deployment Pipeline

## Goal
Establish separate development and staging environments.

## Proposed Changes

### Configuration
#### [MODIFY] `.firebaserc`
-   Add aliases for `dev` and `staging` projects.

#### [MODIFY] `.github/workflows/deploy.yml` (or create new)
-   Add jobs for deploying to staging on merge to `main`.
-   Add jobs for deploying to prod on tag creation.

### Infrastructure
-   (Manual) Create Firebase projects in console.
-   (Manual) Add secrets to GitHub repo (`FIREBASE_SERVICE_ACCOUNT_DEV`, etc.).

## Verification Plan

### Manual Verification
1.  Push to `main` -> Verify deployment to staging URL.
2.  Create tag -> Verify deployment to production URL.
