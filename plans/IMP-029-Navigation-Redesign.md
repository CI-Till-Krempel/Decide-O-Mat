# Implementation Plan - US-029: Navigation Bar Redesign

## Goal
Redesign the navigation bar to match the Figma dark-themed navigation component.

## Proposed Changes

### Frontend
#### [MODIFY] `frontend/src/components/Header.jsx`
- Restructure JSX layout:
  - Left section: Logo ("Decide-O-Mat" in display font) + nav links ("Entscheidung", "Aktivitaeten").
  - Center section: Dark mode toggle button (if US-028 includes theme toggle).
  - Right section: User avatar + display name + edit icon + "Log in" button.
- Remove old inline styles; use CSS Module.
- Add `active` state styling for current route link using `useLocation()`.

#### [NEW] `frontend/src/components/Header.module.css`
- Dark background (`var(--color-bg-base)` or slightly elevated).
- Flexbox layout with `justify-content: space-between`.
- Logo: Bold display font, white/cream color.
- Nav links: Regular weight, muted color, highlighted on active/hover.
- Toggle button: Circular, green background, moon/sun icon.
- User section: Avatar circle + name text + pencil icon.
- "Log in": Text button, right-aligned.

#### [MODIFY] `frontend/src/components/UserSettings.jsx`
- Adapt to render inline within the new navbar layout (avatar + name + edit) instead of as a standalone dropdown.
- Split the edit-name functionality into a modal/popover triggered by the pencil icon.

### Routing
- Ensure "Entscheidung" links to `/` (home/create decision).
- Ensure "Aktivitaeten" links to `/my-decisions` (archive page).

## Verification Plan

### Automated Tests
- Update `Header` unit tests for new structure and nav links.
- Test active link highlighting based on route.

### Manual Verification
1. Navigate between pages — verify active link state.
2. Verify user name + avatar display for logged-in users.
3. Verify "Log in" button shows for anonymous users.
4. Verify edit icon opens name editing.
5. Verify dark mode toggle (if implemented).
6. Test responsive behavior at various viewport widths.
