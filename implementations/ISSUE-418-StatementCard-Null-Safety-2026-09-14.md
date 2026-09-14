# Implementation Notes - ISSUE-418: StatementCard Null Safety

**Date:** 2026-09-14

## Context
In `frontend/src/components/StatementCard.jsx`, accessing properties directly on `user` (`user.userId`, `user.displayName`) and invoking methods on `participantMap` (`participantMap.has(user.userId)`) caused runtime uncaught `TypeError` exceptions during initial render or auth transitions when `user` was `null` or `participantMap` was `undefined`.

## Technical Decisions & Reasoning

### 1. Null-Safe Property Access
- **File:** [StatementCard.jsx](file:///Users/tkrempel/Documents/Antigravity/Decide-O-Mat/frontend/src/components/StatementCard.jsx)
- **Decision:**
  - `hasVoted`: Use optional chaining `user?.userId`.
  - `isOwn`: Check `!!user?.userId && argument.authorId === user.userId`.
  - `handleVote`: Check `user?.displayName` and `user?.userId`.
  - `participantMap`: Use optional chaining `participantMap?.has?.(user.userId)` and `participantMap?.get?.(...)`.
- **Reasoning:** In React applications with asynchronous authentication context (`UserContext`), the initial state of `user` is `null` before Firebase auth initializes. Ensuring safe fallbacks prevents white screens and component crashes.

### 2. Dedicated Component Test Suite
- **File:** [StatementCard.test.jsx](file:///Users/tkrempel/Documents/Antigravity/Decide-O-Mat/frontend/src/components/StatementCard.test.jsx)
- **Decision:** Add isolated tests for `StatementCard` verifying:
  - Safe rendering when `user` is `null`.
  - Safe rendering when `participantMap` is `undefined` or `null`.
  - Safe voting behavior without crashing when `participantMap` is `undefined`.
  - Triggering `onNameRequired` when `user.displayName` is empty.

## Verification Results
- **Unit Tests:** `npm test` in `frontend` (19 test files, 179 tests passed).
- **Linters:** `npm run lint` passed in both `frontend` and `functions`.
- **Build:** `npm run build` in `frontend` succeeded.
