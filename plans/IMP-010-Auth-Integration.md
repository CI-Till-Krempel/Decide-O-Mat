# Implementation Plan - US-010: Firebase Auth Integration

## Goal
Integrate Firebase Authentication for secure user management.

## Proposed Changes

### Backend (Firebase Console)
- Enable Authentication (Google, Email/Password).

### Frontend (React)
#### [MODIFY] `src/firebase.ts`
- Initialize Auth.

#### [MODIFY] `src/contexts/AuthContext.tsx` (replaces UserContext or integrates with it)
- Listen to `onAuthStateChanged`.
- Provide `currentUser`, `signIn`, `signOut`.

#### [NEW] `src/pages/Login.tsx`
- Login form (Email/Pass) and Google Sign-In button.

#### [MODIFY] `src/components/Header.tsx`
- Show "Login" or User Avatar/Logout.

## Verification Plan

### Automated Tests
- **Unit Tests**: Test AuthContext state changes.

### Manual Verification
1.  Click Login.
2.  Sign in with Google.
3.  Verify Header shows user info.
4.  Refresh page -> Session persists.
5.  Logout -> Session clears.
