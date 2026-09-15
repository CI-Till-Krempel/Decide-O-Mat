# Implementation Notes - ISSUE-455: Deploy Workflow Node 22 Upgrade

**Date:** 2026-09-15

## Context
Following the merge of PR #420 (`fix(functions): add missing firebase-admin dependency (#403)`), the `Deploy` workflow failed on `main` at the `Deploy Functions (Staging)` step with:
```text
Error: Cannot find module '@google-cloud/firestore'
Require stack:
- .../functions/node_modules/firebase-admin/lib/firestore/index.js
- .../functions/node_modules/firebase-functions/lib/common/providers/firestore.js
- .../functions/node_modules/firebase-functions/lib/v2/providers/firestore.js
- .../functions/index.js
```

## Root Cause
- PR #420 upgraded `firebase-admin` to `^14.4.0` in `functions/package.json` and declared `"engines": { "node": "22" }`.
- Under Node 20, `npm ci` omitted packages that declare an incompatible engine requirement (`@google-cloud/firestore`).
- While `pr-checks.yml` and `e2ee-auditor.yml` had been upgraded to `node-version: '22'` in PR #420, `.github/workflows/deploy.yml` and `.github/workflows/boy-scout.yml` were omitted and remained on `node-version: '20'`.
- When the `Deploy` workflow ran on `main`, `deploy-staging` installed dependencies under Node 20, causing `firebase deploy` to fail during functions codebase inspection.

## Technical Changes & Decisions
1. **[.github/workflows/deploy.yml](file:///Users/tkrempel/Documents/Antigravity/Decide-O-Mat/.github/workflows/deploy.yml)**:
   - Upgraded `node-version: '20'` to `node-version: '22'` in `build`, `deploy-staging`, and `deploy-prod` jobs.
2. **[.github/workflows/boy-scout.yml](file:///Users/tkrempel/Documents/Antigravity/Decide-O-Mat/.github/workflows/boy-scout.yml)**:
   - Upgraded `node-version: '20'` to `node-version: '22'` in the `boy-scout` job to prevent maintenance agent failures on `npm install` in `functions/`.

## Verification Results
- **Frontend Linter:** `cd frontend && npm run lint` passed (0 errors).
- **Functions Linter:** `cd functions && npm run lint` passed (0 errors).
- **Frontend Tests:** `cd frontend && npm test` passed (25 test files, 222 tests passed).
- **Frontend Build:** `cd frontend && npm run build` succeeded.
