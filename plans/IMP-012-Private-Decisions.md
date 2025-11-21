# Implementation Plan - US-012: Private Decisions

## Goal
Allow creation of private decisions accessible only to invited participants.

## Proposed Changes

### Firestore
- Update `decisions` schema:
    - `visibility`: 'public' | 'private'
    - `participants`: Array<string> (email or uid)

### Firestore Rules
- Update `firestore.rules`:
    - If `visibility == 'private'`, allow read/write only if `request.auth.uid` in `participants` OR `request.auth.uid == resource.data.ownerId`.

### Frontend (React)
#### [MODIFY] `src/pages/Home.tsx` (Create Decision)
- Add toggle: Public / Private.
- If Private: Input for participant emails.

#### [MODIFY] `src/pages/Decision.tsx`
- Handle "Permission Denied" errors gracefully.

## Verification Plan

### Automated Tests
- **Firestore Emulator**:
    - Test access to private decision by non-participant (should fail).
    - Test access by participant (should succeed).

### Manual Verification
1.  User A creates private decision, invites User B.
2.  User A can access.
3.  User C (not invited) tries to access URL -> Access Denied.
4.  User B logs in -> Can access.
