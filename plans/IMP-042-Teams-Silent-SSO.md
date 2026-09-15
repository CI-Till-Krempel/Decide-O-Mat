# Implementation Plan - US-042: Microsoft Teams Silent Single Sign-On (SSO)

## Goal
Implement silent SSO inside Microsoft Teams tabs by retrieving an Entra ID token via `@microsoft/teams-js` and exchanging it on the backend for a Firebase Custom Auth Token, eliminating popup logins.

## Proposed Changes

### Backend Cloud Function
#### [NEW] `functions/src/auth/exchangeTeamsToken.js`
- HTTP Callable / API function `exchangeTeamsToken({ idToken })`:
  - Fetch Microsoft Entra public keys using `jwks-rsa`.
  - Verify signature, audience, and expiration of `idToken`.
  - Extract `oid`, `tid`, `name`, `email`, `preferred_username`.
  - Call `admin.auth().createCustomToken(oid, { tenantId: tid, email, provider: 'microsoft.com' })`.
  - Return `{ customToken, userProfile }`.

#### [MODIFY] `functions/package.json`
- Add `jsonwebtoken` and `jwks-rsa` dependencies if not already present.

### Frontend Teams Auth Flow
#### [MODIFY] `frontend/src/contexts/UserContext.jsx`
- Add `loginWithTeamsSSO()`:
  - Call `teams.authentication.getAuthToken()`.
  - Call `exchangeTeamsToken` Cloud Function.
  - Sign in with Firebase: `signInWithCustomToken(auth, customToken)`.

#### [MODIFY] `frontend/src/pages/TeamsTab.jsx`
- Trigger `loginWithTeamsSSO()` automatically upon mounting when inside Teams.

## Verification Plan

### Automated Tests
- Backend unit tests for `exchangeTeamsToken`:
  - Validates valid JWT and returns minted custom token.
  - Rejects forged/expired JWT with 401 Unauthorized.
- Frontend unit tests for `loginWithTeamsSSO`:
  - Handles successful token exchange.
  - Handles consent requirement fallback gracefully.
- Linting:
  - `cd functions && npm run lint`
  - `cd frontend && npm run lint`
