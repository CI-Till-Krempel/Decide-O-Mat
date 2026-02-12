# User Story: Decision Management Actions

**As a** decision owner
**I want** to edit the question, delete a decision, and view statistics from the archive page
**So that** I can manage my decisions without navigating into each one.

## Acceptance Criteria

### Edit Question
1. **Trigger**: "Frage bearbeiten" action from the archive context menu.
2. **Inline Edit or Modal**: User can modify the question text (implementation TBD — no detailed design).
3. **Encryption**: If the decision is E2E encrypted, the question must be re-encrypted with the stored key.
4. **Authorization**: Only the decision owner can edit the question.
5. **Real-time Update**: The updated question propagates to all subscribed clients.

### Delete Decision
6. **Trigger**: "Entscheidung loeschen" action from the archive context menu.
7. **Confirmation**: User must confirm the deletion (dialog or inline confirmation).
8. **Cascade Delete**: All subcollections are deleted (arguments, votes, participants, finalVotes).
9. **Authorization**: Only the decision owner can delete a decision.
10. **Feedback**: Success/error toast notification after deletion.

### View Statistics
11. **Trigger**: "Statistik anzeigen" from context menu OR statistics icon in the Election hero.
12. **Content**: TBD (no Figma design exists for the statistics view).
13. **Possible Metrics**: Total votes, vote distribution, participation timeline, argument count, most-voted argument.

## Design Gaps
- **Edit question UI**: No modal or inline-edit design in Figma.
- **Delete confirmation dialog**: No design in Figma.
- **Statistics view**: Icon/trigger exists but no content design.

## Technical Notes
- Requires new Cloud Functions:
  - `updateDecisionQuestion(decisionId, newQuestion)` — owner-only
  - `deleteDecision(decisionId)` — owner-only, cascade delete subcollections
- Statistics could be computed client-side from existing data or require a new Cloud Function for aggregation.
- Current backend (`functions/index.js`) has CRUD functions but no edit-question or delete-decision.
- `functions/deleteUser.js` exists as a reference for cascade deletion patterns.

## Implementation Plan
- [IMP-035-Decision-Management-Actions](../plans/IMP-035-Decision-Management-Actions.md)
