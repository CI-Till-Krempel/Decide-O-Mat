# IMP-024: User Profile & Self Service

## Proposed Changes

### Frontend
#### [NEW] UserSettings Component
- Form to edit `displayName`.
- Display current email (read-only).
- "Delete Account" danger zone.

#### [MODIFY] UserContext / Service
- Implement `updateProfile` wrapper.
- Implement `deleteAccount` wrapper.

### Backend
#### [NEW] Cloud Function `cleanupUserData` (Optional/Later)
- Triggered on `auth.user.delete`.
- Cleans up PII but anonymizes critical data (votes) to maintain decision integrity.
- For MVP: Client-side deletion of auth account is sufficient if Firestore rules handle orphan data or if we don't strictly require cascading deletes yet.

## Verification Plan
### Automated Tests
- Test profile update function.
- Test delete account function (Mocked auth).

### Manual Verification
- Change display name -> Verify it updates in the UI.
- Delete account -> Verify redirected to home and logged out.
- Try to log in with deleted account -> Should fail.
