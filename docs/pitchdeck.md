---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #f8f9fa
---

# Decide-O-Mat
## Collaborative Decision Making, Simplified.

---

## The Problem

- **Scheduling is solved.** We have tools like Doodle for finding a time.
- **But how do we decide *what* to do?** 
- Group chats get messy.
- Polls are too rigid and don't allow nuances.
- Important team decisions lack clear documentation and structure.

---

## The Solution

**Decide-O-Mat** is a minimalist, highly scalable web application designed to facilitate collaborative decision-making through a pro/con list mechanism.

- **No login required** for basic use.
- **Simple capability URLs** for instant sharing.
- **Democratic** voting and argument gathering.

---

## Key Features (Core)

- **Instant Creation:** Enter a question ("Where should we go for lunch?") and get a shareable link instantly.
- **Pros & Cons:** Participants add arguments for and against the decision.
- **Voting Mechanism:** Upvote/downvote arguments, and cast a final Yes/No/Abstain vote.
- **Real-time Consensus:** See the winning side and net scores immediately.

---

## Advanced Capabilities (GenG Compliance)

Decide-O-Mat scales from casual lunch polls to formal, legally binding resolutions (v2.0).

- **Granular Settings:** Open vs. Closed participation, Secret Voting, varying Majorities & Quorums.
- **Formal Protocols:** Automated generation of PDF protocols (Niederschrift) with canonical hashes.
- **Signatures:** Advanced Electronic Signatures (AES) built-in, Qualified (QES) optional.
- **Audit Trails:** Append-only, hash-chained logs for maximum integrity.

---

## Future Evolution (Roadmap)

Decide-O-Mat is continuously evolving. Our mid-term roadmap focuses on compliance, data sovereignty, and flexibility:

**v3.0: GenG Compliance (Formal Resolutions)**
- Legal certainty for cooperatives (Genossenschaften) and associations.
- Granular settings: Secret voting, write-once votes, quorums.
- Automated, cryptographically hashed PDF protocols.
- Advanced and Qualified Electronic Signatures (QES).

**v4.0: Stackit Fork (Data Sovereignty)**
- A dedicated branch fully hosted on European Sovereign Cloud (Stackit).
- Complete alternative to the default Google Cloud Firebase backend.
- Meeting the highest data privacy requirements for public sector and enterprise clients.
- We will offer both variants (Global Cloud vs. Sovereign Cloud) to fit different organizational needs.

---

## Target Audience

Built for **Scalability**, **Cost-Efficiency**, and **Speed**.

- **Frontend:** React SPA (Vite), highly responsive, optimistic UI updates.
- **Backend:** Google Cloud Functions (Node.js 20, 2nd Gen) - Scales to zero.
- **Database:** Cloud Firestore (NoSQL real-time document store).
- **Hosting:** Firebase App Hosting (Prod/Staging environments).

---

## Security & Privacy First

- **End-to-End Encryption (E2EE):** Sensitive decision data is encrypted before leaving the browser.
- **Anonymous Identity:** Participate securely without creating a persistent account.
- **Immutable Ledger:** Formal votes and audit trails are write-once and cryptographically hashed.
- **Capability URLs:** Access control through secure, unguessable links.

---

# Thank You

**Decide-O-Mat**  
*Making group decisions fast, fair, and documented.*
