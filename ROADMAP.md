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
    - [ ] [US-028](stories/US-028-Design-System-Foundation.md): Design System Foundation (tokens, CSS architecture, dark theme)
    - [ ] [US-029](stories/US-029-Navigation-Redesign.md): Navigation Bar Redesign
    - [ ] [US-030](stories/US-030-Footer-Redesign.md): Footer Redesign (legal links, branding)
    - [ ] [US-031](stories/US-031-Home-Page-Redesign.md): Home Page Redesign (Startseite)
    - [ ] [US-032](stories/US-032-Voting-Page-Redesign.md): Voting Page Redesign (Election hero, statement cards, floating input, FAB)
    - [ ] [US-033](stories/US-033-Results-Page-Redesign.md): Results Page Redesign
    - [ ] [US-034](stories/US-034-Archive-Page-Redesign.md): Archive / My Decisions Page Redesign (Aktivitaeten)
    - [ ] [US-035](stories/US-035-Decision-Management-Actions.md): Decision Management Actions (edit question, delete decision, statistics)

## v1.7 Participants and Notifications
- **Goal**: Make visible who participates in a decision and enable notifications on new votes, arguments or versions.
- **Features**:
- [ ] [US-012](stories/US-012-Private-Decisions.md): Private Decisions (Choose open/private, create a participant list)
    - [ ] [US-027](stories/US-027-Notifications.md): Decision Notifications (Push)

## v1.8 Private Decisions
- **Goal**: Make decisions private and limit participation to a list of users.
- **Features**:
    - [ ] [US-012](stories/US-012-Private-Decisions.md): Private Decisions (Choose open/private, participant list)
    - [ ] [US-012](stories/US-012-Private-Decisions.md): Create a list of participants for private decisions
    - [ ] [US-014](stories/US-014-Restrict-Closing.md): Restrict the closing of decisions to the owner

## v1.9 Production Readiness and Compliance
- **Goal**: Make the app production ready and compliant with legal requirements.
    - [ ] [US-017](stories/US-017-Custom-Domain.md): Add a productive domain address
    - [ ] [US-016](stories/US-016-Legal-Pages.md): Legal Pages (Impress, Terms, Privacy Policy)
    - [ ] [US-016](stories/US-016-Legal-Pages.md): Add data privacy statement
    - [ ] [US-016](stories/US-016-Legal-Pages.md): Add terms of service
    - [ ] [US-016](stories/US-016-Legal-Pages.md): Add privacy policy
    - [ ] [US-018](stories/US-018-GDPR-Compliance.md): GDPR Compliant use of cookies
    - [ ] [US-018](stories/US-018-GDPR-Compliance.md): GDPR Compliant use of google services

## v1.10 Security
- **Goal**: Make the app production ready and secure and safe to use.
    - [ ] [US-019](stories/US-019-Security-Audit.md): Do a security audit
    - [ ] [US-019](stories/US-019-Security-Audit.md): Audit user data access
    - [ ] [US-019](stories/US-019-Security-Audit.md): Audit data access for private decisions
    - [ ] [US-019](stories/US-019-Security-Audit.md): Audit data access for open decisions
    - [ ] [US-019](stories/US-019-Security-Audit.md): Check development setup

## v2.0: Multi-Option Decisions (Future)
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
