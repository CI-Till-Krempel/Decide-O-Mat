# Implementation Plan - US-013: User Notifications

## Goal
Notify decision owners via email when new arguments are added to their decisions.

## Proposed Changes

### Backend (Cloud Functions)
#### [NEW] `functions/src/notifications.ts` (or similar)
-   Create a Firestore trigger: `exports.notifyOnNewArgument = functions.firestore.document('decisions/{decisionId}/arguments/{argumentId}').onCreate(...)`
-   Logic:
    1.  Fetch parent decision (`decisions/{decisionId}`).
    2.  Check if decision has an `ownerId`.
    3.  Fetch owner's email (via Admin SDK `admin.auth().getUser(ownerId)`).
    4.  Send email (using a helper function/service).

#### [MODIFY] `functions/package.json`
-   Add `nodemailer` (or configure Firebase Email Extension). *Decision: Use Nodemailer for custom control if no extension pre-installed, or assume standard SMTP.*

### Frontend (React)
#### [MODIFY] `src/pages/Dashboard.tsx` (or Profile)
-   Add a toggle: "Receive email notifications" (requires storing user preferences in a `users` collection).
-   *Note*: For MVP of this story, we might skip the UI toggle and default to "On", but the story AC mentions Opt-out.
-   *Refinement*: Create `users` collection to store preferences if not exists.

## Verification Plan

### Automated Tests
-   **Unit Tests (Functions)**: Mock Firestore trigger and verify email sending logic is called.

### Manual Verification
1.  Login as User A.
2.  Create a decision.
3.  Login as User B (or Incognito).
4.  Add an argument to User A's decision.
5.  Verify User A receives an email.
