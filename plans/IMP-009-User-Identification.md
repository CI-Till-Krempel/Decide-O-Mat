# Implementation Plan - US-009: User Identification

## Goal
Identify users by a display name to attribute arguments and votes.

## Proposed Changes

### Frontend (React)
#### [NEW] `src/contexts/UserContext.tsx`
- Manage `user` state (`displayName`, `uid` - generated UUID for anon).
- Load/Save to `localStorage`.

#### [MODIFY] `src/components/NamePrompt.tsx`
- Modal or inline input to ask for name if missing.
- Triggered on first action (Vote/Add Argument).

#### [MODIFY] `src/api/decisionApi.ts`
- Include `authorName` and `authorId` in `addArgument`.
- Include `voterId` in votes (if tracking individual votes).

### Firestore
- Update `arguments` documents to include `authorName`.

## Verification Plan

### Automated Tests
- **Unit Tests**: Test `UserContext` persistence.

### Manual Verification
1.  Clear local storage.
2.  Open decision.
3.  Try to vote -> Prompt for name appears.
4.  Enter "Alice".
5.  Vote -> Vote counts.
6.  Add argument -> Argument shows "Added by Alice".
