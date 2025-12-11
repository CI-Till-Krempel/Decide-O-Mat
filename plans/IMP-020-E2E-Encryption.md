# Implementation Plan - US-020: End-to-End Encryption

## Goal
Implement client-side end-to-end encryption for private decisions.

## Proposed Changes

### Frontend (React)
#### [NEW] `src/utils/crypto.ts`
-   Functions for `encrypt(data, key)` and `decrypt(data, key)` using AES-GCM.
-   Function to generate random key.

#### [MODIFY] `src/pages/Home.tsx`
-   If "Private" selected: Generate key, encrypt initial data, redirect to URL with `#key`.

#### [MODIFY] `src/pages/Decision.tsx`
-   Read key from URL hash.
-   Decrypt data fetched from Firestore.

## Verification Plan

### Automated Tests
-   **Unit Tests**: Test encryption/decryption roundtrip.

### Manual Verification
1.  Create private decision.
2.  Check Firestore Console -> Data should be garbled/encrypted.
3.  Visit URL with key -> Data shows correctly.
4.  Visit URL without key -> Error/Prompt for key.
