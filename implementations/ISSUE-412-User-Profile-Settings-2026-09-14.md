# Implementation Note: Registered User Profile Settings (US-024 / Issue #412)

**Date**: 2026-09-14  
**Issue**: [#412](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/412)  
**Story**: [US-024: User Profile & Self Service](../stories/US-024-User-Profile.md)

## Why

Per US-024 acceptance criteria:
1. **Profile View**: Users can view their registered email and display name.
2. **Edit Name**: Users can update their display name.
3. **Change Password**: Users (Email/Password provider) can request a password reset or change it.

Previously, `UserSettings.jsx` rendered only a minimal single-row panel for authenticated users containing their avatar, display name, a logout button, and a delete account button. Furthermore:
- `user.email` was not exposed in the `user` object emitted by `UserContext.jsx`.
- There was no UI or flow for registered users to edit their display name.
- There was no change/reset password action available for registered users who use email/password auth.

## Technical Changes

1. **`frontend/src/contexts/UserContext.jsx`**:
   - Added `email: firebaseUser.email || null` to the user profile object returned by `UserContext`.

2. **`frontend/src/components/UserSettings.jsx`**:
   - Destructured `resetPassword` from `useUser()`.
   - Moved the `isEditing` conditional above the registered-user check so that registered users can toggle edit mode and utilize the existing display name editor.
   - For authenticated users:
     - Render display name and avatar along with an edit button (✏️) to initiate display name change.
     - Render registered email address below display name.
     - For email/password users (`user.providers.includes('password')`), render a "Reset Password" button that calls `resetPassword(user.email)` and displays feedback on success or failure.
     - Added divider and action buttons for Logout and Delete Account.

3. **`frontend/src/components/UserSettings.module.css`**:
   - Added `.nameRow`, `.emailText`, and `.successText` styles to support registered user information layout.

4. **`frontend/src/locales/en.json` & `frontend/src/locales/de.json`**:
   - Added `buttonResetPassword`, `resetPasswordSent`, `resetPasswordError`, and `emailLabel` in both English and German dictionaries.

5. **`frontend/src/components/UserSettings.test.jsx`**:
   - Removed duplicated mock declarations.
   - Added tests verifying that registered users see their email and display name, can edit their display name, see and click password reset for email/password accounts, and do not see password reset when signed in via Google.

## Deviations & Notes
None. Existing account deletion and re-authentication mechanisms remain intact.
