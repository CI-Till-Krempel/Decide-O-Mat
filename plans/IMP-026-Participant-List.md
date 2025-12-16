# IMP-026: Participant List Sidebar

## Proposed Changes

### Frontend
#### [NEW] ParticipantList Component
- Props: `decisionId`.
- Subscribe to `decisions/{id}/participants` collection.
- Render list of users.
- Differentiate between "Owner", "Authenticated", "Anonymous".

#### [MODIFY] Decision Page
- Embed `ParticipantList` in a Sidebar or Drawer.
- Add toggle button for mobile view.

### Backend
- No changes required (leverages existing `ParticipantService`).

## Verification Plan
### Automated Tests
- Test component rendering with mock data.
- Test empty state.

### Manual Verification
- Open decision with multiple users.
- Verify all names appear.
- Verify status icons (green/yellow).
