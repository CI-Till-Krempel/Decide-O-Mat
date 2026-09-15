# Technical Note: Mobile Navigation, Safe Padding, and Speed-Dial Sharing Enhancements

**Date**: 2026-09-15  
**Issues Addressed**: [#458](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/458), [#459](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/459), [#460](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/460)

## Overview
This technical note details the fixes for three usability and mobile-responsiveness issues:
1. **Issue #458 (Speed-Dial FAB & Share Icon)**: Replaced the misleading external arrow icon on the Floating Action Button with a standard Share icon and implemented an expandable speed-dial menu offering direct options for **Copy Link** and **QR Code** sharing.
2. **Issue #459 (Header Icons Overlap on Mobile)**: Added safe top padding in `ElectionHero` and responsive constraints to ensure multiline question titles never overlap with top action buttons (`.topActions`).
3. **Issue #460 (Mobile Accessibility for Activity and Participants)**:
   - Added a mobile hamburger menu button and drawer in `Header` enabling seamless navigation between "Decision" and "Activities" on viewports <= 768px.
   - Added a top-level Participants button in `ElectionHero` allowing direct access to the participants list without having to scroll to the bottom toolbar.

## Technical Details & Changes
- **`frontend/src/components/FAB.jsx` & `FAB.module.css`**:
  - Implemented speed-dial popup animation, click-outside dismissal, Escape key handler, and `aria-expanded`/`aria-haspopup` semantics.
  - Replaced icon with standard share vector graphics.
- **`frontend/src/components/Header.jsx` & `Header.module.css`**:
  - Added mobile menu toggle and drawer navigation.
  - Handled render-phase path tracking to automatically close drawer on navigation.
- **`frontend/src/components/ElectionHero.jsx` & `ElectionHero.module.css`**:
  - Added `onOpenParticipants` callback and button to `.topActions`.
  - Added safe top padding (`calc(var(--space-md) + 40px + var(--space-sm))`) to `.hero` so question text is always placed below action icons.
- **`frontend/src/pages/Decision.jsx`**:
  - Connected `onOpenParticipants` to `ElectionHero` and `onCopyLink`/`onShowQRCode` to `FAB`.
- **Tests**:
  - Added `frontend/src/components/FAB.test.jsx`.
  - Updated `frontend/src/components/Header.test.jsx` and `ElectionHero.test.jsx`.

## Verification
- All 27 test files (251 tests) passing.
- Linters in `frontend` and `functions` pass with 0 warnings/errors.
- Production build succeeded.
