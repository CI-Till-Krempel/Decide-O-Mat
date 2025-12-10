# End-to-End Encryption (E2EE) in Decide-O-Mat

Decide-O-Mat v1.4 introduces End-to-End Encryption (E2EE) to ensure that decision data remains private and accessible only to those who possess the decryption key. This document outlines the technical implementation, threat model, and analysis from various stakeholder perspectives.

## Architecture & Implementation

### Core Technology
-   **Algorithm**: AES-GCM (Advanced Encryption Standard with Galois/Counter Mode).
-   **Key Size**: 256-bits.
-   **Library**: Web Crypto API (`window.crypto.subtle`), available natively in all modern browsers.

### Key Management
-   **Generation**: Keys are generated client-side upon decision creation.
-   **Distribution**: The key is encoded as a JWK (JSON Web Key) and appended to the decision URL as a **hash fragment** (e.g., `.../d/123#key=...`).
    -   *Why Hash Fragment?* Browsers do not send the hash fragment to the server in HTTP requests. This ensures the key never leaves the user's device via standard navigation or API calls.
-   **Storage**: The key is not stored in any persistent database. It exists only in the URL and transient client-side memory.

### Data Flow
1.  **Creation**:
    -   User types a question.
    -   Client generates a random AES-GCM key.
    -   Client encrypts the question.
    -   Client sends **encrypted content** to Firebase Cloud Functions.
    -   Client redirects user to `URL#key=<exported_key>`.
2.  **Viewing**:
    -   User opens link.
    -   Client extracts key from URL hash.
    -   Client fetches encrypted data from Firestore.
    -   Client decrypts data locally using the extracted key.
3.  **Participation**:
    -   New arguments and names are encrypted client-side using the same key before submission.

## Threat Analysis

### Attack Surface & Risks

| Threat Vector | Description | Current Status / Mitigation |
| :--- | :--- | :--- |
| **Compromised Server / Cloud Provider** | Google (or an attacker with admin access) reads Firestore data. | **Mitigated**. They view only ciphertext (encrypted blobs). They cannot decrypt without the key. |
| **Network Eavesdropping** | Attacker intercepts traffic. | **Mitigated**. Requires breaking TLS *and* decrypting the payload. E2EE adds a second layer of defense. |
| **Malicious Client Code (XSS / Supply Chain)** | Attacker injects JS to read `window.location.hash` or intercept `crypto` calls. | **Risk**. If the frontend code is compromised (e.g., malicious NPM package), the key can be exfiltrated. |
| **User Error** | User shares link publicly. | **Risk**. The security model relies on the URL remaining secret. If the URL is posted on a public forum, the key is compromised. |
| **Metadata Leakage** | Access patterns, timestamps, and IP addresses. | **Accepted Risk**. The server knows *who* (IP) accessed *what* (Decision ID) and *when*, but not *what* was decided. |

### Future Mitigations (v2.0+)
-   **Content Security Policy (CSP)**: Restrict where the app can send data to prevent exfiltration if XSS occurs.
-   **Subresource Integrity (SRI)**: Ensure CDN-hosted scripts haven't been tampered with.
-   **Code Signing / Audits**: Regular security reviews of the frontend build pipeline.

## Persona Analysis

### 1. Decision Creator
-   **Role**: Initiates the decision and generates the key.
-   **Perspective**: "I want to ask a sensitive question without my boss or Google reading it."
-   **Responsibility**: Must share the link *securely* (e.g., via Signal, WhatsApp, encrypted email).
-   **Trust**: Trusts their own device and the Decide-O-Mat application code.

### 2. Decision Invitee
-   **Role**: Participates in the decision.
-   **Perspective**: "I want to vote honestly knowing my vote is private to this group."
-   **Experience**: Transparent. If the link works, they see the poll. If the key is missing (e.g., bad copy-paste), they see `[Decryption Failed]`, alerting them to the issue.
-   **Trust**: Trusts the Creator (who sent the link) and the application code.

### 3. Developer (Decide-O-Mat Team)
-   **Role**: Maintains the codebase and deployment pipeline.
-   **Power**: Has the theoretical ability to inject malicious code to steal keys (Access to Source Code).
-   **Limitation**: Cannot retroactively read data created before a potential compromise, as they don't possess the keys for past decisions.
-   **Responsibility**: Must ensure the integrity of the `main` branch and the build process.

### 4. Cloud Provider (Google Firebase)
-   **Role**: Infrastructure host (Compute, Database, Hosting).
-   **Visibility**:
    -   **Can see**: Encrypted strings, Document IDs, Access timestamps, IP addresses.
    -   **Cannot see**: Questions, Arguments, Voter Names, Encryption Keys (as they are in the URL hash).
-   **Status**: Treated as an "Untrusted Storage Provider" for the content of the decisions.
