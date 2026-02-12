# User Story: Results Page Redesign

**As a** participant
**I want** a clear, visually distinct results view when a decision is closed
**So that** I can see the outcome and review all arguments with their vote tallies.

## Acceptance Criteria
1. **Election Results Hero**: A variant of the Election hero component showing a results/ballot icon instead of thumbs-up/down, with the question text centered.
2. **Column Headers**: "Headline" labels (Pro/Con) with "+" add buttons (for reopened decisions).
3. **Sorted Statements**: All statements sorted by vote count (highest first) within their pro/con column.
4. **Voter Chips**: Each statement shows voter name chips ("Zustimmung von" / "Wer hat noch zugestimmt?").
5. **Reopened State**: When a decision is reopened, vote buttons ("+") reappear on each statement card, allowing new votes.
6. **FAB**: Floating action button at bottom-right (share or export).
7. **No Banner**: The current red/green "Decision Closed: Approved/Rejected" banner is removed and replaced by the Election Results hero component.

## Design Gaps
- **Final result communication**: The current implementation shows "Approved" / "Rejected" / "No Votes" prominently. The Figma design does not clearly communicate the final result. Decision: How to display the outcome?
- **Vote counts**: Current Yes/No vote counts are not visible in the Figma Results design.
- **Export as Image**: Currently available as a button — not shown in Figma.

## Technical Notes
- Currently the same `Decision.jsx` component handles both open and closed states via the `isClosed` flag.
- The Election Results hero component is a variant of the Election hero (different icon, possibly different background).
- Reopened decisions should transition back to the voting view.

## Figma Reference
- Node ID: `186:5291` (Results view)
- Node ID: `192:10274` (Voting Reopen view)
- Node ID: `186:5293` (Election Results component)

## Implementation Plan
- [IMP-033-Results-Page-Redesign](../plans/IMP-033-Results-Page-Redesign.md)
