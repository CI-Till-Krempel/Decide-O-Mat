# Implementation Plan - US-005: View Results

## Goal
Display the aggregate score of the decision.

## Proposed Changes

### Frontend (React)
#### [MODIFY] `src/pages/DecisionPage.tsx`
- Calculate `Total Pros Score` = Sum of votes on Pro arguments.
- Calculate `Total Cons Score` = Sum of votes on Con arguments.
- Calculate `Net Score` = Pros - Cons.
- Display a "Scoreboard" component at the top.

#### [NEW] `src/components/Scoreboard.tsx`
- Visual display of the score.
- Color code: Green (Positive), Red (Negative), Grey (Neutral).

## Verification Plan

### Manual Verification
1.  Add 2 Pros (1 vote each).
2.  Add 1 Con (1 vote).
3.  Verify Net Score is +1.
4.  Upvote a Pro.
5.  Verify Net Score updates to +2.
