# US-010: Firebase Auth Integration

## Description
As a user, I want to be able to sign in so that I can securely manage my identity and access my decisions across devices.

## Acceptance Criteria
1.  **Sign In/Register**: Users can sign in using Google (OAuth) or Email/Password.
2.  **Sign Out**: Users can sign out.
3.  **Session Management**: User session persists across reloads.
4.  **Anonymous Upgrade**: If a user was anonymous, their local data (if possible) or future actions are linked to the new account.

## Technical Notes
-   Enable Authentication in Firebase Console (Google, Email/Password).
-   Implement `AuthContext` in React to manage user state.
-   Update UI to show Login/Logout buttons.
