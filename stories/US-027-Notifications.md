# US-027: Decision Notifications

## Description
As a participant, I want to be notified when there are updates to a decision (new arguments, votes, or status changes), so that I can stay engaged.

## Acceptance Criteria
- [ ] **Opt-In**: Users can toggle notifications on/off per decision (e.g., bell icon).
- [ ] **Channel**: Browser Push Notifications (FCM).
- [ ] **Triggers**:
    - [ ] Decision Closed/Re-opened.
    - [ ] New Argument added.
- [ ] **Link**: Notifications contain a direct link to the decision.
- [ ] **Privacy**: No PII (Email) stored for notifications.

## Technical Notes
- Requires `Firebase Cloud Functions` (onFirestoreCreate/Update).
- Requires `Firebase Cloud Messaging (FCM)`.
- **Service Worker**: Need to implement a service worker to handle background messages.
- **Token Management**: Store FCM tokens in a private subcollection of the user or decision-participant map (careful with stale tokens).
