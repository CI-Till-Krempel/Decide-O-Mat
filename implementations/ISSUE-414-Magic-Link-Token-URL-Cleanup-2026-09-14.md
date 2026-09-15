# Implementation Notes - ISSUE-414: Magic Link Token URL Cleanup

**Date:** 2026-09-14

## Context
In `MagicLinkData.jsx` and `MagicHandler.jsx`, the sensitive Firebase custom auth token was passed via URL query parameters (`?token=...`). Leaving the raw auth token in the query string exposed it to browser history, address-bar shoulder surfing, and HTTP Referer headers if external requests were made.

## Technical Decisions & Reasoning

### 1. URL Hash Fragment for Magic Links
- **File:** [MagicLinkData.jsx](file:///Users/tkrempel/Documents/Antigravity/Decide-O-Mat/frontend/src/components/MagicLinkData.jsx)
- **Decision:** Generate magic links using the URL hash fragment: `${window.location.origin}/magic#token=${token}`.
- **Reasoning:** URL fragments are never sent to web servers or included in HTTP Referer headers by browsers, preventing leakage through access logs or outbound referrals.

### 2. Dual-Source Token Extraction and Immediate History Cleanup
- **File:** [MagicHandler.jsx](file:///Users/tkrempel/Documents/Antigravity/Decide-O-Mat/frontend/src/pages/MagicHandler.jsx)
- **Decision:**
  - Extract the token from either `searchParams` (backward compatibility) or `window.location.hash`.
  - Store the extracted token in React state.
  - Immediately sanitize the address bar and navigation history using `window.history.replaceState({}, document.title, window.location.pathname)`.
- **Reasoning:** Sanitizing the URL upon mount ensures the token does not linger in the browser's address bar or navigation history while the component proceeds with authentication.

## Verification Results
- **Unit Tests:** `npm test` passed; added new unit tests in `MagicHandler.test.jsx` for history replacement and hash fragment extraction.
- **Linters:** `npm run lint` passed in both `frontend` and `functions`.
- **Build:** `npm run build` in `frontend` succeeded.
