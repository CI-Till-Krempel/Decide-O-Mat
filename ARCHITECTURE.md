# Architecture: Decide-O-Mat

## 1. Overview
Decide-O-Mat is a serverless, single-page web application designed for high scalability and minimal operational cost. It leverages Google Cloud Platform (GCP) services to ensure the application scales to zero when not in use and handles high traffic spikes automatically.

## 2. System Design

### 2.1. High-Level Architecture
The system follows a standard 3-tier serverless architecture:
1.  **Client**: A Single Page Application (SPA) running in the user's browser.
2.  **API Layer**: Stateless Cloud Functions serving as the backend API.
3.  **Data Layer**: A managed NoSQL database for persistence and real-time updates.

```mermaid
graph LR
    Client[Client (Browser)]
    CDN[CDN / Hosting]
    API[Cloud Functions]
    DB[(Firestore)]

    Client -- Loads Assets --> CDN
    Client -- API Calls (HTTPS) --> API
    API -- Read/Write --> DB
    Client -- Real-time Listeners --> DB
```

### 2.2. Data Flow
1.  **Read**: The client subscribes directly to Firestore documents for real-time updates (Optimistic UI).
2.  **Write**: Critical writes (creating decisions, voting) are routed through Cloud Functions to ensure business logic validation and data integrity before hitting the database.

## 3. Technology Choices & Rationale

### 3.1. Frontend
- **Technology**: React (built with Vite)
- **Rationale**:
    - **React**: Component-based architecture suitable for interactive UIs ("doodle-like").
    - **Vite**: Fast build tool and development server.
    - **Hosting**: Firebase Hosting (or GCS Bucket behind Cloud CDN) for global low-latency delivery.

### 3.2. Backend
- **Technology**: Google Cloud Functions (2nd Gen)
- **Runtime**: Node.js
- **Rationale**:
    - **Scale to Zero**: No cost when idle, perfect for sporadic usage patterns.
    - **Scalability**: Automatically handles concurrent requests.
    - **Node.js**: Shared language (JavaScript/TypeScript) with frontend, simplifying development.

### 3.3. Database
- **Technology**: Google Cloud Firestore
- **Rationale**:
    - **Real-time**: Built-in support for real-time listeners, essential for the collaborative aspect.
    - **Scalability**: Horizontal scaling for massive read/write loads.
    - **Flexible Schema**: NoSQL nature allows easy iteration on data models (e.g., adding new argument types).

## 4. Data Model (Schema Design)

### 4.1. Collection: `decisions`
Stores the core decision metadata.
- `id` (string): Unique UUID.
- `question` (string): The decision topic.
- `createdAt` (timestamp): Creation time.
- `ownerId` (string): (Optional) Fingerprint/ID of creator for basic permissions.

### 4.2. Sub-collection: `decisions/{decisionId}/arguments`
Stores pros and cons.
- `id` (string): Unique ID.
- `type` (string): "pro" or "con".
- `text` (string): The argument content.
- `votes` (number): Current vote count.
- `createdAt` (timestamp): Creation time.

## 5. Non-Functional Requirements (NFRs)

### 5.1. Scalability
- **Horizontal Scaling**: The system must handle 1000+ concurrent users on a single decision without degradation.
- **Database Limits**: Firestore has a write limit of ~1 write/sec per document. To bypass this for voting, we will use **Distributed Counters** (sharding counters) if high-concurrency voting becomes a bottleneck.

### 5.2. Performance
- **Cold Starts**: Cloud Functions can have cold starts. We will use `min-instances: 0` to save costs but optimize code size to keep cold starts under 2s.
- **Latency**: Global CDN for static assets to ensure <1s Time to Interactive (TTI).

### 5.3. Security
- **Capability URLs**: Access is granted by possession of the URL. IDs must be sufficiently long and random (UUIDv4) to prevent enumeration.
- **Validation**: All inputs (text, vote values) must be validated in the Cloud Function to prevent injection or data corruption.
- **CORS**: Strict CORS policies to allow requests only from the application domain.

### 5.4. Cost Efficiency
- **Free Tier**: The architecture should fit within the GCP Free Tier for low-to-moderate usage.
- **Optimization**: Use Firestore caching and limit snapshot listeners to active windows to minimize read costs.
