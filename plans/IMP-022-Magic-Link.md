# IMP-022: Magic Link Identity Transfer

## Proposed Changes

### Frontend
#### [MODIFY] Router
- Add `/magic` route to handle token consumption.

#### [NEW] MagicHandler Component
- Extract `token` query parameter.
- Call `auth.signInWithCustomToken(token)`.
- Redirect to Home or previously visited page upon success.

#### [MODIFY] Settings Component
- Add "Transfer Identity" button.
- Call `functions.generateMagicLink()`.
- Display the returned link with copy functionality.

### Backend
#### [NEW] Cloud Function `generateMagicLink`
- Check authentication (must be logged in anonymously).
- Generate a custom token using `admin.auth().createCustomToken(uid)`.
- Return the token (or full link) to the client.

## Verification Plan
### Automated Tests
- Unit test for `generateMagicLink` to ensure it returns a token for auth users.
- Integration test handling the `/magic` route.

### Manual Verification
- Open app in incognito (User A).
- Generate Link.
- Open Link in a different browser/device (User B).
- Verify User B has the same UID and data as User A.
