# Implementation Note: Decision Statistics View (US-036 / Issue #405)

**Date**: 2026-09-14  
**Issue**: [#405](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/405)  
**Story**: [US-036: Statistics View](../stories/US-036-Statistics-View.md)

## Why
[US-036: Statistics View](../stories/US-036-Statistics-View.md) specifies that decision participants and owners should be able to view engagement and voting statistics (total votes cast, vote distribution, vote balance, argument breakdown, and highest scoring argument) from both the Decision Election Hero and the My Decisions archive context menu.

Previously:
1. `ElectionHero.jsx` rendered a static, unclickable placeholder (`<span className={styles.statsButton} aria-hidden="true"><StatsIcon /></span>`).
2. `MyDecisions.jsx` lacked a "View statistics" action in its context menu.
3. No statistics presentation modal or calculation component existed.

## Technical Changes

1. **`frontend/src/components/StatisticsModal.jsx` & `StatisticsModal.module.css`**:
   - Created a responsive, accessible dialog (`role="dialog"`, `aria-modal="true"`, Escape key dismiss, backdrop click dismiss).
   - Computes:
     - Total votes cast, Yes vs. No vote tally, percentage breakdown, and progress distribution bar.
     - Vote balance (`+N`, `-N`, or `0`).
     - Total arguments count with Pro vs. Con breakdown.
     - Highlight card for the highest-scoring / most-voted argument.
     - Graceful empty state when no activity has occurred yet.

2. **`frontend/src/components/icons/StatsIcon.jsx`**:
   - Extracted `StatsIcon` into a reusable component used by both `ElectionHero` and `StatisticsModal`.

3. **`frontend/src/components/ElectionHero.jsx`**:
   - Replaced static `span.statsButton` with an accessible button (`aria-label={t('decision.statistics')}`, `onClick={onOpenStats}`).
   - Added `onOpenStats` prop.

4. **`frontend/src/pages/Decision.jsx`**:
   - Added `isStatsOpen` state, automatically opened if `location.state?.openStats` or `location.hash.includes('stats=true')`.
   - Wired `onOpenStats={() => setIsStatsOpen(true)}` to `ElectionHero`.
   - Rendered `StatisticsModal` passing question, final votes list, arguments, and decision state.

5. **`frontend/src/pages/MyDecisions.jsx`**:
   - Added `viewStatistics` action to `getContextMenuItems` for all decisions (open and closed, owner and participant).
   - Updated `navigateToDecision` to accept an `options` object (`{ openStats: true }`), navigating with `#stats=true` and `state: { openStats: true }`.

6. **Localization (`en.json` & `de.json`)**:
   - Added `viewStatistics` in `myDecisions.contextMenu`.
   - Added complete `statisticsModal` dictionary to both English and German language sets.

7. **Testing**:
   - `StatisticsModal.test.jsx`: Added unit tests verifying metrics computation, empty state, and dismissal.
   - `ElectionHero.test.jsx`: Added unit test verifying `onOpenStats` trigger.
   - `MyDecisions.test.jsx`: Added unit tests verifying `View Statistics` presence in context menu.
   - `locales.test.js`: Verified locale key parity.

## Deviations & Notes
None. Client-side aggregation on existing Firestore subcollection subscriptions ensures zero-knowledge and real-time statistics without requiring backend schema migrations.
