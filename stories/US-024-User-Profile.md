# US-024: User Profile & Self Service

## Description
As a logged-in user, I want to manage my profile and have the option to delete my account to maintain control over my personal data.

## Acceptance Criteria
- [ ] **Profile View**: Users can view their registered email and display name.
- [ ] **Edit Name**: Users can update their display name.
- [ ] **Change Password**: Users (Email/Pass) can request a password reset or change it.
- [ ] **Delete Account**:
    - [ ] A danger zone option to permanently delete the account.
    - [ ] Requires re-authentication (safeguard).
    - [ ] Deletes user authentication record.
    - [ ] **Anonymization Rules**:
            - **Existing Initial Name**: If the user had an initial anonymous name (e.g., "Anonymous Tiger"), rename to **"Deleted Tiger"**.
            - **No Initial Name**: If no initial name exists (e.g., direct email conversion), generate a new random animal (e.g., "Deleted Bear") for anonymization.
    - [ ] **Data Retention**: Remove PII (email, auth record) but keep anonymized votes/comments for decision integrity. 
    - [ ] **Confirmation Dialog**: Explicit warning before deletion.

## Technical Notes
- Firebase Admin SDK or Cloud Function trigger might be needed for comprehensive data cleanup (cascading deletes).
- Frontend handles the auth user deletion.

## Implementation Plan
- [IMP-024-User-Profile](../plans/IMP-024-User-Profile.md)
