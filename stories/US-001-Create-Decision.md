# User Story: Create Decision

**As a** host (decision initiator)
**I want to** create a new decision topic
**So that** I can invite others to contribute their opinions.

## Acceptance Criteria
1.  **Landing Page**: The application has a landing page with a prominent input field for the decision question/topic.
2.  **Input Validation**: The topic cannot be empty.
3.  **Creation Action**: Clicking "Start" or pressing Enter creates a new decision instance.
4.  **Redirection**: Upon creation, the user is redirected to the unique URL for that decision.
5.  **Persistence**: The decision topic is saved to the database.

## Technical Notes
- Frontend: Simple form with one text input.
- Backend: API endpoint `POST /decisions` that accepts `{ question: string }`.
- Database: Create a new document in `decisions` collection with auto-generated ID.

## Implementation Plan
- [IMP-001-Create-Decision](../plans/IMP-001-Create-Decision.md)
