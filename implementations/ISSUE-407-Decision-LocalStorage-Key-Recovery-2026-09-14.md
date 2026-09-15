# Implementation Note: Issue #407 - Decision Key Recovery from LocalStorage

**Date:** 2026-09-14  
**Issue:** [#407](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/407)  
**Author:** Antigravity Agent  

## Context & Problem
When visiting an encrypted decision (`/d/:id`), the encryption key was previously only loaded if the URL hash explicitly contained `#key=<keyString>`.
If the user reloaded the page, followed an internal link without the fragment, or returned from a bookmark, `location.hash` was empty.
Even though the key had already been stored in `localStorage` under `dom_decision_keys` during the initial visit or creation, `Decision.jsx` never fell back to `EncryptionService.getStoredKey(id)`.
As a result, previously unlocked decisions appeared with raw ciphertext or failed decryption on reload.

## Solution & Architecture
1. **Fallback in `Decision.jsx`:**
   - In the key parsing `useEffect`, if `location.hash` does not contain `key=`, call `EncryptionService.getStoredKey(id)`.
   - If a stored key exists in `localStorage`, set `encryptionKey` state to decrypt the decision question and arguments seamlessly.
   - Guarded asynchronous promise resolution with an `isMounted` flag to prevent state updates on unmounted components.

2. **Testing:**
   - Added unit test in `frontend/src/pages/Decision.test.jsx`: "recovers encryption key from localStorage when URL hash is absent (Issue #407)".
   - Verified that all 42 tests in `Decision.test.jsx` and all test suites in the repository pass.
