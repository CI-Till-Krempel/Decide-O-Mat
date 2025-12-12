# US-025: My Decisions List

## Description
As a logged-in user, I want to see a list of decisions I have created or participated in, so that I can easily find and revisit them.

## Acceptance Criteria
- [ ] **My Decisions View**: A new page or dashboard section displaying a list of decisions.
- [ ] **Filter**: Separate "Created by Me" and "Participated In" (if possible).
- [ ] **Display**: Show Title, Date, and Status (Open/Closed).
- [ ] **Navigation**: Clicking a decision navigates to the decision page.
- [ ] **Synchronization**: The list updates when I join new decisions.
- [ ] **Legacy Data**: If I upgrade from anonymous to logged-in, my previous decisions (tracked by anonymous ID) should appear here.

## Technical Notes
- Requires indexing decisions by `ownerId` and potentially a `participants` array field in the `decisions` document (or a separate collection `user_decisions` for scalability).
- Since Firestore `participants` subcollection is hard to query for "all decisions I'm in", we might need to denormalize participation data (e.g., `participants_ids` array in decision doc, if <1000 participants).
