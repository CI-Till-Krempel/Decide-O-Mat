# Roadmap: Decide-O-Mat

## v1.0: MVP (Minimum Viable Product)
**Goal**: Enable users to create a decision, share it, and collect pros/cons with votes.

### Scope
- **Core Features**:
    - [ ] Create Decision (Question + Unique URL)
    - [ ] Share Decision (Copy Link)
    - [ ] Add Arguments (Pros & Cons)
    - [ ] Vote on Arguments (Upvote/Downvote)
    - [ ] View Results (Net Score)
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
    - Real-time updates (WebSocket/Subscription).
    - "Close" decision functionality (prevent new votes).
    - Export results as image.

## v2.0: Multi-Option Decisions (Future)
- **Goal**: Support complex decisions with multiple choices (not just Yes/No).
- **Features**:
    - Add multiple options (e.g., "Pizza" vs "Sushi" vs "Burgers").
    - Ranked choice voting.
