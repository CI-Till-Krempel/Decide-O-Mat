# User Story: Vote

**As a** participant
**I want to** vote on specific pros and cons
**So that** I can indicate which arguments are most important.

## Acceptance Criteria
1.  **Voting UI**: Each argument (Pro/Con) has an "Upvote" button (and optionally "Downvote").
2.  **Vote Count**: The total number of votes for each argument is displayed.
3.  **State Persistence**: Ideally, the user's vote is remembered locally (e.g., LocalStorage) to prevent simple duplicate voting from the same browser session (MVP level security).
4.  **Score Update**: Voting updates the argument's score.

## Technical Notes
- Backend: API endpoint `POST /arguments/:id/vote` accepting `{ value: 1 | -1 }`.
- Database: Atomic increment of the vote counter on the argument document.
