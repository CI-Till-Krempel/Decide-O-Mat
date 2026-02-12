# Implementation Plan - US-035: Decision Management Actions

## Goal
Implement backend and frontend support for editing questions, deleting decisions, and viewing statistics.

## Proposed Changes

### Backend (Cloud Functions)

#### [NEW] `functions/index.js` — `updateDecisionQuestion`
- Callable function: `updateDecisionQuestion({ decisionId, newQuestion })`.
- Authorization: Verify `request.auth.uid === decision.ownerId`.
- App Check enforcement (consistent with other functions).
- Validation: `newQuestion` must be a non-empty string.
- Update: `decisions/{decisionId}.question = newQuestion`.
- Note: The question may be encrypted — the client handles encryption before calling this function.

#### [NEW] `functions/index.js` — `deleteDecision`
- Callable function: `deleteDecision({ decisionId })`.
- Authorization: Verify `request.auth.uid === decision.ownerId`.
- App Check enforcement.
- Cascade delete all subcollections:
  1. `decisions/{decisionId}/arguments/{argId}` (and each argument's `votes` subcollection).
  2. `decisions/{decisionId}/participants/{userId}`.
  3. `decisions/{decisionId}/finalVotes/{userId}`.
  4. `decisions/{decisionId}` (the document itself).
- Use batched writes or recursive delete (reference `deleteUser.js` for patterns).
- Return success/failure status.

### Frontend — Service Layer

#### [MODIFY] `frontend/src/services/firebase.js`
- Add `updateDecisionQuestion(decisionId, newQuestion)` — calls the Cloud Function.
- Add `deleteDecision(decisionId)` — calls the Cloud Function.

### Frontend — Edit Question UI

#### [NEW] `frontend/src/components/EditQuestionModal.jsx` + `.module.css`
- Modal dialog with:
  - Current question text pre-filled in an input.
  - Save and Cancel buttons.
  - Loading state during save.
- On save:
  - If E2E encrypted: Encrypt new question with stored key before calling function.
  - Call `updateDecisionQuestion()`.
  - Close modal on success, show toast on error.
- Triggered from archive page context menu.

### Frontend — Delete Confirmation UI

#### [NEW] `frontend/src/components/ConfirmDeleteDialog.jsx` + `.module.css`
- Confirmation dialog:
  - Warning message: "Are you sure you want to delete this decision? This action cannot be undone."
  - Decision question text displayed for confirmation.
  - "Delete" (danger) and "Cancel" buttons.
  - Loading state during deletion.
- On confirm: Call `deleteDecision()`, remove from list, show toast.

### Frontend — Statistics (Deferred)
- The statistics view has no Figma design.
- For now: The "Statistik anzeigen" menu item can navigate to the decision page (which shows the data).
- Future: Create a dedicated statistics modal/page when design is available.

### Integration with Archive Page (US-034)

#### [MODIFY] `frontend/src/pages/MyDecisions.jsx`
- Wire context menu actions:
  - "Frage bearbeiten" → Open `<EditQuestionModal />`.
  - "Entscheidung loeschen" → Open `<ConfirmDeleteDialog />`.
  - "Statistik anzeigen" → Navigate to decision page (temporary).

## Verification Plan

### Automated Tests
- **Backend**:
  - Test `updateDecisionQuestion` with valid owner (success).
  - Test `updateDecisionQuestion` with non-owner (auth failure).
  - Test `deleteDecision` cascade deletes all subcollections.
  - Test `deleteDecision` with non-owner (auth failure).
- **Frontend**:
  - Test `EditQuestionModal` renders, submits, handles errors.
  - Test `ConfirmDeleteDialog` renders, confirms, cancels.
  - Test encrypted question re-encryption in edit flow.

### Manual Verification
1. Edit a question from archive — verify it updates in real-time.
2. Edit an encrypted question — verify encryption/decryption works.
3. Delete a decision — verify it disappears from archive.
4. Attempt edit/delete as non-owner — verify authorization error.
5. Verify toast notifications for success/error states.
