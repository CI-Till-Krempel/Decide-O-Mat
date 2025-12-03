# US-020: End-to-End Encryption

## Description
As a user, I want my private decisions to be end-to-end encrypted so that even the server administrator cannot read them.

## Acceptance Criteria
1.  **Encryption**: Decision data (question, arguments) is encrypted on the client before sending to Firestore.
2.  **Key Management**: The decryption key is part of the URL (hash fragment) and never sent to the server.
3.  **Decryption**: Data is decrypted on the client side.

## Technical Notes
-   Use `Web Crypto API`.
-   Generate key on creation, append to URL `#key=...`.
-   Store encrypted blobs in Firestore.
