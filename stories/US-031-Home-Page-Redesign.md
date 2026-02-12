# User Story: Home Page Redesign

**As a** visitor
**I want** an inviting, visually striking home page with a clear call-to-action
**So that** I understand the app's purpose and can quickly start creating a decision.

## Acceptance Criteria
1. **Full-Bleed Dark Layout**: No card wrapper — the entire page uses the dark theme background.
2. **Background Illustration**: Decorative gradient circle(s) in purple/peach/green tones, extending beyond the viewport for visual depth.
3. **Headline**: "Einfach entscheiden" (or English equivalent) — large, bold, centered, white.
4. **Description Text**: Explanatory paragraph about decision-making (light gray, centered, max-width constrained).
5. **Question Input**:
   - Labeled floating input field ("Zur Klaerung stehende Frage" / "Question to be decided").
   - Placeholder text: "Gib hier deine Frage ein" / "Enter your question here".
   - Clear button (X) appears when text is entered.
6. **Submit Button**: Green circular arrow button centered below the input (not inline).
7. **Responsive**: Layout adapts gracefully to smaller screens.

## Design Gaps
- Text content language depends on i18n decision.

## Technical Notes
- Current component: `frontend/src/pages/Home.jsx`
- Background illustration can be implemented as SVG or CSS gradients.
- Input should use a floating label pattern (label above input, animating on focus).

## Figma Reference
- Node ID: `6:2375` (Startseite - empty state)
- Node ID: `184:5156` (Startseite - with text entered)

## Implementation Plan
- [IMP-031-Home-Page-Redesign](../plans/IMP-031-Home-Page-Redesign.md)
