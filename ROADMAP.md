# Roadmap: Decide-O-Mat

## v1.0: MVP (Minimum Viable Product)
**Goal**: Enable users to create a decision, share it, and collect pros/cons with votes.

### Scope
- **Core Features**:
    - [x] Create Decision (Question + Unique URL)
    - [x] Share Decision (Copy Link)
    - [x] Add Arguments (Pros & Cons)
    - [x] Vote on Arguments (Upvote/Downvote)
    - [x] View Results (Net Score)
- **Technical Constraints**:
    - No User Authentication (Capability URLs).
    - Serverless Backend (Google Cloud Functions).
    - NoSQL Database (Firestore/DynamoDB).
    - Single Page Application (SPA).

### User Stories
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
    - [x] [US-008](stories/US-008-Final-Vote.md): Final Vote (Users can vote Yes/No on decision)
    - [x] [US-008](stories/US-008-Final-Vote.md): The final decision should be displayed, not only the Net Score

## v1.3: Make open decisions non-anonymous
    - [x] [US-009](stories/US-009-User-Identification.md): User Identification (Ask for name, persist, edit)
    - [x] [US-009](stories/US-009-User-Identification.md): Persist the user name for future decisions
    - [x] [US-009](stories/US-009-User-Identification.md): Allow the user to edit the name
    - [x] [US-009](stories/US-009-User-Identification.md): Visualize the user votes for arguments with chips
    - [x] [US-009](stories/US-009-User-Identification.md): Visualize the user votes for final decision with chips 

## v1.4 End-to-End Encryption
    - [x] [US-020](stories/US-020-E2E-Encryption.md): End-to-End Encryption

## v1.5 User Authentication and Anonymous User Enhancements
    - [x] [US-021](stories/US-021-Anonymous-Identity.md): Anonymous Identity & One Vote Limit
    - [x] [US-022](stories/US-022-Magic-Link.md): Magic Link Identity Transfer
    - [x] [US-010](stories/US-010-Auth-Integration.md): Integrate Firebase Authentication to enable User Authentication
    - [x] [US-023](stories/US-023-User-Login.md): User Login & Registration (OAuth + Email/Pass)
    - [x] [US-024](stories/US-024-User-Profile.md): User Profile & Self Service (Delete Account)
    - [x] [US-025](stories/US-025-My-Decisions.md): My Decisions List

## v1.6 Participants and Notifications
    - [ ] [US-026](stories/US-026-Participant-List.md): Participant List Sidebar
    - [ ] [US-027](stories/US-027-Notifications.md): Decision Notifications (Push)

## v1.7 Private Decisions
    - [ ] [US-012](stories/US-012-Private-Decisions.md): Private Decisions (Choose open/private, participant list)
    - [ ] [US-012](stories/US-012-Private-Decisions.md): Create a list of participants for private decisions
    - [ ] [US-014](stories/US-014-Restrict-Closing.md): Restrict the closing of decisions to the owner

## v1.8 Production Readiness and Compliance
    - [ ] [US-017](stories/US-017-Custom-Domain.md): Add a productive domain address
    - [ ] [US-016](stories/US-016-Legal-Pages.md): Legal Pages (Impress, Terms, Privacy Policy)
    - [ ] [US-016](stories/US-016-Legal-Pages.md): Add data privacy statement
    - [ ] [US-016](stories/US-016-Legal-Pages.md): Add terms of service
    - [ ] [US-016](stories/US-016-Legal-Pages.md): Add privacy policy
    - [ ] [US-018](stories/US-018-GDPR-Compliance.md): GDPR Compliant use of cookies
    - [ ] [US-018](stories/US-018-GDPR-Compliance.md): GDPR Compliant use of google services

## v1.9 Security
    - [ ] [US-019](stories/US-019-Security-Audit.md): Do a security audit
    - [ ] [US-019](stories/US-019-Security-Audit.md): Audit user data access
    - [ ] [US-019](stories/US-019-Security-Audit.md): Audit data access for private decisions
    - [ ] [US-019](stories/US-019-Security-Audit.md): Audit data access for open decisions
    - [ ] [US-019](stories/US-019-Security-Audit.md): Check development setup

## v2.0: Multi-Option Decisions (Future)
- **Goal**: Support complex decisions with multiple choices (not just Yes/No).
- **Features**:
    - [ ] Add multiple options (e.g., "Pizza" vs "Sushi" vs "Burgers").
    - [ ] Ranked choice voting.
