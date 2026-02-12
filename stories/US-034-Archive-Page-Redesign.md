# User Story: Archive / My Decisions Page Redesign

**As a** user
**I want** a well-organized archive page that separates running and completed decisions with quick-access management actions
**So that** I can monitor active decisions and revisit past ones efficiently.

## Acceptance Criteria

### Page Layout
1. **Page Title**: "Welche Entscheidungen laufen gerade?" (What decisions are running right now?).
2. **Running Decisions Section** (top):
   - Highlighted cards with green/lime accent border.
   - Shows relative time since creation ("Seit 6 Minuten" / "Since 6 minutes").
   - Decision question text.
   - Context menu trigger button ("..." in green circle).
3. **All Activities Section** ("Alle Aktivitaeten"):
   - Section headline.
   - Two-column grid of decision cards.
   - Each card: Creation date + time, question text, "..." context menu button.
   - Dark cards with subtle borders.

### Context Menus
4. **Running Decision Menu**:
   - "Frage bearbeiten" (Edit question)
   - "Statistik anzeigen" (View statistics)
   - "Entscheidung loeschen" (Delete decision)
   - "Link kopieren" (Copy link)
   - Separator
   - "Entscheidung beenden" (Close decision)
5. **Archived Decision Menu**:
   - "Statistik anzeigen" (View statistics)
   - "Entscheidung loeschen" (Delete decision)
   - Separator
   - "Entscheidung anzeigen" (View decision)

### Interactions
6. **Navigate to Decision**: Clicking the card body navigates to the decision page.
7. **Context Menu Actions**: Each action performs the corresponding operation (see US-035 for backend).
8. **Responsive**: Grid collapses to single column on smaller screens.

## Design Gaps
- **Statistics view**: Referenced in context menus but no design for what it shows.
- **Edit question flow**: No modal/inline-edit design shown.
- **Delete confirmation**: No confirmation dialog design.
- **Empty state**: No design for when the user has no decisions.
- **Role indicator**: Current implementation shows Owner/Invitee badges — not in Figma.

## Technical Notes
- Current component: `frontend/src/pages/MyDecisions.jsx`
- New components needed: `DecisionCard.jsx`, `ContextMenu.jsx`
- Need to separate decisions into "running" (status: open) and "archived" (status: closed).
- Relative time display can use a lightweight library or custom helper (e.g., `timeAgo()`).

## Figma Reference
- Node ID: `334:1544` (Aktivitaeten - single running decision)
- Node ID: `521:1320` (Aktivitaeten - two running decisions)
- Node ID: `386:1561` (Context menu - running decision)
- Node ID: `526:1522` (Context menu - archived decision)

## Implementation Plan
- [IMP-034-Archive-Page-Redesign](../plans/IMP-034-Archive-Page-Redesign.md)
