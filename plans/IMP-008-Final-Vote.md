# Implementation Plan - US-008: Final Vote

## Goal
Allow users to cast a final "Yes" or "No" vote on the decision itself.

## Proposed Changes

### Firestore
- Update `decisions/{decisionId}` schema to include:
    - `finalVotes`: Map of `{ userId: 'yes' | 'no' }` (or subcollection if scaling needed).

### Frontend (React)
#### [MODIFY] `src/pages/Decision.tsx`
- Add "Final Vote" section.
- Display "Yes" and "No" buttons.
- Display current counts (Yes vs No).
- If closed, highlight the winning result.

#### [MODIFY] `src/api/decisionApi.ts`
- Add `castFinalVote(decisionId: string, vote: 'yes' | 'no')`.

## Verification Plan

### Automated Tests
- **Unit Tests**: Test voting logic (optimistic updates).

### Manual Verification
1.  Open decision.
2.  Click "Yes".
3.  Verify count updates.
4.  Refresh page, verify vote persists (local storage or auth).
5.  Click "No", verify vote changes.
