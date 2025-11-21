# User Story: Close Decision

**As a** participant (or creator)
**I want to** close a decision
**So that** no further votes or arguments can be added, finalizing the result.

## Acceptance Criteria
1.  **Close Action**: A button to "Close Decision" is available on the decision page.
2.  **Visual Indication**: When closed, the decision page clearly indicates the status (e.g., "Decision Closed").
3.  **Read-Only Mode**:
    - Voting buttons are disabled or hidden.
    - "Add Argument" forms are disabled or hidden.
4.  **Re-open**: Optionally, allow re-opening the decision (toggle).

## Technical Notes
- **Database**: Add a `status` field to the decision document (default: 'open').
- **Security**: Update Firestore rules to prevent writes to `arguments` or `votes` if the parent decision is closed.
- **Frontend**: Real-time listener on the decision document to update the UI state immediately.
