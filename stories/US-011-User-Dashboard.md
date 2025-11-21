# US-011: User Dashboard

## Description
As a logged-in user, I want to see a list of my decisions so that I can easily revisit and manage them.

## Acceptance Criteria
1.  **My Decisions**: A dashboard page listing decisions created by the user.
2.  **Filter**: Separate lists for "Open" and "Closed" decisions.
3.  **Navigation**: Clicking a decision navigates to its detail page.
4.  **Self Service**: Users can update their profile (display name, avatar if applicable).

## Technical Notes
-   Store `ownerId` in Decision documents.
-   Query decisions where `ownerId == currentUser.uid`.
-   Create `/dashboard` route.
