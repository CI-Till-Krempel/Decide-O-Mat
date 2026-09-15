# Roadmap: Decide-O-Mat

## v1.0: MVP (Minimum Viable Product)
**Goal**: Enable users to create a decision, share it, and collect pros/cons with votes.
- **Technical Constraints**:
    - No User Authentication (Capability URLs).
    - Serverless Backend (Google Cloud Functions).
    - NoSQL Database (Firestore/DynamoDB).
    - Single Page Application (SPA).
- **Core Features**:
    - [US-001](stories/US-001-Create-Decision.md): Create Decision
    - [US-002](stories/US-002-Share-Decision.md): Share Decision
    - [US-003](stories/US-003-Add-Argument.md): Add Argument
    - [US-004](stories/US-004-Vote.md): Vote
    - [US-005](stories/US-005-View-Results.md): View Results

---

## v1.1: Enhanced Collaboration (Planned)
- **Goal**: Improve the user experience and data integrity.
- **Features**:
    - [x] [US-005](stories/US-005-View-Results.md): Real-time updates (WebSocket/Subscription).
    - [x] [US-006](stories/US-006-Close-Decision.md): "Close" decision functionality (prevent new votes).
    - [x] [US-007](stories/US-007-Export-Results.md): Export results as image.

## v1.2: Take decision
- **Goal**: Make the final decision visible.
- **Features**:
    - [x] [US-008](stories/US-008-Final-Vote.md): Final Vote (Users can vote Yes/No on decision)
    - [x] [US-008](stories/US-008-Final-Vote.md): The final decision should be displayed, not only the Net Score

## v1.3: Make open decisions non-anonymous
- **Goal**: Add ownership to arguments and final decision.
- **Features**:
    - [x] [US-009](stories/US-009-User-Identification.md): User Identification (Ask for name, persist, edit)
    - [x] [US-009](stories/US-009-User-Identification.md): Persist the user name for future decisions
    - [x] [US-009](stories/US-009-User-Identification.md): Allow the user to edit the name
    - [x] [US-009](stories/US-009-User-Identification.md): Visualize the user votes for arguments with chips
    - [x] [US-009](stories/US-009-User-Identification.md): Visualize the user votes for final decision with chips 

## v1.4 End-to-End Encryption
- **Goal**: Ensure data privacy.
- **Features**:
    - [x] [US-020](stories/US-020-E2E-Encryption.md): End-to-End Encryption

## v1.5 User Authentication and Anonymous User Enhancements
- **Goal**: Offer Real accounts, and improve anonymous user experience.
- **Features**:
    - [x] [US-021](stories/US-021-Anonymous-Identity.md): Anonymous Identity & One Vote Limit
    - [x] [US-022](stories/US-022-Magic-Link.md): Magic Link Identity Transfer
    - [x] [US-010](stories/US-010-Auth-Integration.md): Integrate Firebase Authentication to enable User Authentication
    - [x] [US-023](stories/US-023-User-Login.md): User Login & Registration (OAuth + Email/Pass)
    - [x] [US-024](stories/US-024-User-Profile.md): User Profile & Self Service (Delete Account)
    - [x] [US-025](stories/US-025-My-Decisions.md): My Decisions List

## v1.6 Design Overhaul
- **Goal**: Apply the Figma design system to the entire application — dark theme, new component library, and improved UX patterns.
- **Figma Design File**: `ac7nNE0NZCX5iJy25dxDkY`
- **Features**:
    - [x] [US-028](stories/US-028-Design-System-Foundation.md): Design System Foundation (tokens, CSS architecture, dark theme)
    - [x] [US-029](stories/US-029-Navigation-Redesign.md): Navigation Bar Redesign
    - [x] [US-030](stories/US-030-Footer-Redesign.md): Footer Redesign (legal links, branding)
    - [x] [US-031](stories/US-031-Home-Page-Redesign.md): Home Page Redesign (Startseite)
    - [x] [US-032](stories/US-032-Voting-Page-Redesign.md): Voting Page Redesign (Election hero, statement cards, floating input, FAB)
    - [x] [US-033](stories/US-033-Results-Page-Redesign.md): Results Page Redesign
    - [x] [US-034](stories/US-034-Archive-Page-Redesign.md): Archive / My Decisions Page Redesign (Aktivitaeten)
    - [x] [US-035](stories/US-035-Decision-Management-Actions.md): Decision Management Actions (edit question, delete decision, statistics)

## v2.0: QR Code Sharing, Mobile Experience & Repository Stabilization
- **Release Plan**: [RELEASE-v2.0-Plan.md](plans/RELEASE-v2.0-Plan.md)
- **Goal**: Enable frictionless in-person and hybrid decision sharing via client-side QR codes, provide a first-class mobile-friendly experience across all screens, and resolve all outstanding defects, security gaps, and technical debt across the repository.
- **Features & Scope** *(Exclusive content for this release)*:
    - [x] [US-037](stories/US-037-QR-Code-Decision.md): Show QR Code for Decision Sharing
    - [x] [US-038](stories/US-038-Mobile-Friendly-Experience.md): Mobile-Friendly Navigation & Responsive Experience
    - **Repository Issue Fixes & Quality Hardening**:
        - [x] [#399](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/399): Non-owner participants blocked from reading participants subcollection in Firestore rules
        - [x] [#400](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/400): Direct client writes permitted on participants subcollection without schema validation
        - [x] [#401](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/401): deleteUser fails to remove encryptedDisplayName and breaks argument decryption for others
        - [x] [#402](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/402): Account deletion does not handle owned decisions, creating orphaned and unmanageable decisions
        - [x] [#403](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/403): firebase-admin is missing from functions/package.json dependencies
        - [x] [#404](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/404): E2EE Auditor workflow passes mismatched project ID demo-test, causing CORS failure in CI
        - [x] [#405](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/405): Statistics View (US-036) is unimplemented in ElectionHero and MyDecisions context menu
        - [x] [#406](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/406): Push notifications lack destination URL and Service Worker notificationclick handler
        - [x] [#407](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/407): Decision.jsx does not recover encryption key from localStorage on direct visit or page refresh
        - [x] [#408](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/408): Final vote state relies on localStorage instead of synchronizing with Firestore subcollection
        - [x] [#409](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/409): NamePrompt component uses hardcoded English text and breaks dark theme styling
        - [x] [#410](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/410): Login page completely lacks internationalization support
        - [x] [#411](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/411): Login page does not handle auth/invalid-credential, displaying generic error
        - [x] [#412](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/412): User Profile settings panel lacks email display, name editing, and password change for registered users
        - [x] [#413](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/413): Magic Link identity transfer does not transfer decision encryption keys
        - [x] [#414](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/414): Magic Link custom token is exposed in URL query string without history cleanup
        - [x] [#415](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/415): Dot-voting argument limit is client-side only and not enforced in voteArgument Cloud Function
        - [x] [#416](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/416): No UI control to switch between English and German languages
        - [x] [#417](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/417): Google Fonts loaded unconditionally without prior consent or cookie consent banner
        - [x] [#418](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/418): StatementCard crashes with TypeError if participantMap or user is null/undefined
        - [x] [#458](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/458): QR Code sharing should also be accessible in the share button
        - [x] [#459](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/459): The icons in the header gets overlapped if there is a longer title on mobile devices
        - [x] [#460](https://github.com/CI-Till-Krempel/Decide-O-Mat/issues/460): The Activity and Participants menu items are not accessible on mobile

---

## Deferred & Future Releases (Post-v2.0)

### Private Decisions & Participation Controls (Deferred)
- [ ] [US-012](stories/US-012-Private-Decisions.md): Private Decisions (Choose open/private, participant list)
- [ ] [US-014](stories/US-014-Restrict-Closing.md): Restrict the closing of decisions to the owner

### Extended Compliance & Infrastructure (Deferred)
- [ ] [US-017](stories/US-017-Custom-Domain.md): Add a productive domain address
- [ ] [US-018](stories/US-018-GDPR-Compliance.md): GDPR Compliant use of cookies and google services

### v3.0: Multi-Option Decisions (Future)
- **Goal**: Extend the scope to multi answer decisions.
    - [ ] Support complex decisions with multiple choices (not just Yes/No).
    - [ ] Add multiple options (e.g., "Pizza" vs "Sushi" vs "Burgers") each with their own pro / cons arguments.
    
## Ideas for future releases
- **Goal**: Collect Ideas for future releases.
    - [ ] Ranked choice voting
    - [ ] Make anonymous decisions configurable (arguments, final decision)
    - [ ] Offer an assistant to help setup the decision depending on group size and decision type
    - [ ] Separate roles for users (i.e, owner, decider, contributor, observer)
    - [ ] Show Trust Level for users (Logged in vs anonymous)
    - [ ] Support timed decision closing
    - [ ] Support timed argument voting
    - [ ] Create a cryptographically signed PDF for decisions
    - [ ] Internationalization
    - [x] Support dark mode *(→ v1.6 US-028)*
    - [x] UI Overhaul from Figma designs *(→ v1.6 US-028 through US-035)*
    - [ ] Theming support (e.g., custom colors)
    - [ ] Support for on premise hosting
    - [ ] Support for self-hosting
    - [ ] Support for configurable AI argument generation
    - [ ] Add custom workflows for Antigravity
    - [ ] Add automated issue triaging via AI
    - [ ] Add MCP Servcer for LLM access
    - [ ] Add RAG for knowledge base for argument creation
    - [ ] Add Browser Based Acceptance UI Tests
    - [ ] Add mobile apps to improve User Trust with anonymous login 
