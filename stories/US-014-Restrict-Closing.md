# US-014: Restrict Decision Closing

## Description
As a decision owner, I want to be the only one allowed to close my decision, so that I can control when the voting period ends.

## Acceptance Criteria
1.  **Owner Only**: If a decision has an owner, only that user can toggle the "Open/Closed" status.
2.  **UI Feedback**: The "Close Decision" button is hidden or disabled for non-owners.
3.  **Security**: Backend rules reject status updates from non-owners.
4.  **Legacy Support**: Anonymous decisions (no owner) might still be closable by anyone (or restricted to creator if we had a way, but likely "anyone" for backward compatibility or locked). *Decision: Allow anyone to close anonymous decisions for now, or lock them.* -> *Assumption: Anonymous decisions remain closable by anyone with the link, or we leave them as is.*

## Technical Notes
-   Update `firestore.rules`.
-   Update Frontend to check `currentUser.uid === decision.ownerId`.

## Implementation Plan
- [IMP-014-Restrict-Closing](../plans/IMP-014-Restrict-Closing.md)
