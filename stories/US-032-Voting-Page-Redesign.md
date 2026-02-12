# User Story: Voting Page Redesign

**As a** participant in a decision
**I want** a visually organized voting page with clear pro/con columns, an engaging hero section, and a smooth argument submission experience
**So that** I can effectively contribute arguments and vote on a decision.

## Acceptance Criteria

### Election Hero Component
1. **Hero Card**: Large dark purple card spanning full content width with the decision question centered in bold white text.
2. **Final Vote Icons**: Thumbs-up and thumbs-down circular icon buttons below the question for casting the final vote.
3. **Statistics Button**: A bar-chart icon button in the top-right corner of the hero card (functionality TBD — see design gaps).

### Statement Cards
4. **Dark Themed Cards**: Each argument rendered as a dark card with subtle border.
5. **Author Attribution**: "Statement by [Author Name]" (Figma: "Statement von [Author Name]") label at the top of each card.
6. **Vote Button**: Heart/circle icon button on the right side of each card (replaces current "Vote (N)" pill).
7. **Voter Chips**: "Approved by" (Figma: "Zustimmung von") section with name chips at the bottom of each card.
8. **Own Statement Highlight**: Cards authored by the current user have an orange/coral accent border and "Your statement" (Figma: "Dein Statement") label.
9. **Sorting**: Statements sorted by vote count (highest first).

### Column Layout
10. **Column Headers**: "Add pro" (Figma: "Pro hinzufuegen") / "Add con" (Figma: "Kontra hinzufuegen") labels with circular purple "+" buttons.
11. **Empty State**: Placeholder cards with illustration icons when no statements exist in a column.

### Floating Argument Input
12. **Floating Input Bar**: Sticky bar at the bottom of the viewport for writing new arguments.
13. **Input Flow**: Clicking "+" on a column opens the floating bar, pre-selecting pro or con.
14. **Input Design**: Labeled text field ("Argument"), clear button (X), circular purple send button.
15. **Dismissal**: Bar closes after submission or on explicit cancel.

### FAB (Floating Action Button)
16. **Share FAB**: Lime green floating action button at the bottom-right corner with a share icon.
17. **FAB Action**: Copies the decision link to clipboard (replaces current "Copy Link" button).

## Design Gaps
- **Statistics view**: Icon shown but no design for what statistics page/modal contains.
- **Final vote counts**: Current implementation shows vote counts (Yes: N, No: N) — not visible in Figma.
- **Final voter name chips**: Currently shown under Yes/No buttons — not visible in Figma.
- **Vote Balance / Argument Score**: Currently displayed as metrics — not in Figma.
- **Notifications bell**: Currently on the page — not in Figma.
- **Export as Image**: Currently a button — not in Figma.
- **Close Decision button**: Currently inline — may move to FAB menu or archive context menu only.

## Technical Notes
- Current component: `frontend/src/pages/Decision.jsx` (535 lines, heavy inline styles)
- Affected components: `ArgumentList.jsx`, `ArgumentItem.jsx`, `AddArgumentForm.jsx`
- New components needed: `ElectionHero.jsx`, `FloatingArgumentInput.jsx`, `FAB.jsx`, `StatementCard.jsx`
- The floating input bar requires new state management to track active column (pro/con).

## Figma Reference
- Node ID: `110:1458` (Empty state — "Choose pro or con") (Figma: "Pro oder Con waehlen")
- Node ID: `11:21` (With statements — "Write statement") (Figma: "Statement schreiben")
- Node ID: `110:1694` (Submitting — "Send statement") (Figma: "Statement senden")
- Node ID: `411:1962` (Full voting — "Vote on statement") (Figma: "Statement voten")
- Node ID: `414:2241` (Many statements — mature voting view)
- Node ID: `458:1369` (Election hero component)
- Node ID: `411:1897` (Floating argument input bar)
- Node ID: `555:2074` (FAB Medium button)

## Implementation Plan
- [IMP-032-Voting-Page-Redesign](../plans/IMP-032-Voting-Page-Redesign.md)
