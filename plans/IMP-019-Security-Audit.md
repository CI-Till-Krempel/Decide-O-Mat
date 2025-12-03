# Implementation Plan - US-019: Security Audit

## Goal
Identify and fix security vulnerabilities.

## Proposed Changes

### Audit
-   Run `npm audit` in `frontend` and `functions`.
-   Review `firestore.rules`.

### Fixes
-   Update dependencies.
-   Tighten Firestore rules (e.g., ensure no open access).

## Verification Plan

### Automated Tests
-   `npm audit` returns 0 high vulnerabilities.
-   Firestore Emulator tests for permission denied scenarios.
