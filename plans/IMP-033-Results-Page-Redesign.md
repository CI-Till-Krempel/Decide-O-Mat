# Implementation Plan - US-033: Results Page Redesign

## Goal
Implement the closed/results state of the decision page to match the Figma Results design.

## Proposed Changes

### Frontend

#### [MODIFY] `frontend/src/components/ElectionHero.jsx`
- Add `mode="results"` variant:
  - Shows a ballot/results icon instead of thumbs-up/down.
  - Question text remains centered.
  - Statistics icon button remains in top-right.
  - No vote buttons in results mode.
- This component is created in US-032; this story adds the results variant.

#### [MODIFY] `frontend/src/pages/Decision.jsx`
- When `isClosed === true`:
  - Render `<ElectionHero mode="results" />` instead of `mode="voting"`.
  - Remove the current red/green "Decision Closed" banner.
  - Statements still sorted by vote count.
  - Vote buttons on statement cards are disabled or hidden.
  - Column headers still show "Headline" (Pro/Con) but "+" buttons are hidden.
  - FAB changes icon or behavior (e.g., export instead of share).

#### [MODIFY] `frontend/src/components/StatementCard.jsx`
- Add `readOnly` prop behavior:
  - Vote icon button is grayed out or replaced with a vote count display.
  - Voter chips still display.

### Reopened State
- When a closed decision is reopened (status changes from 'closed' to 'open'):
  - `<ElectionHero>` transitions back to `mode="voting"`.
  - Vote buttons on statement cards re-enable.
  - "+" buttons on column headers reappear.
- The "Re-open" action is triggered from the archive page context menu (US-034) — not from an inline button.

### Removed Elements
- Remove the current `finalResult` banner (`Decision Closed: Approved/Rejected/No Votes`).
- Remove the current `Vote Balance` and `Argument Score` metric displays (not in Figma).
- Remove the inline `Re-open Decision` button (moved to archive context menu).

## Verification Plan

### Automated Tests
- Test `ElectionHero` with `mode="results"` renders correctly.
- Test that vote buttons are disabled when `isClosed` is true.
- Test that reopening transitions back to voting mode.

### Manual Verification
1. Close a decision — verify results view renders with ballot icon.
2. Verify statement cards show vote counts but no active vote buttons.
3. Verify voter chips still display on each statement.
4. Reopen from archive — verify transition back to voting view.
5. Verify no visual regression for the voting state.
