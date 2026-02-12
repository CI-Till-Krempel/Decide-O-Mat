# Implementation Plan - US-032: Voting Page Redesign

## Goal
Redesign the decision voting page with the Election hero, new statement cards, floating argument input, and FAB.

## Proposed Changes

This is the largest story — it touches the core decision page and multiple sub-components.

### Frontend — New Components

#### [NEW] `frontend/src/components/ElectionHero.jsx` + `.module.css`
- Dark purple hero card, full content width.
- Question text: Centered, large, bold, white.
- Final vote buttons: Thumbs-up / thumbs-down circular icon buttons.
- Statistics icon button: Bar chart icon, top-right corner.
- Props: `question`, `onVoteYes`, `onVoteNo`, `onShowStats`, `isClosed`, `userVote`.
- Variant: `mode="voting"` vs `mode="results"` (for US-033).

#### [NEW] `frontend/src/components/StatementCard.jsx` + `.module.css`
- Replaces current `ArgumentItem.jsx` rendering.
- Dark card with subtle border.
- Layout:
  - Top: "Statement by [Author]" (Figma: "Statement von [Author]") label (small, muted).
  - Middle: Statement text (white).
  - Right: Heart/circle vote icon button.
  - Bottom: "Approval from" (Figma: "Zustimmung von") label + voter name chips.
- Variant: Own statement (orange/coral accent + "Your Statement" (Figma: "Dein Statement") label).
- Props: `argument`, `isOwn`, `voters`, `hasVoted`, `onVote`, `canVote`.

#### [NEW] `frontend/src/components/FloatingArgumentInput.jsx` + `.module.css`
- Sticky bottom bar (`position: fixed; bottom: 0`).
- Dark background, slightly elevated.
- Layout: Labeled text input ("Argument") + clear button (X) + circular send button.
- Props: `type` (pro/con), `onSubmit`, `onClose`, `isLoading`.
- Animation: Slides up from bottom when opened, slides down to close.

#### [NEW] `frontend/src/components/FAB.jsx` + `.module.css`
- Fixed position: Bottom-right (`bottom: 2rem; right: 2rem`).
- Lime green square button with rounded corners.
- Icon: Share/export icon.
- Props: `icon`, `onClick`, `label` (for a11y).

#### [NEW] `frontend/src/components/ColumnHeader.jsx` + `.module.css`
- Label text ("Add pro" (Figma: "Pro hinzufuegen") / "Add contra" (Figma: "Kontra hinzufuegen")).
- Circular purple "+" button.
- Props: `label`, `onAdd`.

#### [NEW] `frontend/src/components/EmptyStatePlaceholder.jsx` + `.module.css`
- Bordered card with centered illustration icon.
- Props: `type` (pro/con) — selects appropriate illustration.

### Frontend — Modified Components

#### [MODIFY] `frontend/src/pages/Decision.jsx`
- Major refactor — break into sub-components:
  - Replace inline question display with `<ElectionHero />`.
  - Replace `<ArgumentList />` + `<AddArgumentForm />` with column layout using `<ColumnHeader />`, `<StatementCard />` list, and `<EmptyStatePlaceholder />`.
  - Add `<FloatingArgumentInput />` (conditionally visible).
  - Add `<FAB />` (copy link action).
  - Remove inline action buttons (Copy Link, Close Decision, Export) — these move to FAB or archive context menu.
- New state: `activeArgumentColumn` (null | 'pro' | 'con') to control floating input.
- Keep: All existing data logic (subscriptions, encryption, voting).
- Migrate inline styles to CSS Module.

#### [MODIFY] `frontend/src/components/ArgumentList.jsx`
- Update to render `<StatementCard />` instead of `<ArgumentItem />`.
- Keep sorting logic (by vote count).

#### [DEPRECATE] `frontend/src/components/ArgumentItem.jsx`
- Replaced by `StatementCard.jsx`. Can be removed after migration.

#### [DEPRECATE] `frontend/src/components/AddArgumentForm.jsx`
- Replaced by `FloatingArgumentInput.jsx` + `ColumnHeader.jsx`. Can be removed after migration.

## Migration Strategy
1. Create new components first (ElectionHero, StatementCard, etc.) without connecting to Decision.jsx.
2. Write tests for new components in isolation.
3. Refactor Decision.jsx to use new components, preserving all existing logic.
4. Remove deprecated components.
5. Visual QA against Figma.

## Verification Plan

### Automated Tests
- Unit tests for each new component (ElectionHero, StatementCard, FloatingArgumentInput, FAB, ColumnHeader).
- Update `Decision.test.jsx` for new component structure.
- Test floating input open/close/submit flow.
- Test own-statement highlighting logic.

### Manual Verification
1. Create a new decision — verify empty state with illustrations.
2. Add pro and con arguments — verify floating input flow.
3. Verify statement cards render with author, text, vote button, voter chips.
4. Verify own statements have orange highlight.
5. Cast final votes via thumbs-up/down — verify state updates.
6. Verify FAB copies the decision link.
7. Verify real-time updates still work (open in two browser tabs).
8. Verify encryption/decryption still works for all text fields.
