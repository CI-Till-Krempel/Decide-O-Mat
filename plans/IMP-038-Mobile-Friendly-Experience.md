# Implementation Plan - US-038: Mobile-Friendly Navigation & Responsive Experience

## Goal
Ensure all Decide-O-Mat views and features are completely responsive and accessible on mobile screen widths (320px – 768px), allowing participants scanning QR codes or browsing on mobile to effortlessly navigate, add arguments, vote, and manage decisions.

## Proposed Changes

### Frontend Components & Styling

#### [MODIFY] `frontend/src/components/Header.jsx` & `Header.module.css`
- Replace `display: none` on `.navLinks` with a mobile hamburger menu toggle.
- Create slide-out mobile navigation drawer or dropdown with links to Home, My Decisions, Settings, and language switcher.
- Ensure minimum 44x44px touch targets.

#### [MODIFY] `frontend/src/components/ElectionHero.module.css`
- Add `@media (max-width: 768px)` and `@media (max-width: 480px)` styles.
- Scale question headline fluidly (`clamp(1.25rem, 5vw, 2rem)`).
- Improve spacing and wrap behavior for voter chips and voting action buttons.

#### [MODIFY] `frontend/src/components/FloatingArgumentInput.module.css`
- Adapt overlay layout for mobile: full width with horizontal margins, responsive input height.
- Position overlay gracefully above keyboard using modern viewport-relative positioning.

#### [MODIFY] `frontend/src/pages/Decision.jsx` & `Decision.module.css`
- Add optional mobile tab switcher (`Pros` / `Cons`) for `<= 768px` viewports, reducing scroll length while maintaining fast toggling.
- Adjust toolbar buttons and FAB position with safe area insets (`env(safe-area-inset-bottom)`).

#### [MODIFY] `frontend/src/components/ContextMenu.module.css`
- Add touch-friendly mobile styling or bottom-sheet presentation when opened on small viewports.

#### [MODIFY] `frontend/src/components/StatementCard.module.css`
- Ensure vote action buttons and chip containers have ample touch padding and prevent mis-taps on mobile.

#### [MODIFY] `frontend/index.html`
- Verify viewport meta tag has `width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content`.

## Verification Plan

### Automated Tests
- Component tests for `Header.jsx`:
  - Verify mobile hamburger button renders on small screens.
  - Verify clicking hamburger button opens mobile navigation links.
  - Verify navigation links are accessible via keyboard in mobile mode.
- Viewport tests for `Decision.jsx` and `ElectionHero.jsx`:
  - Verify no horizontal overflow at 320px, 375px, 414px, and 768px widths.
- Build & lint validation:
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`
  - `cd frontend && npm test -- --run`

### Manual Verification
1. Emulate mobile devices in browser DevTools (iPhone SE at 375x667, iPhone 14 at 390x844, Android at 360x800).
2. Open Home page, create a decision, and verify all controls fit cleanly.
3. Open mobile menu in Header and navigate to "My Decisions".
4. On Decision page, test adding a pro and a con argument using the floating input.
5. Verify Yes/No hero voting and argument card upvoting are smooth and touch-friendly.
6. Verify QR code modal and decision management modals fit entirely within the mobile screen.
