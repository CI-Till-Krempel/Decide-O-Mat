# User Story: Teams Bot & Interactive Adaptive Cards

**As a** Teams channel member  
**I want to** cast votes (Yes/No or pro/con upvotes) directly on an Adaptive Card in the chat stream and receive proactive decision updates  
**So that** I can participate in team decisions in under 5 seconds without leaving the Teams conversation thread.

## Acceptance Criteria

### Interactive In-Chat Voting
1. **Adaptive Card Actions**:
   - The decision card in Teams chat provides inline action buttons:
     - `Vote Yes` / `Vote No` (`Action.Execute` with `verb: "voteFinal"`).
     - `Add Pro / Con` (`Action.ShowCard` with input fields).
     - `View Breakdown` (deep link to full decision).
2. **Instant Card Refresh**:
   - Upon clicking a vote button, the card updates in-place for all viewers showing updated vote counts, percentage bars, and a confirmation badge for the current user.
   - Handled via Bot Framework `adaptiveCard/action` handler in `< 1000ms`.

### Proactive Event Notifications
3. **Closing Reminder**:
   - When a timed decision is 1 hour away from closing, the bot posts an automatic reminder card in the original thread.
4. **Final Decision Outcome Announcement**:
   - When the decision owner marks a decision as closed or takes the final decision, an updated banner card is posted announcing the final outcome and consensus score.

## Technical Notes
- **Bot Framework SDK**: `botbuilder` (Node.js) running in Google Cloud Functions or Azure Function.
- **Bot Endpoint**:
  - `functions/src/teams/botHandler.js`.
- **Security**: Validates incoming Bot Framework JWT headers (`Authorization: Bearer <token>`) against Microsoft Bot Framework authentication endpoints.

## Implementation Plan
- [IMP-045-Teams-Adaptive-Cards](../plans/IMP-045-Teams-Adaptive-Cards.md)
