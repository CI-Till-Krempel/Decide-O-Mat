# Implementation Plan - US-045: Teams Bot & Interactive Adaptive Cards

## Goal
Implement interactive Adaptive Cards in Microsoft Teams for one-click in-chat voting, pro/con submissions, and proactive notification triggers.

## Proposed Changes

### Adaptive Card Definitions & Bot Logic
#### [NEW] `functions/src/teams/adaptiveCards/decisionCard.js`
- Generate Adaptive Card JSON (Schema v1.5):
  - Question header, status badge, participant count.
  - Score progress bar (Yes/No ratio).
  - Actions:
    - `Action.Execute` (`verb: "voteYes"`, `verb: "voteNo"`).
    - `Action.ShowCard` (add argument form).
    - `Action.OpenUrl` (direct web link).

#### [NEW] `functions/src/teams/adaptiveCards/cardActionHandler.js`
- Handle `Action.Execute` from Teams client:
  - Identify user via Bot Framework user ID / Entra ID token.
  - Invoke `voteDecision` or `addArgument` logic.
  - Re-render and return updated Adaptive Card immediately to refresh card in-place for all participants.

#### [NEW] `functions/src/teams/notifications.js`
- Trigger proactive Teams channel messages when:
  - A decision deadline is approaching (1 hour warning).
  - A decision owner closes the decision and final outcome is calculated.

## Verification Plan

### Automated Tests
- Unit tests for card rendering:
  - Validates card JSON schema compliance against Microsoft Adaptive Cards 1.5 schema.
- Unit tests for action handling:
  - Simulates `voteYes` action and verifies updated card state with correct vote counts.
- Linting:
  - `cd functions && npm run lint`
