# Implementation Plan - US-004: Vote

## Goal
Allow users to upvote/downvote arguments.

## Proposed Changes

### Backend (Cloud Functions)
#### [NEW] `functions/src/voteArgument.ts`
- Implement `voteArgument` HTTP function.
- Validate input: `decisionId`, `argumentId`, `value` (1 or -1).
- Use Firestore `FieldValue.increment(value)` to atomically update `votes` on the argument document.

### Frontend (React)
#### [MODIFY] `src/components/ArgumentList.tsx`
- Add Upvote/Downvote buttons to each argument item.
- Display current vote count.
- Optimistically update UI on click.
- Persist vote state in `localStorage` (e.g., `voted_{argId}`) to prevent double voting (MVP).

#### [MODIFY] `src/api/decisionApi.ts`
- Implement `voteArgument(decisionId, argumentId, value)`.

## Verification Plan

### Automated Tests
- **Unit Tests**: Test `voteArgument` logic.
- **Integration Tests**: Verify vote count increments correctly in Firestore.

### Manual Verification
1.  Click Upvote on an argument.
2.  Verify count increases +1.
3.  Refresh page.
4.  Verify count persists.
