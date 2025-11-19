# User Story: View Results

**As a** participant
**I want to** see the current consensus/score
**So that** I know which option is currently favored.

## Acceptance Criteria
1.  **Net Score**: The page displays a "Net Score" calculated as (Total Pro Votes - Total Con Votes).
2.  **Visual Indicator**: A visual cue (e.g., color or icon) indicates whether the decision is currently leaning "Yes" (Positive Score) or "No" (Negative Score).
3.  **Live/Refresh**: The score updates when the page is refreshed or via real-time updates.

## Technical Notes
- Frontend: Calculate the sum of votes from the loaded arguments.
- Backend: Can optionally aggregate scores if performance becomes an issue, but client-side aggregation is fine for MVP.
