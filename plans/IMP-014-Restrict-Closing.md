# Implementation Plan - US-014: Restrict Decision Closing

## Goal
Enforce ownership for closing decisions.

## Proposed Changes

### Firestore Rules
#### [MODIFY] `firestore.rules`
-   Update the `update` rule for `decisions/{decisionId}`.
-   Condition:
    ```
    allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']) 
                  && (resource.data.ownerId == null || request.auth.uid == resource.data.ownerId);
    ```
    *(Refine logic to ensure other fields aren't compromised, but focus on status).*

### Frontend (React)
#### [MODIFY] `src/pages/Decision.tsx`
-   Check `user` object from AuthContext.
-   If `decision.ownerId` exists and `user.uid !== decision.ownerId`, hide the "Close Decision" button.
-   Show a tooltip or message if needed? (Probably just hide it).

## Verification Plan

### Automated Tests
-   **Firestore Emulator**:
    -   Test: Non-owner tries to update status -> Deny.
    -   Test: Owner tries to update status -> Allow.
    -   Test: Anonymous user updates anonymous decision -> Allow (if that's the policy).

### Manual Verification
1.  User A creates decision.
2.  User B views decision -> "Close" button hidden.
3.  User A views decision -> "Close" button visible.
4.  User A clicks Close -> Succeeds.
