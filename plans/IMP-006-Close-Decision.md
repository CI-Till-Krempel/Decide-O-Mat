# Implementation Plan - US-006: Close Decision

## Goal
Allow the creator (or any participant in MVP) to close a decision, preventing further votes or arguments.

## Proposed Changes

### Firestore
- Update `decisions/{decisionId}` schema to include `status: 'open' | 'closed'`.

### Firestore Rules
- Update `firestore.rules`:
    - Allow update to `status` field.
    - Prevent creating/updating `arguments` or `votes` if `get(/databases/$(database)/documents/decisions/$(decisionId)).data.status == 'closed'`.

### Frontend (React)
#### [MODIFY] `src/pages/Decision.tsx`
- Add "Close Decision" button (visible if status is open).
- If closed:
    - Show "Decision Closed" banner.
    - Disable/Hide "Add Argument" form.
    - Disable/Hide Vote buttons.
    - Show "Re-open" button (optional, for MVP).

#### [MODIFY] `src/api/decisionApi.ts`
- Add `closeDecision(decisionId: string)` function (updates Firestore document).

## Verification Plan

### Automated Tests
- **Firestore Emulator**:
    - Test writing to `arguments` on a closed decision (should fail).
    - Test updating `status` to 'closed'.

### Manual Verification
1.  Create a decision.
2.  Add an argument and vote (should succeed).
3.  Click "Close Decision".
4.  Verify "Decision Closed" message.
5.  Try to add argument (UI should prevent or fail).
6.  Try to vote (UI should prevent or fail).
