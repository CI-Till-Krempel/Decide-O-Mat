# Implementation Plan - US-002: Share Decision

## Goal
Allow users to easily copy the decision URL to share with others.

## Proposed Changes

### Frontend (React)
#### [NEW] `src/pages/DecisionPage.tsx`
- Create the main decision view component.
- Display the `question` (fetched from Firestore).
- Add a "Share" / "Copy Link" button.

#### [NEW] `src/components/ShareButton.tsx`
- Implement button that calls `navigator.clipboard.writeText(window.location.href)`.
- Show a toast/tooltip "Copied!" on success.

## Verification Plan

### Manual Verification
1.  Create a decision.
2.  Click "Copy Link".
3.  Paste into a new tab.
4.  Verify the same decision page loads.
