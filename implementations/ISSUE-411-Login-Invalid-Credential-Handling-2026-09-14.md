# Implementation Notes - ISSUE-411: Login Invalid Credential Handling

**Date:** 2026-09-14

## Context
Firebase Authentication v10+ emits `auth/invalid-credential` for unrecognized emails or incorrect passwords to mitigate user enumeration vectors. Because `frontend/src/pages/Login.jsx` only matched legacy error codes (`auth/wrong-password`, `auth/user-not-found`), users entering incorrect credentials were shown a confusing generic message: `"Failed to perform action."`.

## Technical Decisions & Reasoning

### 1. Handle `auth/invalid-credential` Error Code
- **File:** [Login.jsx](file:///Users/tkrempel/Documents/Antigravity/Decide-O-Mat/frontend/src/pages/Login.jsx)
- **Decision:** Map `auth/invalid-credential` to `"Invalid email or password."`.
- **Reasoning:** Informs the user clearly that their authentication details were incorrect without exposing user existence or falling back to an uninformative generic error.

### 2. Unit Testing
- **File:** [Login.test.jsx](file:///Users/tkrempel/Documents/Antigravity/Decide-O-Mat/frontend/src/pages/Login.test.jsx)
- **Decision:** Added a test verifying that when `loginEmail` rejects with `code: 'auth/invalid-credential'`, `"Invalid email or password."` is displayed on screen.

## Verification Results
- **Unit Tests:** `npm test` in `frontend` (all 18 test files passed).
- **Linters:** `npm run lint` passed in both `frontend` and `functions`.
- **Build:** `npm run build` in `frontend` succeeded.
