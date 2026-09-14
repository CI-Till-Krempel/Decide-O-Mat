# Implementation Note: Transfer Decision Encryption Keys via Magic Link (US-022 / Issue #413)

**Date**: 2026-09-14  
**Issue**: [#413](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/413)  
**Story**: [US-022: Magic Link Identity Transfer](../stories/US-022-Magic-Link.md)

## Why
When anonymous users transferred their session from Device A to Device B using Magic Link identity transfer, only the Firebase Auth UID was transferred. In Decide-O-Mat, decision questions and statements are end-to-end encrypted (E2EE) with zero-knowledge AES-GCM keys stored locally on Device A in `localStorage` (`dom_decision_keys`).

Because Device B did not receive the encryption keys upon magic link redemption, all encrypted decisions and arguments created or voted on by the user appeared undecryptable on Device B.

## Technical Changes

1. **`frontend/src/services/EncryptionService.js`**:
   - Added `getAllStoredKeys`: retrieves the complete dictionary of stored decision keys from `dom_decision_keys`.
   - Added `importStoredKeys`: securely merges an imported dictionary of decision keys into `dom_decision_keys` without wiping existing keys.
   - Added `encodeKeysPayload` & `decodeKeysPayload`: encodes and decodes the keys dictionary safely for URL hash transmission using URI encoding and base64.
   - Added safe fallback wrappers `safeBtoa` and `safeAtob` for universal execution in browser and test/node runtimes.

2. **`frontend/src/components/MagicLinkData.jsx`**:
   - When generating the magic link, reads all stored decision keys from `EncryptionService.getAllStoredKeys()`.
   - If keys exist, encodes them and appends them to the URL hash fragment (`/magic#token=...&keys=...`).
   - Using the URL hash fragment ensures zero-knowledge transport: the encryption keys are never sent over HTTP to Firebase Hosting, CDNs, or web proxies.

3. **`frontend/src/pages/MagicHandler.jsx`**:
   - Extracted both `token` and `keys` parameters from the URL (supporting both hash fragment and query string for backward compatibility).
   - Sanitizes the browser address bar and history via `window.history.replaceState` upon component mount to prevent leaving sensitive tokens or keys in browser history.
   - Upon successful sign-in via `signInWithCustomToken(auth, token)`, decodes the `keys` payload and calls `EncryptionService.importStoredKeys(parsedKeys)`.

4. **Testing**:
   - `frontend/src/services/EncryptionService.test.js`: Added unit tests for key export, merging, encoding, and decoding.
   - `frontend/src/components/MagicLinkData.test.jsx`: Created unit tests verifying keys bundling in the generated magic link hash.
   - `frontend/src/pages/MagicHandler.test.jsx`: Added unit tests verifying that transferred keys are imported upon successful authentication and history is sanitized.

## Deviations & Notes
None. Zero-knowledge property is strictly preserved as keys never touch the backend/cloud functions.
