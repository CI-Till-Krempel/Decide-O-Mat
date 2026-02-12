# User Story: Navigation Bar Redesign

**As a** user
**I want** a clear, dark-themed navigation bar with structured links and user controls
**So that** I can easily navigate between creating decisions, viewing my activities, and managing my account.

## Acceptance Criteria
1. **Dark Background**: Full-width dark navigation bar, seamless with page background.
2. **Logo**: "Decide-O-Mat" in bold display font (left-aligned).
3. **Navigation Links**: "Entscheidung" (new decision/home) and "Aktivitaeten" (archive/my decisions) links.
4. **Dark Mode Toggle**: A circular button with a moon/sun icon to switch between dark and light themes (if theme toggle is decided in US-028).
5. **User Section** (right-aligned):
   - User avatar (emoji or photo)
   - Display name
   - Edit icon (pencil) to edit name
   - "Log in" link/button for unauthenticated users
6. **Active State**: Current page link is visually highlighted.
7. **Responsive**: Navigation collapses or adapts on smaller screens (mobile design TBD).

## Technical Notes
- Current component: `frontend/src/components/Header.jsx`
- Currently includes `UserSettings` component — needs integration with new layout.
- Navigation links map to existing routes: `/` (home) and `/my-decisions` (archive).

## Figma Reference
- Node ID: `552:1424` (Navigation bar component)

## Implementation Plan
- [IMP-029-Navigation-Redesign](../plans/IMP-029-Navigation-Redesign.md)
