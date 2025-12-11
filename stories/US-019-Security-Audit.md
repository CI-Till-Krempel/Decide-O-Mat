# US-019: Security Audit & Hardening

## Description
As a site owner, I want to ensure the application is secure against common vulnerabilities so that user data is protected.

## Acceptance Criteria
1.  **Audit**: Perform a security audit (automated + manual).
2.  **Hardening**: Fix identified high/medium vulnerabilities.
3.  **Rules**: Verify Firestore Security Rules are strict.

## Technical Notes
-   Run `npm audit`.
-   Review Firestore Rules.
-   Check for XSS/CSRF vulnerabilities.
