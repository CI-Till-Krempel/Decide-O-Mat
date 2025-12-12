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
    - [x] Real-time updates (WebSocket/Subscription).
    - [x] "Close" decision functionality (prevent new votes).
    - [x] Export results as image.

## v1.2: Take decision
    - [x] Users should be able to vote for the final decision (yes / no)
    - [x] The final decision should be displayed, not only the Net Score

## v1.3: Make open decisions non-anonymous
    - [x] Ask the user for his name when accessing a decision
    - [x] Persist the user name for future decisions
    - [x] Allow the user to edit the name
    - [x] Visualize the user votes for arguments with chips
    - [x] Visualize the user votes for final decision with chips 

## v1.4 End-to-End Encryption
    - [x] End-to-End Encryption (US-020)

## v1.4.5 Anonymous User Enhancements
    - [x] Anonymous Identity & One Vote Limit (US-021)
    - [x] Magic Link Identity Transfer (US-022)

## v1.5 User Authentication
    - [x] Integrate Firebase Authentication to enable User Authentication
    - [ ] Add minimal user registration
    - [ ] Add login via OAuth
    - [ ] Add logout
    - [ ] Add possibility to inform users on updates on decisions
    - [ ] Add a simple user self service
    - [ ] Add a list of my decisions (both open and private)

## v1.6 Private Decisions
    - [ ] When creating a decision, let the user choose wether it is open or private
    - [ ] Create a list of participants for private decisions
    - [ ] Restrict the closing of decisions to the owner

## v1.7 Production Readiness and Compliance
    - [ ] Add a productive domain address
    - [ ] Add impress for legal requirements
    - [ ] Add data privacy statement
    - [ ] Add terms of service
    - [ ] Add privacy policy
    - [ ] GDPR Compliant use of cookies
    - [ ] GDPR Compliant use of google services

## v1.8 Security
    - [ ] Do a security audit
    - [ ] Audit user data access
    - [ ] Audit data access for private decisions
    - [ ] Audit data access for open decisions
    - [ ] Check development setup

## v2.0: Multi-Option Decisions (Future)
- **Goal**: Support complex decisions with multiple choices (not just Yes/No).
- **Features**:
    - [ ] Add multiple options (e.g., "Pizza" vs "Sushi" vs "Burgers").
    - [ ] Ranked choice voting.
