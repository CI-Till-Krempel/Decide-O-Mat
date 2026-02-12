# Implementation Plan - US-034: Archive / My Decisions Page Redesign

## Goal
Redesign the My Decisions page as the "Aktivitaeten" archive page with running/archived sections and context menus.

## Proposed Changes

### Frontend — New Components

#### [NEW] `frontend/src/components/DecisionCard.jsx` + `.module.css`
- Dark themed card with subtle border.
- Layout:
  - Top-left: Date/time label (absolute or relative).
  - Center: Decision question text (bold, white).
  - Right: "..." context menu trigger button.
- Variants:
  - **Running**: Green/lime accent border, relative time ("Seit 6 Minuten"), green menu button.
  - **Archived**: Standard border, absolute date ("12. Januar 2026 um 12:26 Uhr").
- Props: `decision`, `variant` ('running' | 'archived'), `onMenuAction`.
- Click handler: Navigate to decision page.

#### [NEW] `frontend/src/components/ContextMenu.jsx` + `.module.css`
- Dark purple dropdown menu with icon + label items.
- Supports separator dividers between groups.
- Positioned relative to the trigger button.
- Closes on click outside or on item selection.
- Props: `items` (array of `{ icon, label, action, variant? }`), `isOpen`, `onClose`.
- Keyboard accessible (arrow keys, escape to close).

### Frontend — Modified Components

#### [MODIFY] `frontend/src/pages/MyDecisions.jsx`
- Rename conceptually to "Aktivitaeten" (archive) page.
- Split fetched decisions into two groups:
  - `runningDecisions`: `status === 'open'`
  - `archivedDecisions`: `status === 'closed'`
- Restructure layout:
  - Page heading: "Welche Entscheidungen laufen gerade?"
  - Running section: Render `<DecisionCard variant="running" />` for each.
  - "Alle Aktivitaeten" section heading.
  - Archived grid: Two-column CSS Grid of `<DecisionCard variant="archived" />`.
- Add context menu state management:
  - `activeMenuId`: Which card's menu is open.
  - Menu action handlers: edit, stats, delete, copy link, close/reopen, view.
- Remove current Owner/Invitee badge rendering.

#### [NEW] `frontend/src/pages/MyDecisions.module.css`
- Full dark page layout.
- Section headings: Centered, white, moderate size.
- Running section: Single row (or horizontal scroll if many).
- Archived grid: `display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem`.
- Responsive: Collapse to single column on small screens.

### Utility
#### [NEW] `frontend/src/utils/timeAgo.js`
- Helper function: `timeAgo(date)` → returns relative time string ("Seit 6 Minuten", "Vor 2 Stunden").
- Or: Use `Intl.RelativeTimeFormat` for locale-aware formatting.

### Context Menu Actions
- **Copy link**: `navigator.clipboard.writeText(...)` — reuse existing logic.
- **View decision**: `navigate(/d/${id}#key=...)`.
- **Close decision**: Call `toggleDecisionStatus()` — existing function.
- **Edit question**: Call new `updateDecisionQuestion()` from US-035.
- **Delete decision**: Call new `deleteDecision()` from US-035.
- **View statistics**: Navigate or open modal — deferred until statistics design exists.

## Verification Plan

### Automated Tests
- Unit tests for `DecisionCard` (both variants).
- Unit tests for `ContextMenu` (open, close, item click, keyboard nav).
- Update `MyDecisions.test.jsx` for new layout and sections.
- Test time-ago utility function.

### Manual Verification
1. Verify running decisions appear in top section with green accent.
2. Verify archived decisions appear in two-column grid.
3. Verify context menus open on "..." click and close on outside click.
4. Test each menu action (copy link, close, view).
5. Test empty state (no decisions).
6. Verify responsive layout at narrow viewports.
