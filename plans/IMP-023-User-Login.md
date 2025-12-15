# IMP-023: User Login & Registration

## Proposed Changes

### Frontend
#### [MODIFY] UserContext
- Upgrade `signInAnonymously` to handle actual User Credential states.
- Add `googleSignIn` method.
- Add `emailSignUp` / `emailSignIn` methods.
- Add `logout` method.

#### [NEW] Auth Modal / Page
- Create a UI for "Sign In / Register".
- Toggle between Email/Password form and "Sign in with Google".
- Handle validation (Email format, Password length).

#### [MODIFY] Header
- Add "Login" button if anonymous.
- Show User Avatar/Dropdown if logged in.

### Backend
- Enable Google and Email/Password providers in Firebase Console (Manual Step).

## Verification Plan
### Automated Tests
- Test `UserContext` state transitions (Anonymous -> Logged In -> Logged Out).
- UI tests for the Login Form.

### Manual Verification
- Sign up with a new email.
- Logout.
- Login with the same email -> Verify persistence.
- Login with Google -> Verify account creation.
