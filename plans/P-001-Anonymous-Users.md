# Implementation Plan - Anonymous Users

**Goal**: Implement robust anonymous identity, voting integrity, and device portability.

## Proposed Changes

### Frontend
#### [MODIFY] User Service / Context
- Remove manual `generateUUID` logic.
- Implement `signInAnonymously` in `UserProvider` if `user` is null.
- Expose `user.uid` as the stable ParticipantId.

#### [NEW] Magic Link Page
- Create route `/magic`.
- Logic: `signInWithCustomToken(token)`.

### Backend
#### [NEW] Magic Link Function
- `generateMagicLink` (Callable):
    - Generates `admin.auth().createCustomToken(context.auth.uid)`.
    - Returns token.

#### [MODIFY] Vote Function / Triggers
- Use `context.auth.uid` instead of `data.participantId` for identity verification.
- Enforce strict ownership.

## Verification Plan

### Automated Tests
- Test UUID generation on storage.
- Test Magic Link parsing and storage update.
- Test voting rejection (mocked backend rule).

### Manual Verification
- Open app in incognito -> Check ID generated.
- Vote -> Check ID sent.
- Generate Link -> Send to normal browser -> Verify ID transfers.
