# Issue #195: Rich Text Clipboard for Shared Links

**Date**: 2026-03-27
**Issue**: [Show decision title and creator name when sharing link (#195)](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/195)
**Pull Request**: #226

## The Problem
Users requested that when sharing decision links into third-party chat tools (MS Teams, Slack) or wikis, the shared preview should include the Decision Title and the Creator's Name instead of just a raw URL that says "Decide-O-Mat". 
The standard solution for this is Server-Side Rendering (SSR) injecting OpenGraph tags like `<meta property="og:title" content="...">`. 

## Technical Blockers & Deviations
Two massive blockers presented themselves concerning OpenGraph metadata generation:
1. **Firebase App Hosting**: Decide-O-Mat is hosted dynamically via App Hosting but is effectively a statically built Vite SPA. Generating Server-Side OpenGraph tags dynamically per-route for a static build is unsupported without an SSR/Node framework like Next.js or Remix. Utilizing pure Firebase Functions proxies was unfeasible since `firebase.json` rewrites do not govern App Hosting behavior in this scenario.
2. **End-to-End Encryption (E2EE)**: As documented in `E2E-ENCRYPTION.md`, Decide-O-Mat keys are sent solely via the URL hash (`#key=xxx`), which is never readable by a server. Because the decision title is encrypted utilizing this key, the Node/Firebase server is mathematically incapable of rendering decrypted OpenGraph titles for links fetched by unauthenticated bots (MS Teams crawlers). 

## The Implementation
To bypass the E2EE restrictions and App Hosting limitations, the implementation relies completely on **Rich Text Clipboard Injection (`ClipboardItem` API)**.

When users click "Copy Link" or "Share", the frontend components (`Decision.jsx` and `MyDecisions.jsx`):
1. Extract the current decrypted `decisionTitle` and `creatorName` locally using their existing participant access maps.
2. Generate an HTML anchor blob: `<a href="...">${decisionTitle} (by ${creatorName})</a>`.
3. Push both the `text/html` and a fallback `text/plain` variant into the `navigator.clipboard.write()` API.

**Why this approach?**
- **Zero Architecture Changes:** We did not need to transition off Firebase App Hosting or build Edge Functions.
- **Maintain Perfect Encryption:** By relying on explicit clipboard copy actions by the already-authenticated browser client, the cryptographic key is never inadvertently exposed to backend systems.
- **Native UX Supported:** When pasting this clipboard payload into MS Teams, Slack, Outlook, or Notion, those software platforms natively interpret the `text/html` layer, producing beautifully formatted hyperlink text matching the exact UX request.

If `window.ClipboardItem` strictly fails (e.g., unsupported environments or tests like JSDOM without polyfills), the application safely catches the error and degrades gracefully invoking vanilla `navigator.clipboard.writeText(url)`.
