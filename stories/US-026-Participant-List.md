# US-026: Participant List Sidebar

## Description
As a user viewing a decision, I want to see a list of all participants involved, so that I know who else is collaborating.

## Acceptance Criteria
- [ ] **Web Layout**: A sidebar (or distinct section) displaying the list of users who have joined the decision.
- [ ] **Mobile Layout**: A collapsible drawer or a section at the bottom/top.
- [ ] **Account Type**: Show an icon with the user level of accountability:
    - 🟡 **Anonymous** (Yellow)
    - 🟢 **Verified Account** (Green)
- [ ] **Details**: Show Display Name and Avatar (if available).
- [ ] **E2E Privacy**: For encrypted decisions, names must be decrypted client-side. Unknown/unencrypted participants should show appropriate placeholders or fallback.

## Technical Notes
- We already have a `participants` subcollection.
- We already subscribe to it in `ParticipantService`. This story is mainly about the *UI* realization (Sidebar).

## Implementation Plan
- [IMP-026-Participant-List](../plans/IMP-026-Participant-List.md)
