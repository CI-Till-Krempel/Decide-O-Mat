# IMP-027: Decision Notifications

## Proposed Changes

### Frontend
#### [NEW] NotificationService
- Request Push Permission (`Notification.requestPermission`).
- Get FCM Token (`getToken`).
- Send Token to Backend.

#### [MODIFY] Decision Page
- Add "Enable Notifications" bell icon.

### Backend
#### [NEW] Cloud Function `subscribeToDecision`
- Store FCM token in `decisions/{id}/participants/{uid}` or separate `notifications` collection.

#### [NEW] Cloud Function `sendNotification`
- Trigger: `onUpdate` or `onCreate` of arguments/status.
- Logic:
    - Payload: "New argument in [Decision Title]".
    - Audience: All tokens in `notifications` subcollection except sender.
    - Send via FCM.

## Verification Plan
### Automated Tests
- Unit test Cloud Function logic (mock FCM).

### Manual Verification
- User A enables notifications.
- User B adds argument.
- User A receives Push Notification.
