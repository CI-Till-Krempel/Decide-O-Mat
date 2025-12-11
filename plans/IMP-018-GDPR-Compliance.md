# Implementation Plan - US-018: GDPR Compliance

## Goal
Ensure GDPR compliance via cookie consent.

## Proposed Changes

### Frontend (React)
#### [NEW] `src/components/CookieConsent.tsx`
-   Banner UI.
-   Store consent in `localStorage`.

#### [MODIFY] `src/App.tsx`
-   Include `CookieConsent`.

#### [MODIFY] `src/firebase.ts`
-   Wrap `getAnalytics(app)` to only initialize if consent given.

## Verification Plan

### Manual Verification
1.  Clear storage -> Reload.
2.  Verify Banner appears.
3.  Verify no Analytics requests (Network tab).
4.  Accept -> Verify Analytics requests start.
