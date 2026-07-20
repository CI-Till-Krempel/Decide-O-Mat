# Decide-O-Mat: Migration von Google Cloud zu StackIt — Requirements & Story Plan

## 1. Zielsetzung

Erstellung eines **Forks** des Decide-O-Mat Repositorys, bei dem die gesamte Google Cloud / Firebase-Infrastruktur durch eine **selbst gehostete Architektur auf StackIt** (Schwarz IT Sovereign Cloud) ersetzt wird.

**Motivation:**
- EU-souveräne Datenhaltung (DSGVO, kein US CLOUD Act)
- Unabhängigkeit von Google-Diensten
- Volle Kontrolle über Infrastruktur und Betrieb
- BSI C5 / ISO 27001 Zertifizierung der Plattform

**Grundsatz:** Die Anwendungslogik und das UI bleiben funktional identisch. Nur die Infrastrukturschicht wird ausgetauscht.

---

## 2. Ist-Zustand: Firebase/GCP-Abhängigkeiten

### 2.1 Dienste-Inventar

| # | Firebase/GCP-Dienst | Nutzung in Decide-O-Mat | Kritikalität |
|---|---------------------|------------------------|-------------|
| 1 | **Cloud Firestore** | Dokumentendatenbank mit Echtzeit-Subscriptions (`onSnapshot`), Security Rules, Composite Indexes | Kern |
| 2 | **Firebase Authentication** | Anonym, Google OAuth, Email/Password, Magic Links (Custom Tokens), Account Linking | Kern |
| 3 | **Cloud Functions v2** | 11 Callable Functions + 2 Firestore Triggers (Node.js 20) | Kern |
| 4 | **Firebase Cloud Messaging** | Web Push Notifications an Teilnehmer (Service Worker, `sendEachForMulticast`) | Kern |
| 5 | **Firebase App Check** | Bot-Schutz via ReCaptcha Enterprise + Custom Provider (Dev) | Optional |
| 6 | **Firebase Hosting / App Hosting** | SPA-Hosting mit CDN, Rewrites, Staging/Production Environments | Kern |
| 7 | **ReCaptcha Enterprise** | Token-Validierung für App Check | Optional |

### 2.2 Betroffene Dateien

**Frontend (17 Dateien mit Firebase-Abhängigkeit):**

| Datei | Firebase-Abhängigkeit |
|-------|----------------------|
| `frontend/package.json` | `firebase`, `firebase-functions` Packages |
| `frontend/src/services/firebase.js` | Firebase SDK Init, Firestore, Functions, Auth, App Check — **zentraler Integrationspunkt** |
| `frontend/src/services/NotificationService.js` | FCM: `getMessaging()`, `getToken()`, `onMessage()` |
| `frontend/src/services/EncryptionService.js` | Kein direkter Firebase-Import, aber nutzt firebase.js indirekt |
| `frontend/src/contexts/UserContext.jsx` | Firebase Auth: 7 Auth-Methoden, `onAuthStateChanged`, Account Linking |
| `frontend/src/pages/Decision.jsx` | `onSnapshot`-Subscriptions, `httpsCallable`-Aufrufe |
| `frontend/src/pages/MyDecisions.jsx` | Firestore Queries (`where`, `orderBy`) |
| `frontend/src/components/*.jsx` | Indirekte Nutzung via firebase.js Imports |
| `frontend/vite.config.js` | `VITE_FIREBASE_PROJECT_ID` für Environment-Erkennung |
| `frontend/scripts/generate-sw.js` | Firebase-Config-Injection in Service Worker |
| `frontend/public/firebase-messaging-sw.template.js` | Firebase Messaging SDK im Service Worker |
| `frontend/.env` / `.env.local` | 8 Firebase-Umgebungsvariablen |

**Backend (3 Dateien):**

| Datei | Firebase-Abhängigkeit |
|-------|----------------------|
| `functions/package.json` | `firebase-admin`, `firebase-functions` |
| `functions/index.js` | 11 `onCall` Functions, 2 `onDocumentCreated/Updated` Triggers, Firestore Admin SDK |
| `functions/deleteUser.js` | Firebase Admin Auth + Firestore für User-Löschung |
| `functions/config.js` | `enforceAppCheck` Flag |

**Konfiguration (7 Dateien):**

| Datei | Inhalt |
|-------|--------|
| `firebase.json` | Firestore Rules/Indexes, Functions, Hosting, Emulators |
| `.firebaserc` | Projekt-Mapping (Staging/Production) |
| `firestore.rules` | Firestore Security Rules |
| `firestore.indexes.json` | Composite Indexes |
| `apphosting.yaml` | App Hosting Config + Secrets |
| `apphosting.staging.yaml` | Staging Overrides |
| `apphosting.prod.yaml` | Production Overrides |

**CI/CD (2 Workflows):**

| Datei | Firebase-Abhängigkeit |
|-------|----------------------|
| `.github/workflows/deploy.yml` | `firebase deploy`, `firebase apphosting:rollouts:create`, `google-github-actions/auth` |
| `.github/workflows/pr-checks.yml` | Nur Lint/Test (keine Firebase-Abhängigkeit) |

### 2.3 Cloud Functions — vollständige Liste

| Function | Typ | Beschreibung |
|----------|-----|-------------|
| `createDecision` | Callable | Decision-Dokument erstellen |
| `addArgument` | Callable | Pro/Con-Argument hinzufügen |
| `voteArgument` | Callable | Argument-Vote (Transaktion) |
| `voteDecision` | Callable | Ja/Nein-Vote (Transaktion) |
| `toggleDecisionStatus` | Callable | Decision öffnen/schließen |
| `updateUserDisplayName` | Callable | Anzeigename aktualisieren |
| `registerParticipant` | Callable | Teilnehmer registrieren |
| `generateMagicLink` | Callable | Custom Token für Identity Transfer |
| `updateDecisionQuestion` | Callable | Frage bearbeiten (Owner) |
| `deleteDecision` | Callable | Kaskadierendes Löschen |
| `deleteUser` | Callable | Account löschen + Anonymisierung |
| `onArgumentCreate` | Trigger | FCM-Notification bei neuem Argument |
| `onDecisionStatusChange` | Trigger | FCM-Notification bei Statusänderung |

---

## 3. Soll-Zustand: Zielarchitektur auf StackIt

### 3.1 Service-Mapping

| Firebase/GCP | StackIt-Ersatz | Typ | Begründung |
|-------------|---------------|-----|------------|
| **Cloud Firestore** | **StackIt PostgreSQL Flex** + Echtzeit via WebSockets | Native DB + Self-hosted Layer | PostgreSQL ist etablierter, bietet JSONB für flexible Schemas. Echtzeit-Updates via WebSocket-Server (Socket.io) auf Cloud Foundry. |
| **Firebase Auth** | **Keycloak** auf StackIt SKE | Self-hosted auf nativer Infra | StackIt hat dokumentierte Keycloak-Referenzarchitektur auf SKE. Unterstützt OIDC, OAuth2, anonyme Sessions, Custom Tokens. |
| **Cloud Functions** | **Node.js API** auf **StackIt Cloud Foundry** | Native PaaS | Cloud Foundry ist PaaS (push code, get URL) — niedrigste Migrations-Friction. Kein FaaS bei StackIt, daher Express/Fastify API. |
| **Firestore Triggers** | **Event-Handler** in API + **StackIt RabbitMQ** | Native Queue | Triggers werden zu internen Events. RabbitMQ für asynchrone Verarbeitung (Notifications etc.). |
| **Firebase Hosting** | **StackIt Object Storage** (Static Site) + **StackIt CDN** | Native | S3-kompatibles Object Storage mit Static-Site-Hosting + CDN für globale Verteilung. |
| **FCM** | **Web Push API** (`web-push` npm) + **StackIt RabbitMQ** | Hybrid | Standard Web Push Protocol (RFC 8030). RabbitMQ für Fan-out an Teilnehmer. |
| **App Check** | **Rate Limiting** + **reCAPTCHA v3** | Self-hosted | Express-Middleware (`express-rate-limit`) + optionale CAPTCHA-Integration. |
| **ReCaptcha Enterprise** | **reCAPTCHA v3** (Google) oder **hCaptcha** | Extern | Schlanker Ersatz; hCaptcha als EU-freundliche Alternative. |

### 3.2 Architekturdiagramm

```
┌────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                          │
│  React SPA (Vite) · CSS Modules · react-i18next (en/de)       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│  │ AuthContext   │  │ Encryption   │  │ Notification     │     │
│  │ (Keycloak)   │  │ Service      │  │ Service (WebPush)│     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘     │
│  ┌──────┴─────────────────┴──────────────────┴──────────┐      │
│  │              api.js (HTTP Client Layer)               │      │
│  │  fetch/axios  ·  WebSocket (Socket.io-client)         │      │
│  └──────────────────────┬───────────────────────────────┘      │
└─────────────────────────┼──────────────────────────────────────┘
                          │ HTTPS + WSS
┌─────────────────────────┼──────────────────────────────────────┐
│                    STACKIT CLOUD                               │
│                                                                │
│  ┌──────────────────────▼──────────────────────────────┐       │
│  │       Cloud Foundry (Node.js API + WebSocket)       │       │
│  │  Express/Fastify · REST Endpoints · Socket.io       │       │
│  │  Replaces: Cloud Functions (11 callable + 2 trigger)│       │
│  └───────┬──────────────┬──────────────┬───────────────┘       │
│          │              │              │                        │
│  ┌───────▼────┐  ┌──────▼──────┐  ┌───▼──────────────┐        │
│  │ PostgreSQL │  │  RabbitMQ   │  │  Object Storage  │        │
│  │ Flex       │  │  (Events)   │  │  (PDFs, Assets)  │        │
│  └────────────┘  └─────────────┘  └──────────────────┘        │
│                                                                │
│  ┌────────────────┐  ┌──────────────┐  ┌───────────────┐      │
│  │ SKE (K8s)      │  │ Redis        │  │ Secrets Mgr   │      │
│  │ └─ Keycloak    │  │ (Sessions)   │  │ (API Keys)    │      │
│  └────────────────┘  └──────────────┘  └───────────────┘      │
│                                                                │
│  StackIt CDN · DNS · ALB · Observability · LogMe               │
└────────────────────────────────────────────────────────────────┘
```

### 3.3 Datenbankschema-Strategie

Firestore (Dokument-DB) → PostgreSQL (Relational) erfordert eine Schema-Transformation:

| Firestore Collection | PostgreSQL Tabelle(n) | Anpassung |
|---------------------|----------------------|-----------|
| `decisions/{id}` | `decisions` | Flache Spalten + JSONB für flexible Felder (`settings`) |
| `decisions/{id}/arguments/{id}` | `arguments` (FK → decisions) | Klassische 1:N Relation |
| `arguments/{id}/votes/{userId}` | `argument_votes` (FK → arguments) | Klassische 1:N Relation |
| `decisions/{id}/finalVotes/{userId}` | `final_votes` (FK → decisions) | Klassische 1:N Relation |
| `decisions/{id}/participants/{userId}` | `participants` (FK → decisions) | Klassische 1:N Relation |

**Echtzeit-Updates:** PostgreSQL `LISTEN/NOTIFY` für DB-Events → WebSocket-Server pushed an Clients.

---

## 4. Migrations-Entscheidungen

### 4.1 Offene Architekturentscheidungen

| # | Entscheidung | Option A | Option B | Empfehlung |
|---|-------------|----------|----------|------------|
| E1 | **Datenbank** | PostgreSQL Flex (relational) | MongoDB Flex (document) | **PostgreSQL** — etablierter, besseres Tooling, LISTEN/NOTIFY für Echtzeit |
| E2 | **API Runtime** | Cloud Foundry (PaaS) | SKE Kubernetes (Container) | **Cloud Foundry** — niedrigere Ops-Komplexität, näher am Serverless-Modell |
| E3 | **Auth Provider** | Keycloak (self-hosted auf SKE) | Zitadel (self-hosted) | **Keycloak** — StackIt Referenzarchitektur vorhanden, breite Community |
| E4 | **Echtzeit-Transport** | Socket.io (WebSocket) | Server-Sent Events (SSE) | **Socket.io** — bidirektional, etabliertes Reconnection-Handling |
| E5 | **ORM / Query Builder** | Prisma | Drizzle | Abhängig von Team-Präferenz |
| E6 | **Notification Push** | Web Push API (standard) | Polling | **Web Push** — Standard-Protokoll, kein Vendor Lock-in |
| E7 | **Bot-Schutz** | reCAPTCHA v3 (Google) | hCaptcha (EU) | **hCaptcha** falls EU-Souveränität priorisiert, sonst reCAPTCHA v3 |

### 4.2 Nicht-migrierte Features

| Feature | Grund | Alternative |
|---------|-------|------------|
| Firebase Emulator Suite | Kein StackIt-Äquivalent | Docker Compose für lokale Entwicklung (PostgreSQL, Keycloak, RabbitMQ) |
| Firebase App Check (Debug Token) | Firebase-spezifisch | Entfällt; API-Rate-Limiting + Auth-Token reichen |
| `signInAnonymously()` | Firebase-spezifisch | Keycloak Guest/Anonymous Session oder eigenes Session-Token |
| `linkWithPopup()` (Account Upgrade) | Firebase-spezifisch | Keycloak Account Linking via OIDC Flows |

---

## 5. Story Plan

### Epic 1: Repository Fork & Projekt-Setup

> **US-M01: Repository forken und Projektstruktur anpassen**
> Fork erstellen, Firebase-spezifische Konfigurationsdateien entfernen, neue Projektstruktur für API-Server anlegen, Monorepo-Tooling konfigurieren.

> **US-M02: Docker Compose für lokale Entwicklung aufsetzen**
> Docker Compose mit PostgreSQL, Keycloak, RabbitMQ und Redis für lokale Entwicklung. Ersetzt Firebase Emulator Suite.

> **US-M03: StackIt Infrastruktur-als-Code aufsetzen (Terraform)**
> Terraform-Projekt mit StackIt Provider: PostgreSQL Flex, Cloud Foundry Space, SKE Cluster (Keycloak), RabbitMQ, Redis, Object Storage, DNS, Secrets Manager.

### Epic 2: Datenbank-Migration (Firestore → PostgreSQL)

> **US-M04: PostgreSQL-Datenbankschema entwerfen und migrieren**
> Relationales Schema für decisions, arguments, argument_votes, final_votes, participants. Migrationsscript von Firestore-Export nach PostgreSQL.

> **US-M05: ORM / Data Access Layer implementieren**
> Prisma (oder Drizzle) Schema + Client. Repository-Pattern als Abstraktionsschicht über DB-Zugriffe.

> **US-M06: Echtzeit-Update-Mechanismus implementieren (WebSocket)**
> Socket.io-Server auf Cloud Foundry. PostgreSQL LISTEN/NOTIFY → WebSocket Push. Client-Library für Reconnection und Subscription-Management.

### Epic 3: Authentifizierung (Firebase Auth → Keycloak)

> **US-M07: Keycloak-Instanz auf StackIt SKE deployen und konfigurieren**
> Keycloak auf SKE mit Realm-Konfiguration, Client-Registrierung, Identity Providers (Google OAuth, Email/Password). Ersetzt Firebase Auth Backend.

> **US-M08: Frontend Auth-Layer von Firebase Auth auf Keycloak/OIDC umstellen**
> `UserContext.jsx` refactoren: `keycloak-js` oder `oidc-client-ts` statt Firebase Auth SDK. Login, Logout, Token Refresh, Account Linking.

> **US-M09: Anonyme Authentifizierung und Magic Links migrieren**
> Keycloak Guest-Session oder eigenes Token-System für anonyme User. Magic Link Flow über eigenen Endpoint statt Firebase Custom Tokens.

### Epic 4: API-Server (Cloud Functions → Express/Fastify)

> **US-M10: Express/Fastify API-Server aufsetzen (Cloud Foundry)**
> Node.js API-Projekt mit Express oder Fastify. Middleware: Auth (Keycloak Token Validation), Rate Limiting, CORS, Error Handling. Deployment auf StackIt Cloud Foundry.

> **US-M11: Callable Functions als REST-Endpoints migrieren**
> Alle 11 `httpsCallable` Functions als REST-Endpoints implementieren: createDecision, addArgument, voteArgument, voteDecision, toggleDecisionStatus, updateUserDisplayName, registerParticipant, generateMagicLink, updateDecisionQuestion, deleteDecision, deleteUser.

> **US-M12: Firestore Triggers als Event-Handler migrieren**
> `onArgumentCreate` und `onDecisionStatusChange` Triggers als interne Events. RabbitMQ-Consumer für asynchrone Verarbeitung (Notification-Versand).

> **US-M13: Firestore Security Rules als API-Middleware migrieren**
> Autorisierungslogik aus `firestore.rules` in API-Middleware übersetzen. Owner-Checks, Participant-Checks, Write-Restrictions.

### Epic 5: Frontend SDK-Layer (Firebase SDK → HTTP/WS Client)

> **US-M14: Firebase SDK durch HTTP-Client-Layer ersetzen**
> `frontend/src/services/firebase.js` ersetzen durch `api.js`: REST-Calls (fetch/axios) an neuen API-Server. Alle `httpsCallable`-Aufrufe durch `fetch`-Calls ersetzen.

> **US-M15: Firestore onSnapshot durch WebSocket-Subscriptions ersetzen**
> Socket.io-Client integrieren. Alle `onSnapshot`-Listener in Decision.jsx und MyDecisions.jsx durch WebSocket-Subscription-Events ersetzen.

> **US-M16: Firebase-Konfiguration und Umgebungsvariablen umstellen**
> `VITE_FIREBASE_*` Variablen durch `VITE_API_URL`, `VITE_WS_URL`, `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM` ersetzen. `vite.config.js` anpassen.

### Epic 6: Notifications (FCM → Web Push)

> **US-M17: Web Push Service implementieren (Server)**
> `web-push` npm Library im API-Server. VAPID-Keys generieren. Push-Subscriptions in DB speichern. RabbitMQ-Consumer für Fan-out.

> **US-M18: Notification Service im Frontend auf Web Push API umstellen**
> `NotificationService.js` refactoren: Standard Push API statt FCM. Service Worker ohne Firebase SDK. Subscription-Management.

### Epic 7: Hosting & Deployment

> **US-M19: Frontend-Hosting auf StackIt Object Storage + CDN einrichten**
> Vite-Build auf S3-kompatibles Object Storage deployen. StackIt CDN konfigurieren. SPA-Routing via ALB (Rewrite Rules).

> **US-M20: CI/CD Pipeline für StackIt anpassen**
> GitHub Actions Workflows umschreiben: Firebase CLI → StackIt CLI / Terraform Apply / Cloud Foundry Push. Staging + Production Environments. Secrets-Management via StackIt Secrets Manager.

> **US-M21: Monitoring und Logging einrichten**
> StackIt Observability (Grafana) für Metriken. StackIt LogMe für zentrales Logging. Health Checks und Alerting für API, DB, Keycloak.

### Epic 8: Bot-Schutz & Sicherheit

> **US-M22: App Check durch Rate Limiting und CAPTCHA ersetzen**
> `express-rate-limit` Middleware auf API-Server. Optionale hCaptcha/reCAPTCHA-Integration auf Frontend-Formularen. Firebase App Check komplett entfernen.

> **US-M23: Firestore Security Rules in serverseitige Autorisierung übersetzen**
> Bestehende Rule-Logik (read: public, write: only via functions, participants: own doc only) als Express-Middleware / Guards implementieren. Tests schreiben.

### Epic 9: Tests & Qualitätssicherung

> **US-M24: Test-Infrastruktur anpassen**
> Firebase Emulator-basierte Tests ersetzen: Testcontainers für PostgreSQL, Keycloak, RabbitMQ. Mock-Layer für WebSocket. Vitest-Konfiguration anpassen.

> **US-M25: E2E-Tests auf neue Infrastruktur portieren**
> Playwright-Tests anpassen: Login via Keycloak statt Firebase Auth. API-Calls statt Firebase SDK. Docker Compose als Test-Backend.

> **US-M26: Datenmigrations-Tool und Smoke Tests**
> Script für einmaligen Datenexport aus Firestore und Import in PostgreSQL. Smoke Test Suite für alle migrierten Endpoints. Vergleichstests: Firebase vs. StackIt Ergebnisse.

### Epic 10: Dokumentation & Cleanup

> **US-M27: Architektur- und Betriebsdokumentation aktualisieren**
> ARCHITECTURE.md, README.md, RELEASE.md für StackIt-Infrastruktur aktualisieren. Runbook für Keycloak, PostgreSQL, Cloud Foundry Ops.

> **US-M28: Firebase-Abhängigkeiten vollständig entfernen**
> Alle Firebase-Packages deinstallieren. Verbleibende Firebase-Referenzen in Code, Config, Docs suchen und entfernen. `firebase.json`, `.firebaserc`, `apphosting.yaml` löschen. Clean Build verifizieren.

---

## 6. Story-Übersicht (sortiert nach Implementierungsreihenfolge)

| # | Story | Epic | Abhängigkeiten | Aufwand |
|---|-------|------|----------------|---------|
| US-M01 | Repository forken und Projektstruktur anpassen | 1 | — | S |
| US-M02 | Docker Compose für lokale Entwicklung | 1 | — | M |
| US-M03 | StackIt Terraform Infrastruktur | 1 | — | L |
| US-M04 | PostgreSQL-Schema entwerfen und migrieren | 2 | US-M02 | L |
| US-M05 | ORM / Data Access Layer | 2 | US-M04 | M |
| US-M07 | Keycloak auf StackIt SKE deployen | 3 | US-M03 | L |
| US-M10 | API-Server aufsetzen (Cloud Foundry) | 4 | US-M03, US-M05 | M |
| US-M13 | Security Rules als API-Middleware | 8 | US-M10 | M |
| US-M11 | Callable Functions als REST-Endpoints | 4 | US-M10, US-M05, US-M13 | XL |
| US-M06 | Echtzeit-Updates via WebSocket | 2 | US-M10, US-M04 | L |
| US-M08 | Frontend Auth auf Keycloak umstellen | 3 | US-M07 | L |
| US-M09 | Anonyme Auth und Magic Links | 3 | US-M08 | M |
| US-M14 | Firebase SDK durch HTTP-Client ersetzen | 5 | US-M11 | L |
| US-M15 | onSnapshot durch WebSocket ersetzen | 5 | US-M06, US-M14 | L |
| US-M16 | Umgebungsvariablen umstellen | 5 | US-M14 | S |
| US-M12 | Firestore Triggers als Event-Handler | 4 | US-M10, US-M17 | M |
| US-M17 | Web Push Service (Server) | 6 | US-M10, US-M12 | M |
| US-M18 | Notification Service auf Web Push | 6 | US-M17 | M |
| US-M22 | Rate Limiting und CAPTCHA | 8 | US-M10 | S |
| US-M19 | Frontend-Hosting auf Object Storage + CDN | 7 | US-M03 | M |
| US-M20 | CI/CD Pipeline für StackIt | 7 | US-M19, US-M10 | L |
| US-M21 | Monitoring und Logging | 7 | US-M03, US-M10 | M |
| US-M23 | Security Rules als serverseitige Autorisierung | 8 | US-M11 | M |
| US-M24 | Test-Infrastruktur anpassen | 9 | US-M05, US-M10 | L |
| US-M25 | E2E-Tests portieren | 9 | US-M24, US-M15, US-M08 | L |
| US-M26 | Datenmigrations-Tool und Smoke Tests | 9 | US-M04, US-M11 | M |
| US-M27 | Dokumentation aktualisieren | 10 | US-M20 | M |
| US-M28 | Firebase-Abhängigkeiten entfernen | 10 | Alle Stories | S |

**Legende:** S = Small (1–2 Tage), M = Medium (3–5 Tage), L = Large (1–2 Wochen), XL = Extra Large (2–3 Wochen)

---

## 7. Risiken

| # | Risiko | Impact | Mitigation |
|---|--------|--------|------------|
| R1 | **Echtzeit-Latenz höher als Firestore** | Mittel | PostgreSQL LISTEN/NOTIFY + WebSocket ist architekturell anders als Firestore onSnapshot. Frühes Prototyping (US-M06) und Lasttest. |
| R2 | **Keycloak Ops-Komplexität** | Hoch | Keycloak erfordert laufende Wartung (Updates, Realm-Config, Token-Policies). Dediziertes Ops-Wissen nötig. |
| R3 | **Kein FaaS auf StackIt** | Mittel | Cloud Foundry ist PaaS, kein FaaS. Auto-Scaling und Cold Starts funktionieren anders. Kapazitätsplanung nötig. |
| R4 | **Datenmigration Firestore → PostgreSQL** | Hoch | Schema-Transformation kann Datenverlust verursachen. Migrationstool mit Vergleichstests (US-M26) absichern. |
| R5 | **Firebase Auth Features ohne Äquivalent** | Mittel | `signInAnonymously()`, `linkWithPopup()`, Magic Links — erfordern Custom-Implementierungen in Keycloak. |
| R6 | **Web Push weniger zuverlässig als FCM** | Niedrig | Standard Web Push (RFC 8030) wird von allen modernen Browsern unterstützt. Safari-Support seit iOS 16.4. |
| R7 | **E2E-Verschlüsselung mit neuem Auth-System** | Mittel | Encryption Key lebt im URL-Hash (Client-only). Kein Server-Dependency → sollte ohne Änderung funktionieren. Frühes Testing. |
| R8 | **Cloud Foundry Sunset-Risiko** | Niedrig | StackIt bietet Cloud Foundry als Managed Service. Falls deprecated: Migration auf SKE (Container) mit geringem Aufwand möglich. |

---

## 8. Voraussetzungen

- StackIt Account mit aktivierten Services: PostgreSQL Flex, Cloud Foundry, SKE, RabbitMQ, Redis, Object Storage, CDN, DNS, Secrets Manager
- Domain und SSL-Zertifikat via StackIt Domain Solutions
- GitHub Actions Runner mit Zugriff auf StackIt API (Service Account Token)
- Terraform >= 1.5 mit StackIt Provider
- Docker Desktop für lokale Entwicklung (Docker Compose)
