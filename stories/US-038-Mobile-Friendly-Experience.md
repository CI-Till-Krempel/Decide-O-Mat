# User Story: Mobile-Friendly Navigation & Responsive Experience

**As a** mobile user (including participants who scanned a decision QR code on their smartphone)
**I want to** seamlessly navigate and use all Decide-O-Mat features on smaller screen widths
**So that** I can create decisions, add and vote on arguments, cast final votes, and manage my decisions on any mobile device without UI breakage, hidden navigation, or awkward scrolling.

## Acceptance Criteria

### Mobile Navigation & Header
1. **Mobile Menu / Drawer**: On viewports with width <= 768px, navigation links (`.navLinks`) are no longer completely hidden. Instead, an accessible hamburger menu icon or bottom navigation drawer allows full access to:
   - Navigation to "My Decisions" / Archive.
   - User identity / profile & settings.
   - Language switch (English / German).
2. **Safe Touch Area**: Header elements (logo, menu toggle, user avatar) have touch targets of at least 44x44px.

### Decision Page & Layout
3. **Adaptive Column Layout**:
   - On narrow screens (width <= 768px), Pro and Con columns are organized for mobile ease-of-use (either cleanly stacked with compact spacing or switchable via a segmented tab control "Pros / Cons" to avoid excessive vertical scrolling).
   - Column headers and argument counts remain clearly visible and sticky or easy to reference while scrolling.
4. **Mobile Floating Argument Input**:
   - `FloatingArgumentInput` spans the mobile viewport comfortably with safe margins (`margin: 0 var(--space-sm)` or mobile bottom-sheet style).
   - Handles virtual keyboard appearance gracefully without pushing content off-screen or hiding the input field.
   - Send and clear buttons have large, easy-to-tap touch areas.

### Hero & Voting Interactions
5. **Election Hero Scalability**:
   - The question title and election hero card adapt typography responsively down to 320px width without clipping or overflowing.
   - Yes/No vote buttons and voter chips wrap and layout cleanly without overlapping the hero title or stats/QR action buttons.
6. **Touch Targets & Gestures**:
   - All interactive elements on statement cards (upvote, downvote, dot-voting counters, chips) conform to mobile accessibility guidelines (minimum 44x44px touch target bounding box).
   - Spacing between adjacent buttons prevents accidental mis-taps.
7. **Floating Action Button (FAB) Positioning**:
   - Positioned with `env(safe-area-inset-bottom)` and `env(safe-area-inset-right)` support to prevent interference with mobile browser navigation bars, home indicators, or floating inputs.

### Modals & Dialogs
8. **Responsive Dialogs & Bottom Sheets**:
   - All modal dialogs (`QRCodeModal`, `EditQuestionModal`, `ConfirmDeleteDialog`, `UserSettings`) adjust dynamically to mobile viewports:
     - Constrained to viewport width with appropriate padding (e.g., 92-95vw).
     - Vertical scrolling enabled if content exceeds viewport height.
     - Sticky or easily reachable close and action buttons.
9. **Touch-Friendly Context Menus**:
   - In `MyDecisions`, card context menu actions are rendered as touch-friendly lists (or bottom sheets) with ample row height and clear tap feedback instead of tight desktop hover dropdowns.

### General Responsiveness & Viewport
10. **Zero Horizontal Overflow**: No component or page induces unwanted horizontal scrolling (`overflow-x`) on screens down to 320px wide (iPhone SE / small Android devices).
11. **Responsive Typography & Spacing**: Headline and body tokens scale smoothly on mobile using fluid clamp or mobile-specific token overrides.

## Technical Notes
- **CSS Architecture**: Extend existing CSS Modules (`Header.module.css`, `Decision.module.css`, `ElectionHero.module.css`, `FloatingArgumentInput.module.css`, `ContextMenu.module.css`) with unified responsive breakpoints:
  - Mobile: `<= 768px`
  - Compact Mobile: `<= 480px`
- **Virtual Keyboard Handling**: Utilize `interactive-widget=resizes-content` in viewport meta tag or `visualViewport` API listeners where appropriate to ensure floating argument inputs remain visible when software keyboards open.
- **Safe Area Insets**: Add `padding-bottom: max(var(--space-md), env(safe-area-inset-bottom))` to fixed/sticky elements (FAB, bottom sheets, floating inputs).
- **Component Additions**:
  - Add mobile hamburger button and slide-over menu in `Header.jsx`.
  - Introduce optional mobile tab switcher in `Decision.jsx` for Pros/Cons columns.

## Implementation Plan
- [IMP-038-Mobile-Friendly-Experience](../plans/IMP-038-Mobile-Friendly-Experience.md)
