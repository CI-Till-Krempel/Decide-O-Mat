# IMP-025: My Decisions List

## Proposed Changes

### Frontend
#### [NEW] MyDecisions Page
- Fetch decisions where `ownerId == currentUser.uid`.
- Fetch decisions where `participants` array contains `currentUser.uid` (if applicable) or query via `finalVotes` / `arguments`.
- Display list with:
    - Title
    - Role (Owner/Participant)
    - Status (Open/Closed)
    - Created At date.

#### [MODIFY] Home / Header
- Add link to "My Decisions".

### Backend
#### [MODIFY] Firestore Indexes
- Composite index for `ownerId` + `createdAt` (for sorting).

## Verification Plan
### Automated Tests
- Test filtering logic.
- Test rendering of the list.

### Manual Verification
- Create 2 decisions.
- Join 1 decision as a participant.
- Open "My Decisions" -> Verify all 3 appear correctly.
