# Implementation Plan - US-001: Create Decision

## Goal
Enable users to create a new decision topic and be redirected to a unique URL.

## Proposed Changes

### Backend (Cloud Functions)
#### [NEW] `functions/src/createDecision.ts`
- Implement `createDecision` HTTP function.
- Validate `request.body.question`.
- Generate `decisionId` (UUID).
- Write to Firestore `decisions/{decisionId}`:
    - `question`: string
    - `createdAt`: serverTimestamp
- Return `{ decisionId }`.

### Frontend (React)
#### [NEW] `src/pages/Home.tsx`
- Create a landing page component.
- Add input field for "Question".
- Add "Start" button.
- `onSubmit`: Call `POST /api/createDecision`.
- On success: `navigate('/d/{decisionId}')`.

#### [NEW] `src/api/decisionApi.ts`
- Implement `createDecision(question: string)` function.

## Verification Plan

### Automated Tests
- **Unit Tests**: Test `createDecision` function with valid/invalid inputs.
- **Integration Tests**: Call the local emulator endpoint and verify Firestore document creation.

### Manual Verification
1.  Open Home page.
2.  Enter "Lunch?".
3.  Click "Start".
4.  Verify redirection to `/d/UUID`.
5.  Check Firestore emulator for new document.
