# User Story: Add Argument (Pro/Con)

**As a** participant
**I want to** add arguments for (Pros) or against (Cons) the decision
**So that** my perspective is considered.

## Acceptance Criteria
1.  **Two Lists**: The decision page displays two distinct lists: "Pros" and "Cons".
2.  **Add Item**: Users can add a text item to either list.
3.  **Validation**: Argument text cannot be empty.
4.  **Real-time Update**: The new item appears immediately for the user and other connected users (if real-time is implemented) or upon refresh.

## Technical Notes
- Backend: API endpoint `POST /decisions/:id/arguments` accepting `{ type: 'pro'|'con', text: string }`.
- Database: Arguments can be a sub-collection of the decision or an array within the decision document (watch out for size limits). Sub-collection is safer for scalability.

## Implementation Plan
- [IMP-003-Add-Argument](../plans/IMP-003-Add-Argument.md)
