# Implementation Plan - US-039: Microsoft Entra ID (Azure AD) Web Authentication

## Goal
Enable enterprise single sign-on (SSO) using Microsoft Entra ID (work/school accounts) via Firebase Authentication `OAuthProvider('microsoft.com')`, with automatic anonymous account linking and multi-language support.

## Proposed Changes

### Frontend User Authentication & Context
#### [MODIFY] `frontend/src/contexts/UserContext.jsx`
- Import `OAuthProvider` from `firebase/auth`.
- Implement `loginWithMicrosoft(linkExisting = false)`:
  - Create provider: `const provider = new OAuthProvider('microsoft.com');`
  - Set custom parameters: `provider.setCustomParameters({ prompt: 'select_account', tenant: 'organizations' });`
  - Add scopes: `provider.addScope('User.Read'); provider.addScope('email');`
  - Call `signInWithPopup(auth, provider)` or `linkWithPopup(auth.currentUser, provider)`.
  - Extract and synchronize profile data (`displayName`, `email`, `photoURL`, `tenantId`).

#### [MODIFY] `frontend/src/pages/Login.jsx` & `Login.module.css`
- Add "Sign in with Microsoft" button with official Microsoft icon and styling.
- Wire button click to `loginWithMicrosoft(linkExisting)`.
- Handle Microsoft-specific auth error codes (`auth/popup-closed-by-user`, `auth/account-exists-with-different-credential`).

#### [MODIFY] `frontend/src/locales/en.json` & `frontend/src/locales/de.json`
- Add translation keys:
  - `auth.signInWithMicrosoft`: "Sign in with Microsoft" / "Mit Microsoft anmelden"
  - `auth.microsoftLoginFailed`: "Microsoft sign-in failed. Please try again." / "Microsoft-Anmeldung fehlgeschlagen. Bitte erneut versuchen."

## Verification Plan

### Automated Tests
- Unit tests in `frontend/src/contexts/UserContext.test.jsx`:
  - `loginWithMicrosoft(false)` calls `signInWithPopup` with `OAuthProvider('microsoft.com')`.
  - `loginWithMicrosoft(true)` links existing anonymous user via `linkWithPopup`.
- Unit tests in `frontend/src/pages/Login.test.jsx`:
  - Renders Microsoft login button and dispatches sign-in action.
- Linting & Build:
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`

### Manual Verification
1. Open Login page in a browser.
2. Click "Sign in with Microsoft".
3. Authenticate with an Entra ID / Office 365 work account.
4. Verify user avatar, name, and email are populated in navigation bar and user profile.
5. Create a decision anonymously, log in with Microsoft, and confirm decision ownership is transferred.
