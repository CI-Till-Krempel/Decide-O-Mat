# User Story: Design System Foundation

**As a** user
**I want** a modern, visually consistent dark-themed interface
**So that** the application feels professional and cohesive across all pages.

## Acceptance Criteria
1. **Design Tokens**: A complete set of CSS custom properties extracted from the Figma designs (colors, spacing, typography, shadows, radii).
2. **Dark Theme**: The application renders with the dark color palette as defined in Figma (dark backgrounds, light text, purple/lavender accents, lime green CTAs).
3. **CSS Architecture**: All components use a consistent styling approach (CSS Modules, global CSS, or utility classes — to be decided).
4. **Theme Toggle** (Optional): If decided, a light/dark mode toggle is available in the navigation bar, with the dark theme as default.
5. **Typography**: Font family and weight hierarchy matches the Figma designs (bold display font for headings, regular for body).
6. **No Visual Regression**: Existing functionality continues to work correctly after the token swap.

## Decisions Required
- **Theming strategy**: Dark-only vs. dark+light toggle (Figma shows a toggle icon, suggesting both were intended).
- **CSS architecture**: CSS Modules, Tailwind, global CSS with BEM, or CSS-in-JS.

## Technical Notes
- Current tokens live in `frontend/src/index.css` `:root` block.
- Current codebase uses heavy inline styles in JSX — these should be migrated to the chosen CSS approach as part of each component story.
- The Figma design file key is `ac7nNE0NZCX5iJy25dxDkY`.

## Figma Reference
- All screens use the same token set (consistent dark backgrounds, accent colors, spacing).

## Implementation Plan
- [IMP-028-Design-System-Foundation](../plans/IMP-028-Design-System-Foundation.md)
