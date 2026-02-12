# Implementation Plan - US-028: Design System Foundation

## Goal
Establish the visual foundation for the Figma design overhaul: design tokens, CSS architecture, and theming infrastructure.

## Proposed Changes

### Frontend — Design Tokens
#### [MODIFY] `frontend/src/index.css`
- Replace the existing `:root` CSS custom properties with the new dark theme tokens extracted from Figma:
  - **Backgrounds**: `--color-bg-base` (near-black), `--color-bg-card` (dark purple/navy), `--color-bg-elevated` (medium purple for hero cards)
  - **Text**: `--color-text-primary` (white), `--color-text-secondary` (light gray), `--color-text-muted` (gray)
  - **Accents**: `--color-accent-primary` (lavender/purple), `--color-accent-success` (lime green), `--color-accent-highlight` (orange/coral for own statements)
  - **Borders**: `--color-border-subtle` (dark purple), `--color-border-card` (slightly lighter)
  - **Spacing scale**: `--space-xs` through `--space-3xl`
  - **Typography**: `--font-display` (bold logo font), `--font-body`, `--font-size-*` scale
  - **Radii**: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`
  - **Shadows**: Updated for dark theme (lighter/more subtle)
- If theme toggle is chosen: define both `[data-theme="dark"]` and `[data-theme="light"]` token sets.

### Frontend — CSS Architecture
#### Approach: CSS Modules (Recommended)
- Create `*.module.css` files co-located with each component.
- Migrate inline styles from JSX to CSS Module classes.
- Keep `index.css` for global tokens, resets, and base styles.
- Each component story (US-029 through US-034) will create its own CSS Module as part of the redesign.

### Frontend — Theme Toggle (if decided)
#### [NEW] `frontend/src/contexts/ThemeContext.jsx`
- React Context for theme state (`dark` | `light`).
- Persists preference to `localStorage`.
- Sets `data-theme` attribute on `<html>` element.
- Default: `dark`.

### Frontend — Global Base Styles
#### [MODIFY] `frontend/src/index.css`
- Update `body` styles: dark background, light text as defaults.
- Update global element resets (headings, buttons, inputs) for dark theme.
- Remove or update existing utility classes (`.card`, `.btn`, `.input`, `.container`) to work with new tokens.

## Migration Strategy
1. **Phase 1**: Add new tokens alongside existing ones (no breaking changes).
2. **Phase 2**: Each component story migrates its styles to use new tokens + CSS Modules.
3. **Phase 3**: Remove deprecated tokens once all components are migrated.

## Verification Plan

### Automated Tests
- Existing unit tests should pass (token changes are visual, not behavioral).
- Add a snapshot test or visual regression check for the base theme.

### Manual Verification
1. Verify all pages render with the dark theme.
2. Verify CSS custom properties resolve correctly in browser DevTools.
3. If theme toggle: verify switching between dark and light themes.
4. Verify no flash of unstyled content (FOUC) on page load.
