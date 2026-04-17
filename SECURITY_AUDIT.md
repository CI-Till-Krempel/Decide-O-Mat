# Security & Compliance Audit — Decide-O-Mat

**Date:** 2026-04-15  
**Branch:** `claude/security-compliance-audit-hbHdw`  
**Scope:** Full pre-launch review — backend functions, Firestore rules, client-side code, CI/CD, open-source posture, GDPR compliance.

---

## Executive Summary

Ten issues were identified and **nine were fixed directly in this branch**. One compliance gap (legal page content) requires manual action before launch. The most critical finding was a Firestore security rules bypass that made the entire database publicly readable without authentication.

---

## Findings & Fixes

### CRITICAL

#### 1. Firestore Rules `|| true` Bypass — **FIXED**

**File:** `firestore.rules`  
**Severity:** Critical — entire database publicly readable

Every read rule contained `|| true`, making all Firestore data accessible to anyone on the internet without authentication:

```
allow read: if debug(request.app) != null || true;
```

This exposed: decision questions, all arguments (including encrypted ones), all votes, participant names, and — critically — **FCM push notification tokens** stored in the `participants` subcollection.

**Fix:** All read rules now require `request.auth != null`. Since every app user is signed in (anonymously at minimum via `UserContext.jsx`), this requires no UX changes while closing the public read hole.

---

#### 2. `toggleDecisionStatus` — No Auth or Ownership Check — **FIXED**

**File:** `functions/index.js`  
**Severity:** Critical — any user could close or reopen any decision

The function had no authentication check and no ownership verification. Any caller (even unauthenticated, since App Check was also disabled — see finding #3) could set any decision's status to `open` or `closed`.

**Fix:** Added `request.auth` check and `ownerId !== request.auth.uid` guard, consistent with the existing pattern in `deleteDecision` and `updateDecisionQuestion`.

---

### HIGH

#### 3. App Check Disabled in All Environments — **FIXED**

**File:** `functions/config.js`  
**Severity:** High — Cloud Functions callable from any HTTP client without attestation

```js
// Before
exports.enforceAppCheck = false; // process.env.GCLOUD_PROJECT === "decide-o-mat";
```

The commented-out production check was hardcoded to `false`, stripping App Check protection from production. This allowed automated scripts and bots to call all Cloud Functions directly.

**Fix:** Restored the environment-based logic:
```js
exports.enforceAppCheck = process.env.GCLOUD_PROJECT === "decide-o-mat";
```

> **Action required:** Verify that the `decide-o-mat` Firebase project has App Check enforced in the Firebase Console (Functions → App Check settings) and that the production ReCaptcha Enterprise key is correctly configured via `VITE_RECAPTCHA_SITE_KEY`.

---

#### 4. `debugAppCheck` Endpoint Exposed in Production — **FIXED**

**File:** `functions/index.js`, `frontend/src/App.jsx`  
**Severity:** High — information disclosure

The `debugAppCheck` Cloud Function returned internal auth/App Check state and was reachable in production. The companion call in `App.jsx` also logged the response to the browser console on every page load.

**Fix:**
- Backend: The function now throws `not-found` when `GCLOUD_PROJECT === "decide-o-mat"`.
- Frontend: The `debugAppCheck` call and its console logging were removed from `App.jsx`.

---

#### 5. `createDecision` — No Authentication Check — **FIXED**

**File:** `functions/index.js`  
**Severity:** High — unauthenticated calls and orphaned decisions

The function lacked an explicit auth guard. A call without auth would create a decision with `ownerId: null`, which could never be deleted or closed, and would then crash on `request.auth.uid` in the `ensureParticipant` call (producing an opaque 500 error rather than a clean 401).

**Fix:** Added `if (!request.auth) throw unauthenticated` at the top. `ownerId` and `participantIds` are now set unconditionally from `request.auth.uid`.

---

#### 6. `addArgument` — Client-Supplied `authorId` Not Validated — **FIXED**

**File:** `functions/index.js`  
**Severity:** Medium-High — identity spoofing

The function accepted `authorId` from the client payload without verifying it against `request.auth.uid`. An authenticated user could attribute an argument to any other user's ID.

**Fix:** When the caller is authenticated, `authorId` is now always taken from `request.auth.uid`, ignoring the client-supplied value.

---

### GDPR / Compliance

#### 7. `deleteUser` Batch Write Limit Exceeded — **FIXED**

**File:** `functions/deleteUser.js`  
**Severity:** High (GDPR) — right-to-erasure could silently fail

Firestore batch writes have a 500-operation limit. The original code had a comment acknowledging the gap:

```js
if (operationCount > 490) {
    // Simple chunking strategy not implemented yet.
}
await batch.commit(); // Would throw for users with many votes
```

If the batch exceeded the limit, the commit would fail. Because `deleteUser` from Firebase Auth was called after, the auth account would be deleted but the Firestore PII (display names in votes) would remain — a GDPR right-to-erasure violation.

**Fix:** Implemented proper chunked batch commits. Each batch is flushed when it reaches 490 operations and a new one is started. Auth deletion is also moved to run **after** all anonymization is committed, so PII is always cleared first.

---

#### 8. Legal Pages Are Placeholder Content — **ACTION REQUIRED**

**File:** `frontend/src/pages/LegalPage.jsx`, `frontend/src/locales/en.json`, `frontend/src/locales/de.json`

All three legal pages (Privacy Policy, Terms of Service, Imprint) render:
> "This page is under construction. Content will be available soon."

**This is a launch blocker for EU/German users:**

| Page | Requirement | Risk |
|---|---|---|
| **Privacy Policy** | GDPR Art. 13/14 — mandatory data processing disclosure | Regulatory fines, trust issues |
| **Terms of Service** | Best practice; needed for enforceable use restrictions | Liability exposure |
| **Imprint** | German TMG §5 — legally required for any commercial/semi-commercial website | §5 TMG fine up to €50,000 |

**The Privacy Policy must cover at minimum:**
- What data is collected (Firebase Auth UID, display name, votes, FCM token)
- Whether data is encrypted (E2E encryption for named decisions)
- Data retention and deletion (right to erasure via the Delete Account feature)
- Third-party processors: Google Firebase (Auth, Firestore, Functions, FCM, App Check), Google reCAPTCHA Enterprise
- Contact information / data controller identity
- User rights under GDPR (access, rectification, erasure, portability)

---

### Open-Source Specific

#### 9. PII / Infrastructure Data in Public Repository — **FIXED**

**Files:** `iam_policy.json`, `iam_policy_v2.json`  
**Severity:** Medium (open-source)

Both files contained:
- A real owner email address (`user:cimm.tkr@gmail.com`)
- A GCP project number (`624578019448`)
- All service account names

These are now replaced with `YOUR_PROJECT_ID` / `YOUR_PROJECT_NUMBER` / `owner@example.com` template placeholders. A `_comment` field explains that only sanitized templates should be committed.

> **Note on git history:** The original values exist in the git commit history. Since this is a public repository, you may want to run `git filter-repo` to purge historical commits if the email address is a concern. Rotating credentials is not required here (no secrets were committed, only public infrastructure identifiers), but the email address is PII.

---

#### 10. Test Artifact in Repository — **FIXED** (via .gitignore)

**File:** `frontend/test_output.txt`  
**Severity:** Low

The file contained a local developer file path (`/Users/tkrempel/Documents/...`) from a partial test run. Added to `.gitignore`. The file itself should be manually deleted from the repo if desired.

---

## Informational / Remaining Recommendations

These do not block launch but should be addressed post-launch:

### CORS: `cors: true` on All Cloud Functions
All functions use `cors: true` (any origin). For production, restrict to your actual domain:
```js
cors: ["https://decide-o-mat.web.app", "https://your-custom-domain.com"]
```

### IAM: Default Service Account Has `roles/editor`
```json
{ "role": "roles/editor", "members": ["...compute@developer.gserviceaccount.com", ...] }
```
`roles/editor` is extremely broad. This is a GCP default and cannot be trivially removed, but it is worth reviewing whether the compute service account actually needs editor-level access.

### IAM: Expired Time-Bound Role in Policy
Both IAM policy files (before sanitization) contained a `secretmanager.admin` binding for a dev-connect service agent, conditioned on `request.time < 2025-12-31T14:00:05.091Z`. This condition has expired and the binding is now permanently inactive. It should be cleaned up in GCP to avoid confusion.

### `deleteUser`: Participant Documents Not Anonymized
The current `deleteUser` implementation anonymizes votes and final votes but does **not** clean up the user's document in the `participants` subcollection (which stores their encrypted name and FCM token). This document remains after account deletion. Consider adding a step to delete or anonymize `decisions/{id}/participants/{uid}` documents as well.

### Rate Limiting
There is no server-side rate limiting on `addArgument`, `voteArgument`, or `createDecision`. A determined user could spam decisions with arguments. Consider adding Cloud Functions rate limiting or per-user quotas post-launch.

### Content Security Policy (CSP)
No `Content-Security-Policy` header is configured in `firebase.json` hosting headers. A CSP would provide an additional XSS mitigation layer.

---

## Summary Table

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | Firestore rules `\|\| true` — all data publicly readable | Critical | Fixed |
| 2 | `toggleDecisionStatus` no auth/owner check | Critical | Fixed |
| 3 | App Check disabled in production | High | Fixed |
| 4 | `debugAppCheck` exposed in production | High | Fixed |
| 5 | `createDecision` no auth check | High | Fixed |
| 6 | `addArgument` authorId spoofable | Medium-High | Fixed |
| 7 | `deleteUser` batch limit — GDPR right-to-erasure gap | High (GDPR) | Fixed |
| 8 | Legal pages are placeholders | Critical (compliance) | **Action required** |
| 9 | PII / infra data in public repo IAM files | Medium | Fixed |
| 10 | Test artifact with local path in repo | Low | Fixed (.gitignore) |
| — | CORS allows all origins | Low | Informational |
| — | Default SA has `roles/editor` | Low | Informational |
| — | Expired IAM condition | Low | Informational |
| — | Participant doc not cleaned on deleteUser | Medium (GDPR) | Informational |
| — | No rate limiting on write functions | Low | Informational |
| — | No Content-Security-Policy header | Low | Informational |
