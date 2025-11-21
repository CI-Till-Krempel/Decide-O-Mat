# Implementation Plan - US-011: User Dashboard

## Goal
Provide a dashboard for users to view and manage their decisions.

## Proposed Changes

### Firestore
- Ensure `decisions` have `ownerId` field.
- Create composite index if needed (`ownerId` + `createdAt`).

### Frontend (React)
#### [NEW] `src/pages/Dashboard.tsx`
- Fetch decisions where `ownerId == currentUser.uid`.
- Display list of decisions (Open/Closed).

#### [MODIFY] `src/App.tsx`
- Add route `/dashboard`.

#### [MODIFY] `src/components/Header.tsx`
- Add link to "My Dashboard" (if logged in).

## Verification Plan

### Automated Tests
- **Unit Tests**: Test Dashboard component rendering with mock data.

### Manual Verification
1.  Login.
2.  Create a new decision.
3.  Go to Dashboard.
4.  Verify new decision is listed.
5.  Click decision -> Navigates to detail page.
