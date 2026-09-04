# User Story: Statistics View

**As a** decision participant or owner
**I want** to view statistics about a decision's voting activity
**So that** I can understand engagement and outcomes at a glance without manually tallying votes and arguments.

## Acceptance Criteria

### Access
1. **Trigger — Context Menu**: "View statistics" action in the archive/My Decisions context menu (scaffolded as a design intent in US-035 AC 11, but not yet wired into `getContextMenuItems`).
2. **Trigger — Election Hero**: The statistics icon in `ElectionHero` becomes clickable; it currently renders as a static, `aria-hidden` placeholder with no `onClick` handler.
3. **Visibility**: Available in both Voting mode and Results mode of `ElectionHero`; from the archive, available for both open and closed decisions.
4. **Authorization**: Visible to anyone who can already view the decision — statistics are not owner-only, unlike edit/delete.

### Content
5. **Presentation**: Modal or dedicated panel (pattern TBD — no Figma design exists for this view; see Design Gaps).
6. **Core Metrics** (per US-035 AC 13):
   - Total votes cast
   - Vote distribution (Yes vs. No, and per-statement breakdown)
   - Participation timeline (votes over time)
   - Argument count (Pro vs. Con)
   - Most-voted / highest-scoring argument
7. **Reused Metrics**: Surface existing `voteBalance` and `argumentScore` concepts (i18n keys already reserved in `en.json`/`de.json` but currently unused by any component) rather than introducing new terminology.
8. **Live Data**: Statistics reflect real-time data for open decisions (via existing Firestore subscriptions) and frozen final tallies for closed decisions.
9. **Empty State**: Graceful empty state when a decision has no votes or arguments yet.

## Design Gaps
- **No Figma design** exists for the statistics view itself — layout, chart types, and modal-vs-panel treatment are all undecided.
- **Metric computation location**: client-side aggregation from existing subcollections vs. a new Cloud Function for server-side aggregation is undecided.

## Technical Notes
- `frontend/src/components/ElectionHero.jsx` renders a `StatsIcon` inside a `span.statsButton` with `aria-hidden="true"` and no handler — needs to become an interactive, accessible button wired to open the statistics view.
- `frontend/src/pages/MyDecisions.jsx` `getContextMenuItems` wires `view` / `copyLink` / `close-reopen` / `edit` / `delete` entries — a `viewStatistics` entry needs to be added here, opening the same view as the hero trigger.
- i18n keys `decision.statistics`, `decision.voteBalance`, `decision.argumentScore` already exist in both locale files but are currently unused by any component — reuse rather than duplicate.
- Existing data sources (`votes`, `arguments`, `finalVotes` subcollections, per `functions/index.js` and `Decision.jsx` subscriptions) should cover all metrics in AC 6 without new backend work, unless server-side aggregation is chosen per the Design Gaps above.

## Implementation Plan
- Not yet created — the design gaps above (view layout, computation location) should be resolved with a Figma design or a product decision before an implementation plan is written.
