# US-008: Final Vote

## Description
As a user, I want to be able to cast a final vote (Yes/No) on the decision itself, so that a clear outcome can be reached beyond just the pros and cons list.

## Acceptance Criteria
1.  **Vote Interface**: A clear "Yes" / "No" voting interface is displayed on the decision page.
2.  **One Vote Per User**: Users can only vote once (enforced via local storage for anonymous users).
3.  **Display Results**: The total count of Yes and No votes is displayed.
4.  **Final Decision**: If the decision is closed, the result (Approved/Rejected) is prominently displayed based on the majority vote.

## Technical Notes
-   Add `finalVotes` map (userId/deviceId -> vote) to the Decision document in Firestore.
-   Or a subcollection `final_votes` if we expect many votes. Given MVP, a map or array in the document might suffice, but subcollection is safer for scalability.
-   Update `Decision.jsx` to show the voting UI.

## Implementation Plan
- [IMP-008-Final-Vote](../plans/IMP-008-Final-Vote.md)
