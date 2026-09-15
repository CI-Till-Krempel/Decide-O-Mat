# Implementation Note: Issue #406 - Push Notification Destination URL & Click Handler

**Date:** 2026-09-14  
**Issue:** [#406](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/406)  
**Story Reference:** [US-027: Decision Notifications](stories/US-027-Notifications.md)  
**Author:** Antigravity Agent  

## Context & Problem
In `functions/index.js`, `onArgumentCreate` and `onDecisionStatusChange` sent FCM push notifications using `admin.messaging().sendEachForMulticast`, but omitted the destination URL (`data: { url: ... }` and `webpush: { fcmOptions: { link: ... } }`).
Furthermore, in `frontend/public/firebase-messaging-sw.template.js`, there was no `self.addEventListener('notificationclick', ...)` listener.
When background notifications arrived on a user's device and were clicked, they were simply dismissed without opening or navigating to the decision.

## Solution & Architecture
1. **Cloud Functions (`functions/index.js`):**
   - Attached `data: { url: decisionUrl, decisionId }` and `webpush: { fcmOptions: { link: decisionUrl } }` to the multicast payload in `onArgumentCreate` and `onDecisionStatusChange`.
   - Maintained formatting complying with Google ESLint rules.

2. **Service Worker (`frontend/public/firebase-messaging-sw.template.js`):**
   - Added null-safe payload access for notification title and options.
   - Added `self.addEventListener('notificationclick')` handler that:
     - Closes the clicked notification via `event.notification.close()`.
     - Checks existing client windows via `clients.matchAll({ type: 'window', includeUncontrolled: true })`.
     - Focuses an already open tab matching the target URL or opens a new browser window via `clients.openWindow(targetUrl)`.

3. **Verification & Testing:**
   - Ran `frontend/scripts/generate-sw.js` to ensure the template updates propagate to `firebase-messaging-sw.js`.
   - Added automated regression tests in `frontend/src/test/sw.test.js`.
   - Ran linters in both `functions` and `frontend`.
