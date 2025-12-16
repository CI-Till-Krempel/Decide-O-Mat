# US-021: Anonymous Identity & One Vote Limit

**Role**: Anonymous User
**Goal**: I want my identity to be remembered so I don't have to re-enter my name, and I want to be restricted to one vote so the decision is fair.

## Acceptance Criteria

### 1. Persistent Identity (Firebase)
- [ ] On first visit/app load, if not logged in, the app triggers `signInAnonymously()`.
- [ ] A Firebase `uid` is assigned.
- [ ] Firebase SDK handles persistence of the session.
- [ ] My "Display Name" is associated with this UID locally (or in a private user document if we prefer, but local is fine for E2E privacy).

### 2. One Vote Enforcement
- [ ] When I cast a vote (Final Vote or Argument Vote), my `uid` (from the auth token) is verified by the backend.
- [ ] The backend prevents multiple votes from the same `uid`.

### 3. E2E Privacy
- [ ] The backend sees my `participantId` but **cannot** see my Display Name or Vote content (if encrypted).
- [ ] My Display Name is stored in an encrypted `participants` collection, readable only by others with the Decision Key.

## Technical Notes
- Use `crypto.randomUUID()`.
- Ensure new E2E flows utilize this ID instead of just the cookie.

## Implementation Plan
- [P-001-Anonymous-Users](../plans/P-001-Anonymous-Users.md)
