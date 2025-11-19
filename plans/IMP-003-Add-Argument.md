# Implementation Plan - US-003: Add Argument

## Goal
Allow users to add Pro/Con arguments to a decision.

## Proposed Changes

### Backend (Cloud Functions)
#### [NEW] `functions/src/addArgument.ts`
- Implement `addArgument` HTTP function.
- Validate input: `decisionId`, `type` ('pro'|'con'), `text`.
- Write to Firestore `decisions/{decisionId}/arguments`:
    - `type`: string
    - `text`: string
    - `votes`: 0
    - `createdAt`: serverTimestamp

### Frontend (React)
#### [MODIFY] `src/pages/DecisionPage.tsx`
- Add two columns/sections: "Pros" and "Cons".
- Add "Add Argument" input form to each section.

#### [NEW] `src/components/ArgumentList.tsx`
- Render list of arguments.
- Subscribe to Firestore `decisions/{decisionId}/arguments` for real-time updates.

#### [MODIFY] `src/api/decisionApi.ts`
- Implement `addArgument(decisionId, type, text)`.

## Verification Plan

### Automated Tests
- **Unit Tests**: Test `addArgument` validation.
- **Integration Tests**: Verify argument is added to sub-collection.

### Manual Verification
1.  Open Decision Page.
2.  Add a "Pro" argument.
3.  Verify it appears in the list immediately.
4.  Open same URL in incognito window.
5.  Verify the new argument is visible there too.
