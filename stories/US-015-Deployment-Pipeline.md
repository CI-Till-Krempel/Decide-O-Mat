# US-015: Deployment Pipeline

## Description
As a developer, I want to have separate development and staging environments so that I can test changes safely before deploying to production.

## Acceptance Criteria
1.  **Environments**: Two separate Firebase projects configured (e.g., `decide-o-mat-dev` and `decide-o-mat-staging`).
2.  **CI/CD**: GitHub Actions workflows to deploy to the correct environment based on the branch (e.g., `main` -> staging, `prod` -> production, or tags).
3.  **Configuration**: Frontend builds use correct environment variables for each environment.

## Technical Notes
-   Create new Firebase projects.
-   Update `.firebaserc` with aliases.
-   Update GitHub Actions (`release.yml` or new `deploy.yml`).
-   Use Firebase Hosting channels or separate projects.
