# US-013: User Notifications

## Description
As a decision owner, I want to be notified when there are updates to my decisions (e.g., new arguments added), so that I can stay engaged and monitor the progress.

## Acceptance Criteria
1.  **Email Notification**: The decision owner receives an email notification when a new argument is added to their decision.
2.  **Opt-out**: Users can choose to disable notifications in their profile/dashboard.
3.  **Content**: The email contains the new argument text and a link to the decision.

## Technical Notes
-   Use Firebase Cloud Functions (Firestore triggers).
-   Trigger on `onCreate` of an argument document.
-   Retrieve the parent decision to get the `ownerId`.
-   Retrieve the user profile (from Auth or a `users` collection) to get the email (or use Auth SDK if possible/allowed).
-   Use an email sending service (e.g., Firebase Extension "Trigger Email" or Nodemailer with SMTP).

## Implementation Plan
- [IMP-013-User-Notifications](../plans/IMP-013-User-Notifications.md)
