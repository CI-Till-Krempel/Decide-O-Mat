# US-018: GDPR Compliance

## Description
As a user, I want my data to be handled in compliance with GDPR, including cookie consent and control over third-party services.

## Acceptance Criteria
1.  **Cookie Banner**: A banner asking for consent before storing non-essential cookies.
2.  **Google Services**: Google Analytics/Fonts/etc. are only loaded after consent.
3.  **Revoke**: Option to revoke consent later.

## Technical Notes
-   Implement a Cookie Consent component.
-   Integrate with Google Tag Manager or initialize Firebase Analytics conditionally.
