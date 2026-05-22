# v2.0 Konfigurierbare Beschlussdokumentation — Architektur & Implementierungsplan

## Scope-Abgrenzung

### In Scope
- **Konfigurierbare Entscheidungsparameter**: Granulare Optionen (Teilnahme, Abstimmungsmodus, Mehrheit, Quorum, Protokoll, Signatur, Audit) — frei kombinierbar statt eines monolithischen Modus-Schalters
- **Rechtssichere Beschlussdokumentation**: Protokoll (PDF) mit GenG-Pflichtinhalten, kanonischem Hash, unveränderbar nach Finalisierung
- **Rechtssichere Teilnehmer-Autorisierung**: Geschlossener Teilnehmerkreis pro Decision, Rolle Versammlungsleiter, authentifizierte Identitäten
- **GenG-konforme Abstimmung**: Ja/Nein/Enthaltung (konfigurierbar), konfigurierbares Quorum, Write-once Stimmen (konfigurierbar)
- **Signatur**: Advanced Electronic Signature (Standard), QES optional
- **Audit-Trail**: Append-only Log mit Hash-Chain (konfigurierbar)
- **Integritätsnachweis**: Canonical JSON Hash (RFC 8785) + PDF Hash

### Out of Scope
- Genossenschaftsverwaltung (CRUD von Genossenschaften, Mitgliederlisten)
- Versammlungs-/Sitzungsmanagement (Lifecycle: Einladung → Eröffnung → Schließung)
- Tagesordnungsverwaltung (TOPs anlegen, sortieren, verwalten)
- Schriftführer-Rolle (Protokoll wird vom Owner/Versammlungsleiter generiert und signiert)
- Blockchain-Anker (optional nachträglich ergänzbar)

### Kernidee

Das bestehende **Decision-Modell** wird um **granulare Konfigurationsoptionen** erweitert. Statt eines binären Modus-Schalters (`"informal"` vs. `"resolution"`) kann jede Decision über einzelne Parameter konfiguriert werden:

| Parameter | Default (= Bestandsverhalten) | Formale Option |
|-----------|-------------------------------|----------------|
| Teilnahme | `open` — jeder mit URL | `closed` — nur eingeladene User |
| Abstimmung | `open` — namentlich | `secret` — geheime Wahl |
| Stimmabgabe | änderbar (Toggle) | `immutable` — write-once |
| Stimm-Optionen | Ja / Nein | Ja / Nein / Enthaltung |
| Mehrheit | Einfach | Absolut, 2/3, 3/4 |
| Quorum | Keins | Bezogen auf Anwesende oder Gesamtzahl |
| Protokoll | Deaktiviert | PDF mit Pflichtinhalten + Hashes |
| Signatur | Keine | Advanced / QES |
| Audit-Trail | Deaktiviert | Append-only Hash-Chain |

Eine Decision mit allen Defaults verhält sich **exakt wie bisher**. Durch Aktivierung einzelner Optionen wird sie schrittweise formaler — bis hin zum vollständig GenG-konformen Beschluss.

---

## 1. Ist-Analyse

### 1.1 Architekturübersicht

```
┌────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                          │
│  React SPA (Vite) · CSS Modules · react-i18next (en/de)       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│  │ UserContext   │  │ Encryption   │  │ Notification     │     │
│  │ (Auth State)  │  │ Service      │  │ Service (FCM)    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘     │
│  ┌──────┴─────────────────┴──────────────────┴──────────┐      │
│  │              firebase.js (SDK Layer)                  │      │
│  │  httpsCallable()  ·  onSnapshot()  ·  Auth SDK       │      │
│  └──────────────────────┬───────────────────────────────┘      │
└─────────────────────────┼──────────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼──────────────────────────────────────┐
│               GOOGLE CLOUD PLATFORM                            │
│  ┌──────────────────────▼──────────────────────────────┐       │
│  │         Cloud Functions 2nd Gen (Node.js 20)        │       │
│  │  createDecision · addArgument · voteArgument        │       │
│  │  voteDecision · toggleDecisionStatus · ...          │       │
│  └──────────────────────┬──────────────────────────────┘       │
│  ┌──────────────────────▼──────────────────────────────┐       │
│  │              Cloud Firestore                        │       │
│  │  decisions/{id}                                     │       │
│  │    ├── arguments/{id} → votes/{userId}              │       │
│  │    ├── finalVotes/{userId}                          │       │
│  │    └── participants/{userId}                        │       │
│  └─────────────────────────────────────────────────────┘       │
│  Firebase Auth · App Check · FCM · Hosting                     │
└────────────────────────────────────────────────────────────────┘
```

### 1.2 Bestehendes Datenmodell (relevant)

```
decisions/{decisionId}
├── question: string
├── createdAt: Timestamp
├── ownerId: string (Firebase Auth UID)
├── participantIds: string[]
├── status: "open" | "closed"
├── yesVotes: number
├── noVotes: number
├── arguments/{argumentId}
│   ├── type: "pro" | "con", text, votes, authorName, authorId
│   └── votes/{userId} — userId, displayName, createdAt
├── finalVotes/{userId} — vote: "yes"|"no", userId, displayName
└── participants/{userId} — displayName, isAnonymous, photoURL, fcmToken
```

### 1.3 Gaps für konfigurierbare Beschlussfunktionen

| Gap | Beschreibung |
|-----|-------------|
| **Nur offene Teilnahme** | Jeder mit URL kann teilnehmen; kein geschlossener Kreis |
| **Keine formalen Rollen** | Nur `ownerId`; kein Versammlungsleiter |
| **Keine Enthaltung** | Nur Ja/Nein; GenG verlangt Ja/Nein/Enthaltung |
| **Veränderbare Stimmen** | Argument-Votes sind toggle; FinalVotes änderbar |
| **Kein Quorum** | Keine Beschlussfähigkeitsprüfung |
| **Keine konfigurierbare Mehrheit** | Einfache Mehrheit hardcoded |
| **Kein Protokoll/PDF** | Keine Niederschrift-Generierung |
| **Keine Signaturen** | Kein Signaturprozess |
| **Kein Audit-Trail** | Keine manipulationssichere Protokollierung |
| **Keine Unveränderlichkeit** | Decisions nach Schließung weiter editierbar |

---

## 2. Soll-Architektur

### 2.1 Erweiterung des Decision-Modells

Bestehende Decisions erhalten ein `settings`-Objekt mit granularen Optionen. Jede Option ist unabhängig konfigurierbar:

```
decisions/{id}
├── [bestehende Felder: question, status, ownerId, ...]
│
├── [NEU] settings: {                        ← Granulare Konfiguration
│       participation, votingMethod,
│       voteImmutable, abstentionAllowed,
│       requiredMajority, quorumType,
│       protocolEnabled, signatureRequired,
│       auditTrailEnabled
│   }
│
├── [NEU] chairpersonId: string | null       ← Optionaler Versammlungsleiter
├── [NEU] allowedParticipantIds: string[]    ← Bei participation: "closed"
├── [NEU] votingPhase: string | null         ← Bei participation: "closed"
├── [NEU] result: { ... } | null             ← Berechnetes Ergebnis
│
├── [NEU] resolutionVotes/{id}               ← Write-once / geheime Stimmen
├── [bestehend] participants/{userId}
│   └── [NEU] role: "member" | "chairperson"
├── [NEU] protocol: { ... } | null           ← Protokoll-Metadaten
└── [NEU] auditLog/{entryId}                 ← Append-only
```

### 2.2 Erweiterte System-Architektur

```
CLIENT (Browser)
  ├── Bestehende Module (Home, Decision, MyDecisions, Login)
  ├── [NEU] DecisionSettings Panel (granulare Optionen)
  ├── [NEU] FormalVotingPanel (Ja/Nein/Enthaltung, Write-once)
  ├── [NEU] ProtocolViewer Page
  ├── [NEU] AuditLogViewer Component
  └── [NEU] SignaturePanel Component

CLOUD FUNCTIONS (Node.js 20)
  ├── Bestehende Funktionen (unverändert)
  ├── [NEU] updateDecisionSettings    — Granulare Optionen setzen
  ├── [NEU] manageParticipantAccess   — Einladung (bei closed)
  ├── [NEU] assignChairperson         — Versammlungsleiter zuweisen
  ├── [NEU] openFormalVoting          — Abstimmungsphase starten
  ├── [NEU] castFormalVote            — Write-once Ja/Nein/Enthaltung
  ├── [NEU] closeFormalVoting         — Ergebnis berechnen
  ├── [NEU] finalizeProtocol          — PDF + Hashes generieren
  ├── [NEU] signProtocol              — Signatur (Advanced/QES)
  └── [NEU] Services:
        ├── AuditService              — Append-only + Hash-Chain
        ├── CanonicalHashService      — RFC 8785 + SHA-256
        ├── ProtocolGenerator         — JSON → PDF (pdf-lib)
        ├── QuorumService             — Quorum + Mehrheit
        └── SignatureService          — Pluggable (none/advanced/QES)

FIREBASE STORAGE (NEU)
  └── protocols/{decisionId}/protocol.pdf
```

### 2.3 Verhaltensmatrix pro Setting

| Setting | Auswirkung auf System |
|---------|----------------------|
| `participation: "closed"` | `allowedParticipantIds` muss gesetzt sein. Nur gelistete User dürfen abstimmen. Aktiviert `votingPhase`-Lifecycle (`setup → voting → completed`). |
| `votingMethod: "secret"` | Vote-Dokumente ohne `userId`/`displayName`. Nutzt `resolutionVotes` statt `finalVotes`. |
| `voteImmutable: true` | Stimmen nicht änderbar nach Abgabe. Nutzt `resolutionVotes` statt `finalVotes`. |
| `abstentionAllowed: true` | Dritte Option "Enthaltung". Nutzt `resolutionVotes` statt `finalVotes`. |
| `requiredMajority` | Ergebnisberechnung prüft konfigurierte Mehrheit (simple/absolute/2÷3/3÷4). |
| `quorumType` | Beschlussfähigkeitsprüfung bei Schließung (present/total). |
| `protocolEnabled: true` | Nach Schließung: Protokoll-Generierung verfügbar. |
| `signatureRequired` | Nach Protokoll-Finalisierung: Signaturprozess (advanced/qes). |
| `auditTrailEnabled: true` | Alle Aktionen werden in `auditLog` Subcollection geloggt. |

**Wann wird `resolutionVotes` genutzt?**
Wenn mindestens eines der folgenden Settings aktiv ist:
- `votingMethod: "secret"`
- `voteImmutable: true`
- `abstentionAllowed: true`

Andernfalls: bestehende `finalVotes`-Subcollection (Bestandsverhalten).

**Wann wird der `votingPhase`-Lifecycle aktiviert?**
Wenn `participation: "closed"` — da Teilnehmer zuerst eingeladen werden müssen, bevor die Abstimmung beginnt. Bei `participation: "open"` können Stimmen sofort abgegeben werden (wie bisher).

---

## 3. Datenmodell & Security Rules (konkret)

### 3.1 Erweiterte Felder auf `decisions/{decisionId}`

```javascript
{
  // === Bestehende Felder (unverändert) ===
  question: string,
  createdAt: Timestamp,
  ownerId: string,
  participantIds: string[],
  status: "open" | "closed",
  yesVotes: number,
  noVotes: number,

  // === NEU: Konfigurationsoptionen ===
  settings: {
    participation: "open" | "closed",           // Default: "open"
    votingMethod: "open" | "secret",            // Default: "open"
    voteImmutable: boolean,                     // Default: false
    abstentionAllowed: boolean,                 // Default: false
    requiredMajority: "simple" | "absolute" | "two_thirds" | "three_quarters",  // Default: "simple"
    quorumType: "none" | "present" | "total",   // Default: "none"
    protocolEnabled: boolean,                   // Default: false
    signatureRequired: "none" | "advanced" | "qes",  // Default: "none"
    auditTrailEnabled: boolean,                 // Default: false
  },

  // === NEU: Optionaler Versammlungsleiter ===
  chairpersonId: string | null,                 // Firebase Auth UID; null = Owner fungiert als Leiter

  // === NEU: Geschlossener Teilnehmerkreis (nur bei participation: "closed") ===
  allowedParticipantIds: string[],              // Nur diese User dürfen abstimmen

  // === NEU: Optionale Beschluss-Metadaten ===
  resolutionTitle: string | null,               // Formaler Beschlusstitel (optional, default = question)
  resolutionText: string | null,                // Volltext des Antrags (optional)

  // === NEU: Abstimmungs-Lifecycle (nur bei participation: "closed") ===
  // Bei participation: "open" → bleibt null (bestehender status-Flow reicht)
  votingPhase: "setup" | "voting" | "completed" | null,
  votingOpenedAt: Timestamp | null,
  votingClosedAt: Timestamp | null,

  // === NEU: Berechnetes Ergebnis (serverseitig, write-once nach Berechnung) ===
  result: {
    yes: number,
    no: number,
    abstain: number,                            // 0 wenn abstentionAllowed: false
    totalEligible: number,                      // allowedParticipantIds.length oder participantIds.length
    quorumReached: boolean | null,              // null wenn quorumType: "none"
    majorityReached: boolean,
    outcome: "approved" | "rejected" | "no_quorum",
  } | null,

  // === NEU: Integritätsfeld (serverseitig, nach Protokollgenerierung) ===
  canonicalHash: string | null,                 // SHA-256(RFC 8785 JSON)

  // === NEU: Protokoll-Metadaten (nur bei protocolEnabled: true) ===
  protocol: {
    status: "draft" | "final" | "signed",
    pdfStoragePath: string | null,              // gs://bucket/protocols/{id}/protocol.pdf
    pdfHash: string | null,                     // SHA-256(PDF bytes)
    contentHash: string | null,                 // SHA-256(canonical JSON)
    finalizedAt: Timestamp | null,
    signatures: [{
      signerId: string,
      signerRole: "chairperson" | "owner",      // Wer unterschreibt
      signerName: string,
      method: "advanced" | "qes",
      signedAt: Timestamp,
      padesSignatureRef: string | null,         // Bei QES
    }],
    qualifiedTimestamp: {                        // Optional
      tspResponse: string,                      // Base64 RFC 3161
      tspProvider: string,
      issuedAt: Timestamp,
    } | null,
  } | null,
}
```

### 3.2 Neue Subcollection: `decisions/{decisionId}/resolutionVotes/{voteId}`

Wird genutzt wenn `votingMethod: "secret"` ODER `voteImmutable: true` ODER `abstentionAllowed: true`.

```javascript
// Dokument-ID: bei offener Abstimmung = oderId (≈userId); bei geheimer = random UUID
{
  oderId: string,                       // Stimm-ID (= docId)
  userId: string | null,                // null bei votingMethod: "secret"
  vote: "yes" | "no" | "abstain",      // "abstain" nur wenn abstentionAllowed: true
  castAt: Timestamp,                    // Serverseitig gesetzt
  displayName: string | null,           // null bei votingMethod: "secret"
  // WRITE-ONCE: Wenn voteImmutable: true → kein Update nach castAt
}
```

### 3.3 Erweiterte Felder auf `participants/{userId}`

```javascript
{
  // === Bestehende Felder ===
  encryptedDisplayName: string,
  plainDisplayName: string,
  isAnonymous: boolean,
  photoURL: string,
  fcmToken: string,
  updatedAt: Timestamp,

  // === NEU ===
  role: "member" | "chairperson",       // Default: "member"
  email: string | null,                 // Für Nachweisbarkeit (bei formal konfigurierten Decisions)
  invitedAt: Timestamp | null,          // Wann eingeladen (bei participation: "closed")
  attendedAt: Timestamp | null,         // Wann beigetreten
}
```

### 3.4 Neue Subcollection: `decisions/{decisionId}/auditLog/{entryId}`

Nur aktiv wenn `settings.auditTrailEnabled: true`.

```javascript
{
  timestamp: Timestamp,                 // Serverseitig
  correlationId: string,                // UUID pro Geschäftsvorfall
  actor: {
    userId: string,
    displayName: string,
    role: string,
  },
  action: string,                       // z.B. "settings.updated", "vote.cast"
  details: object,                      // Action-spezifische Daten
  // Hash-Chain
  previousEntryId: string | null,
  previousHash: string | null,
  entryHash: string,                    // SHA-256(canonicalize(this - entryHash))
}
```

### 3.5 Firestore Security Rules (Erweiterung)

```javascript
service cloud.firestore {
  match /databases/{database}/documents {

    // === BESTEHEND (unverändert) ===
    match /decisions/{decisionId} {
      allow read: if true;
      allow write: if false; // Nur via Cloud Functions

      match /finalVotes/{userId} {
        allow read: if true;
        allow write: if false;
      }
      match /arguments/{argumentId} {
        allow read: if true;
        allow write: if false;
        match /votes/{userId} {
          allow read: if true;
          allow write: if false;
        }
      }
      match /participants/{userId} {
        allow read: if true;
        allow write: if request.auth != null && request.auth.uid == userId;
      }

      // === NEU: Resolution Votes ===
      match /resolutionVotes/{voteId} {
        allow read: if true;
        allow write: if false; // NUR via Cloud Function (write-once)
      }

      // === NEU: Audit Log ===
      match /auditLog/{entryId} {
        allow read: if true;  // Transparenz: jeder Teilnehmer darf lesen
        allow write: if false; // Append-only NUR via Cloud Function
        // NIEMALS löschbar — kein delete erlaubt
      }
    }
  }
}
```

**Serverseitige Invarianten (Cloud Functions erzwingen):**
- `settings`: Nicht änderbar wenn `votingPhase: "voting"` oder `status: "closed"`
- `resolutionVotes`: Kein Update/Delete nach Insert wenn `voteImmutable: true` (Write-once)
- `result`: Kein Update nach Berechnung
- `protocol.contentHash/pdfHash`: Kein Update nach `protocol.status: "final"`
- `auditLog`: Nur Insert, kein Update, kein Delete
- Abstimmung via `castFormalVote` nur wenn: User in `allowedParticipantIds` (bei closed) UND `votingPhase: "voting"` (bei closed) oder `status: "open"` (bei open)

---

## 4. Schnittstellen & Integrationen

### 4.1 Neue Cloud Functions

| Function | Auth | Berechtigung | Beschreibung |
|----------|------|-------------|--------------|
| `updateDecisionSettings` | Required | Owner | Setzt/ändert `settings`-Felder. Nur solange `votingPhase !== "voting"` und `status !== "closed"`. |
| `inviteParticipant` | Required | Owner/Chairperson | Fügt userId zu `allowedParticipantIds` hinzu. Nur wenn `participation: "closed"`. |
| `removeParticipant` | Required | Owner/Chairperson | Entfernt userId aus `allowedParticipantIds`. Nur wenn `votingPhase !== "voting"`. |
| `assignChairperson` | Required | Owner | Setzt `chairpersonId` + Participant-Rolle auf `"chairperson"`. |
| `openFormalVoting` | Required | Owner/Chairperson | Setzt `votingPhase: "voting"`, sperrt Settings. Nur bei `participation: "closed"`. |
| `castFormalVote` | Required | Berechtigter User | Write-once Stimme: Ja/Nein/Enthaltung. Prüft alle aktiven Settings. |
| `closeFormalVoting` | Required | Owner/Chairperson | Berechnet Ergebnis (Quorum + Mehrheit), setzt `votingPhase: "completed"`. |
| `finalizeProtocol` | Required | Owner/Chairperson | Generiert PDF + Hashes, setzt `protocol.status: "final"`. Nur wenn `protocolEnabled: true`. |
| `signProtocol` | Required | Owner/Chairperson | Signiert Protokoll (Advanced oder QES). Nur wenn `signatureRequired !== "none"`. |
| `getAuditLog` | Required | Participant | Liest Audit-Einträge für eine Decision. |

### 4.2 Canonical Hashing Service

**Algorithmus: SHA-256**
- Standard für Dokumenten-Integrität, FIPS-zertifiziert
- Breite Library-Verfügbarkeit: Node.js `crypto.createHash('sha256')`

**Canonical JSON: RFC 8785 (JCS)**
- Library: `canonicalize` (npm, RFC 8785 konform)
- Deterministisch: Gleicher Input → gleicher Output, unabhängig von Feld-Reihenfolge

```javascript
const canonicalize = require('canonicalize');
const crypto = require('crypto');

function computeCanonicalHash(contentObject) {
  const canonicalJson = canonicalize(contentObject);
  const hash = crypto.createHash('sha256').update(canonicalJson).digest('hex');
  return { canonicalJson, hash };
}
```

### 4.3 Protokoll-Generator (JSON → PDF)

**Library: `pdf-lib`** (rein JavaScript, kein Chrome/Puppeteer nötig)

**Pflichtinhalte der Niederschrift (GenG §47 adaptiert):**
1. Datum und Ort/Modus der Abstimmung
2. Name des Versammlungsleiters (Chairperson oder Owner)
3. Teilnehmerliste mit Anwesenheitsstatus
4. Beschlusstext (Antrag)
5. Abstimmungsergebnis: Ja / Nein / Enthaltung
6. Feststellung Quorum (Beschlussfähigkeit) — wenn konfiguriert
7. Feststellung Mehrheit
8. Ergebnis: Angenommen / Abgelehnt
9. Aktive Konfigurationsoptionen

**PDF-Aufbau:**
```
┌─────────────────────────────────┐
│ PROTOKOLL / NIEDERSCHRIFT       │
│ [Beschlusstitel oder Question]  │
├─────────────────────────────────┤
│ Datum: 2026-02-19               │
│ Modus: Digital via Decide-O-Mat │
│ Versammlungsleiter: [Name]      │
├─────────────────────────────────┤
│ KONFIGURATION                   │
│ Teilnahme: Geschlossen          │
│ Abstimmung: Geheim              │
│ Stimmabgabe: Unveränderlich     │
│ Mehrheit: Einfach               │
│ Quorum: Anwesende Teilnehmer    │
├─────────────────────────────────┤
│ TEILNEHMER                      │
│ ☑ Max Mustermann (Mitglied)     │
│ ☑ Erika Muster (Leiter)        │
│ ... (N von M anwesend)          │
├─────────────────────────────────┤
│ BESCHLUSSANTRAG                 │
│ [Volltext des Antrags]          │
├─────────────────────────────────┤
│ ABSTIMMUNGSERGEBNIS             │
│ Ja: 12 | Nein: 3 | Enthaltung: 2│
│ Beschlussfähigkeit: Ja (17/20)  │
│ Erforderliche Mehrheit: Einfach │
│ Ergebnis: ANGENOMMEN            │
├─────────────────────────────────┤
│ INTEGRITÄT                      │
│ Content-Hash: sha256:a1b2c3...  │
│ PDF-Hash: sha256:d4e5f6...      │
├─────────────────────────────────┤
│ SIGNATUR                        │
│ Leiter: [Name] — [Zeitpunkt]   │
└─────────────────────────────────┘
```

### 4.4 Signature Service (Pluggable)

```
SignatureService (Interface)
├── AdvancedProvider (Default)
│   └── Auth-Token + Timestamp + Hash = Signatur-Record
├── QesProvider (Optional, konfigurierbar)
│   └── PAdES-QES via QTSP REST API
└── MockProvider (Tests)
    └── Deterministisches Test-Ergebnis
```

**Advanced Electronic Signature (Standard):**
- Firebase Auth Token als Identitätsnachweis
- Signatur = `{ signerId, signerRole, signerName, method: "advanced", signedAt, contentHash }`
- In `protocol.signatures[]` Array gespeichert
- Signiert wird durch den Versammlungsleiter (oder Owner, wenn kein Chairperson zugewiesen)
- Kein externer Provider nötig

**QES (Optional):**
- PAdES-QES via QTSP (z.B. D-Trust sign-me, Swisscom AIS)
- Konfigurierbar per `settings.signatureRequired: "qes"`
- QTSP-Adapter mit Provider-Interface: `sign(pdfBytes, signerInfo) → signedPdfBytes`
- Feature Flag: `ENABLE_QES`

### 4.5 Audit Service

**Append-only mit Hash-Chain (nur wenn `settings.auditTrailEnabled: true`):**
```javascript
async function appendAuditEntry(decisionId, { actor, action, details, correlationId }) {
  const lastEntry = await getLastAuditEntry(decisionId);
  const entry = {
    timestamp: FieldValue.serverTimestamp(),
    correlationId: correlationId || uuidv4(),
    actor, action, details,
    previousEntryId: lastEntry?.id || null,
    previousHash: lastEntry?.entryHash || null,
  };
  // Hash ohne entryHash-Feld selbst
  entry.entryHash = computeCanonicalHash(entry).hash;
  await db.collection('decisions').doc(decisionId)
    .collection('auditLog').add(entry);
}
```

**Audit-Events:**
| Event | Auslöser |
|-------|----------|
| `settings.updated` | Konfigurationsoptionen geändert |
| `participant.invited` | Teilnehmer eingeladen |
| `participant.removed` | Teilnehmer entfernt |
| `chairperson.assigned` | Versammlungsleiter zugewiesen |
| `voting.opened` | Formale Abstimmung eröffnet |
| `vote.cast` | Stimme abgegeben (bei geheimer Wahl: ohne userId) |
| `voting.closed` | Abstimmung geschlossen + Ergebnis |
| `protocol.finalized` | Protokoll generiert + Hashes |
| `protocol.signed` | Signatur hinzugefügt |

---

## 5. Backlog: Epics → Stories → Akzeptanzkriterien

### Epic 1: Konfigurierbare Decision-Settings

#### US-R01: Decision-Einstellungen konfigurieren
**Als** Decision-Owner **möchte ich** einzelne Parameter meiner Decision konfigurieren **damit** ich den Formalitätsgrad flexibel festlegen kann.
- **AK1:** Settings-Panel im Decision-View sichtbar für Owner (solange `status: "open"` und `votingPhase !== "voting"`).
- **AK2:** Jede Option einzeln schaltbar: Teilnahme (open/closed), Abstimmung (open/secret), Stimmabgabe (änderbar/immutable), Enthaltung (ja/nein), Mehrheit (simple/absolute/2÷3/3÷4), Quorum (none/present/total), Protokoll (an/aus), Signatur (none/advanced/qes), Audit-Trail (an/aus).
- **AK3:** Defaults = Bestandsverhalten: `{ participation: "open", votingMethod: "open", voteImmutable: false, abstentionAllowed: false, requiredMajority: "simple", quorumType: "none", protocolEnabled: false, signatureRequired: "none", auditTrailEnabled: false }`.
- **AK4:** Settings-Änderungen werden gesperrt sobald `votingPhase: "voting"` oder `status: "closed"`.
- **AK5:** Abhängigkeiten validiert: `signatureRequired !== "none"` erzwingt `protocolEnabled: true`. `quorumType !== "none"` bei `participation: "open"` nutzt `participantIds.length` als Bezugsgröße.
- **AK6:** Cloud Function `updateDecisionSettings` speichert Änderungen + optional Audit-Log-Eintrag.

### Epic 2: Geschlossener Teilnehmerkreis

#### US-R02: Teilnehmer einladen (geschlossener Kreis)
**Als** Owner/Chairperson **möchte ich** Teilnehmer per E-Mail oder User-ID einladen **damit** nur berechtigte Personen abstimmen können.
- **AK1:** Einladungsformular nur sichtbar wenn `settings.participation: "closed"`.
- **AK2:** Einladung per E-Mail oder Auswahl aus bestehenden Participants.
- **AK3:** Nur registrierte (nicht-anonyme) Firebase-User dürfen eingeladen werden.
- **AK4:** Eingeladene User erscheinen in `allowedParticipantIds`.
- **AK5:** Nicht-eingeladene User sehen Abstimmungs-UI nicht (read-only Zugang zur Diskussion).
- **AK6:** Teilnehmer können vor Abstimmungsbeginn entfernt werden (`votingPhase !== "voting"`).
- **AK7:** Audit-Log (wenn aktiviert): `participant.invited` / `participant.removed`.

#### US-R03: Versammlungsleiter zuweisen
**Als** Owner **möchte ich** einen Teilnehmer als Versammlungsleiter (Chairperson) benennen **damit** die formale Leitung der Abstimmung dokumentiert ist.
- **AK1:** Dropdown pro Participant: Member / Chairperson.
- **AK2:** Maximal ein Chairperson gleichzeitig; Zuweisung an anderen User löst vorherigen ab.
- **AK3:** Wenn kein Chairperson zugewiesen: Owner fungiert als Leiter (implizit).
- **AK4:** Chairperson kann Abstimmung eröffnen/schließen und Teilnehmer verwalten.
- **AK5:** Rollenzuweisung nur änderbar solange `votingPhase !== "voting"`.
- **AK6:** Audit-Log (wenn aktiviert): `chairperson.assigned`.

### Epic 3: Formale Abstimmung

#### US-R04: Formale Abstimmung eröffnen
**Als** Owner/Chairperson **möchte ich** die formale Abstimmungsphase starten **damit** Teilnehmer ihre Stimme abgeben können.
- **AK1:** Button "Abstimmung eröffnen" sichtbar für Owner/Chairperson.
- **AK2:** Bei `participation: "closed"`: Setzt `votingPhase: "voting"`, sperrt Settings und Teilnehmerliste.
- **AK3:** Bei `participation: "open"`: Kein expliziter Startschritt nötig — Stimmen können sofort abgegeben werden (Bestandsverhalten für Abstimmung, neue Optionen greifen trotzdem).
- **AK4:** Voraussetzung bei `participation: "closed"`: Mindestens 1 Teilnehmer eingeladen.
- **AK5:** Alle eingeladenen Teilnehmer erhalten Notification (wenn FCM aktiv).
- **AK6:** Audit-Log (wenn aktiviert): `voting.opened`.

#### US-R05: Stimme abgeben
**Als** berechtigter Teilnehmer **möchte ich** meine Stimme abgeben **damit** mein Votum gezählt wird.
- **AK1:** UI passt sich den aktiven Settings an:
  - `abstentionAllowed: true` → drei Buttons: Ja / Nein / Enthaltung
  - `abstentionAllowed: false` → zwei Buttons: Ja / Nein (Bestandsverhalten)
- **AK2:** Bei `participation: "closed"`: Nur User in `allowedParticipantIds` können abstimmen.
- **AK3:** Bei `voteImmutable: true`: Stimme ist write-once — nach Abgabe nicht änderbar. UI zeigt "Stimme abgegeben".
- **AK4:** Bei `voteImmutable: false`: Stimme kann geändert werden (Bestandsverhalten).
- **AK5:** Bei `votingMethod: "secret"`: Kein `userId`/`displayName` im Vote-Dokument gespeichert.
- **AK6:** Bei `votingMethod: "open"`: `userId` und `displayName` im Vote-Dokument.
- **AK7:** Cloud Function prüft: User berechtigt, Decision im richtigen Status, Settings eingehalten.
- **AK8:** Echtzeit-Anzeige: Anzahl abgegebener Stimmen (bei geheimer Wahl: ohne Ergebnis bis Schließung).
- **AK9:** Audit-Log (wenn aktiviert): `vote.cast` (bei geheimer Wahl ohne userId).

#### US-R06: Abstimmung schließen & Ergebnis berechnen
**Als** Owner/Chairperson **möchte ich** die Abstimmung schließen **damit** das Ergebnis festgestellt wird.
- **AK1:** Button "Abstimmung schließen" für Owner/Chairperson.
- **AK2:** Cloud Function zählt Stimmen aus `resolutionVotes` (oder `finalVotes` bei Defaults).
- **AK3:** `totalEligible` = `allowedParticipantIds.length` (bei closed) oder `participantIds.length` (bei open).
- **AK4:** Quorum-Prüfung wenn `quorumType !== "none"`:
  - `"present"` → Quorum bezogen auf tatsächlich abgestimmte Teilnehmer
  - `"total"` → Quorum bezogen auf alle Berechtigten
- **AK5:** Mehrheitsprüfung basierend auf `requiredMajority`:
  - `"simple"` → > 50% der abgegebenen Ja+Nein-Stimmen
  - `"absolute"` → > 50% aller Berechtigten
  - `"two_thirds"` → ≥ 2/3 der abgegebenen Ja+Nein-Stimmen
  - `"three_quarters"` → ≥ 3/4 der abgegebenen Ja+Nein-Stimmen
- **AK6:** `outcome`: `"approved"` | `"rejected"` | `"no_quorum"`.
- **AK7:** Ergebnis in `result` gespeichert (write-once).
- **AK8:** `votingPhase` → `"completed"` (bei closed) oder `status` → `"closed"` (bei open).
- **AK9:** Audit-Log (wenn aktiviert): `voting.closed` mit vollem Ergebnis.

### Epic 4: Protokoll & Signatur

#### US-R07: Protokoll generieren
**Als** Owner/Chairperson **möchte ich** ein Beschlussprotokoll generieren **damit** die Abstimmung formal dokumentiert ist.
- **AK1:** Button "Protokoll erstellen" nur sichtbar wenn `settings.protocolEnabled: true` und Abstimmung geschlossen.
- **AK2:** Nur Owner oder Chairperson kann Protokoll generieren.
- **AK3:** Cloud Function baut Protocol-Content: Datum, Modus, Versammlungsleiter, Teilnehmer, Beschlusstext, Ergebnis, aktive Konfiguration.
- **AK4:** Content wird als Canonical JSON (RFC 8785) serialisiert → SHA-256 Hash berechnet.
- **AK5:** PDF wird generiert (pdf-lib) mit allen Pflichtinhalten.
- **AK6:** PDF wird in Firebase Storage abgelegt, SHA-256 Hash des PDFs berechnet.
- **AK7:** `protocol.status` → `"final"`, `protocol.contentHash` + `protocol.pdfHash` gespeichert.
- **AK8:** Nach Finalisierung: Content-Felder und Hashes unveränderbar (serverseitig enforced).
- **AK9:** Audit-Log (wenn aktiviert): `protocol.finalized`.

#### US-R08: Protokoll einsehen & herunterladen
**Als** Teilnehmer **möchte ich** das Protokoll einsehen und als PDF herunterladen **damit** ich den Beschluss nachvollziehen kann.
- **AK1:** Protokoll-Ansicht im Browser mit allen Pflichtinhalten.
- **AK2:** PDF-Download-Button.
- **AK3:** Hash-Verifizierung: Anzeige ob gespeicherter Hash mit (neu berechnetem) PDF-Hash übereinstimmt.
- **AK4:** Signaturstatus sichtbar: wer hat wann signiert.

#### US-R09: Protokoll signieren (Advanced)
**Als** Versammlungsleiter (oder Owner) **möchte ich** das Protokoll elektronisch signieren **damit** die Niederschrift rechtswirksam unterzeichnet ist.
- **AK1:** Signatur-Button nur für Chairperson (oder Owner, wenn kein Chairperson zugewiesen), nur wenn `protocol.status: "final"` und `settings.signatureRequired !== "none"`.
- **AK2:** Klick = Bestätigung "Ich unterzeichne dieses Protokoll als [Rolle]".
- **AK3:** Signatur-Record: userId, Rolle (chairperson/owner), Name, Methode ("advanced"), Zeitstempel, Content-Hash-Referenz.
- **AK4:** Nach Signatur: `protocol.status` → `"signed"`.
- **AK5:** Audit-Log (wenn aktiviert): `protocol.signed`.

#### US-R10: QES-Signatur (Optional)
**Als** Organisation mit QES-Anforderung **möchte ich** das Protokoll qualifiziert elektronisch signieren **damit** maximaler Beweiswert erreicht wird.
- **AK1:** Nur aktiv wenn `settings.signatureRequired: "qes"`.
- **AK2:** QTSP-Integration: PDF wird an Provider gesendet, PAdES-QES Signatur zurück.
- **AK3:** Signiertes PDF ersetzt Original in Storage.
- **AK4:** Fallback auf Advanced wenn QTSP nicht erreichbar (mit Warnung + Audit-Eintrag).

### Epic 5: Audit & Integrität

#### US-R11: Audit-Trail einsehen
**Als** Teilnehmer **möchte ich** den Audit-Trail einsehen **damit** ich nachvollziehen kann, wer was wann getan hat.
- **AK1:** Audit-Trail-Ansicht nur sichtbar wenn `settings.auditTrailEnabled: true`.
- **AK2:** Chronologische Liste aller Aktionen zu dieser Decision.
- **AK3:** Jeder Eintrag zeigt: Zeitpunkt, Akteur, Aktion, Details.
- **AK4:** Hash-Chain-Integrität prüfbar: Button "Integrität prüfen" → prüft previousHash-Kette.
- **AK5:** Bei Integritätsverletzung: Warnung anzeigen.

#### US-R12: Hash-Verifizierung
**Als** Teilnehmer **möchte ich** die Integrität des Protokolls verifizieren **damit** ich sicher bin, dass nichts manipuliert wurde.
- **AK1:** Client-seitige SHA-256 Berechnung des heruntergeladenen PDFs.
- **AK2:** Vergleich mit gespeichertem `protocol.pdfHash`.
- **AK3:** Grün "Verifiziert" bei Match, Rot "Manipulation erkannt" bei Mismatch.

---

## 6. Implementierungsplan (Phasen/Sprints)

### Phase 1: Foundation (Sprint 1–2)

| Task | Dateien | Details |
|------|---------|---------|
| Feature Flag | `functions/config.js`, `frontend/src/config/features.js` | `ENABLE_DECISION_SETTINGS` |
| AuditService | `functions/services/AuditService.js` | Append-only, Hash-Chain, correlationId |
| CanonicalHashService | `functions/services/CanonicalHashService.js` | RFC 8785 + SHA-256 |
| QuorumService | `functions/services/QuorumService.js` | Quorum- + Mehrheitsberechnung |
| npm Dependencies | `functions/package.json` | `canonicalize`, `pdf-lib`, `uuid` |
| Firebase Storage Setup | `firebase.json`, `storage.rules` | Bucket für PDFs |
| Firestore Rules | `firestore.rules` | `resolutionVotes`, `auditLog` Subcollections |
| Tests | Unit-Tests für alle Services | Hash-Reproduzierbarkeit, Quorum-Logik |

### Phase 2: Decision Settings & Teilnehmerkreis (Sprint 3–4)

| Task | Dateien |
|------|---------|
| `updateDecisionSettings` Cloud Function | `functions/decisions.js` (erweitert) |
| `inviteParticipant` / `removeParticipant` | `functions/decisions.js` (erweitert) |
| `assignChairperson` | `functions/decisions.js` (erweitert) |
| Frontend: DecisionSettings Panel | `frontend/src/components/DecisionSettings.jsx` + `.module.css` |
| Frontend: ParticipantManager (bei closed) | `frontend/src/components/ParticipantManager.jsx` + `.module.css` |
| Decision.jsx: Bedingte Settings-UI | `frontend/src/pages/Decision.jsx` (erweitert) |
| i18n Keys | `frontend/src/locales/{en,de}.json` — `settings.*` |
| Tests | Cloud Function Tests, Component Tests |

### Phase 3: Formale Abstimmung (Sprint 5–6)

| Task | Dateien |
|------|---------|
| `openFormalVoting` | `functions/voting.js` |
| `castFormalVote` (write-once, secret, abstention) | `functions/voting.js` |
| `closeFormalVoting` + Ergebnisberechnung | `functions/voting.js` |
| Frontend: FormalVotingPanel | `frontend/src/components/FormalVotingPanel.jsx` + `.module.css` |
| Frontend: VotingResult | `frontend/src/components/VotingResult.jsx` + `.module.css` |
| Realtime Subscription für resolutionVotes | `frontend/src/services/firebase.js` (erweitert) |
| Secret Ballot Logic | Server-seitig: vote ohne userId |
| Tests | Write-once Tests, Quorum-Kombinationen, Secret Ballot |

### Phase 4: Protokoll & Signatur (Sprint 7–8)

| Task | Dateien |
|------|---------|
| ProtocolGenerator (pdf-lib) | `functions/services/ProtocolGenerator.js` |
| `finalizeProtocol` Cloud Function | `functions/protocol.js` |
| SignatureService + AdvancedProvider | `functions/services/SignatureService.js`, `functions/services/signatures/AdvancedProvider.js` |
| MockQESProvider | `functions/services/signatures/MockProvider.js` |
| `signProtocol` Cloud Function | `functions/protocol.js` |
| Frontend: ProtocolViewer Page | `frontend/src/pages/ProtocolViewer.jsx` + `.module.css` |
| Frontend: SignaturePanel | `frontend/src/components/SignaturePanel.jsx` + `.module.css` |
| Frontend: Hash-Verifizierung | `frontend/src/services/hashVerification.js` |
| Storage Rules | `storage.rules` |
| Tests | PDF-Content, Hash-Reproduzierbarkeit, Signatur Contract Tests |

### Phase 5: Audit & Polish (Sprint 9–10)

| Task | Dateien |
|------|---------|
| Frontend: AuditLogViewer | `frontend/src/components/AuditLogViewer.jsx` + `.module.css` |
| Hash-Chain Verification (Client) | `frontend/src/services/hashVerification.js` |
| Tamper Detection Tests | E2E: Änderung an finalen Docs erkennen |
| Optional: QES Provider | `functions/services/signatures/QesProvider.js`, `functions/services/qtsp/QtspAdapter.js` |
| Optional: RFC 3161 Timestamp | `functions/services/qtsp/TimestampService.js` |
| Structured Logging | `functions/services/Logger.js` — correlationId |
| Security Tests | Firestore Rules: write-once, append-only |
| i18n Completion | Alle neuen Keys en + de |
| MyDecisions Integration | Settings-Badges auf DecisionCards |

### Rollout-Plan

| Schritt | Aktion | Feature Flag |
|---------|--------|-------------|
| 1 | Deploy Phase 1–2 auf Staging | `ENABLE_DECISION_SETTINGS=true` (Staging only) |
| 2 | Internes Testing | — |
| 3 | Deploy Phase 3–4 auf Staging | — |
| 4 | UAT mit Pilot-Nutzern | — |
| 5 | Production Rollout Phase 1–4 | `ENABLE_DECISION_SETTINGS=true` |
| 6 | QES-Integration (Phase 5) | `ENABLE_QES=true` (nach Provider-Vertrag) |

---

## 7. Risiken & Offene Punkte

| # | Risiko | Mitigation |
|---|--------|------------|
| R1 | **GenG-Konformität nicht juristisch validiert** | Annahmen dokumentiert; juristische Prüfung vor Go-Live empfohlen |
| R2 | **E2E-Encryption vs. Server-seitige PDF** | Formale Settings (Protokoll, Audit) arbeiten **ohne E2E-Encryption** (Klartext). Bestehende informelle Decisions bleiben verschlüsselt. **Annahme: Formal dokumentierte Beschlüsse sind intern transparent.** |
| R3 | **QES-Provider-Integration** | QES als optionales Feature hinter Flag; MockProvider für Tests |
| R4 | **Hash-Reproduzierbarkeit** | RFC 8785 (JCS) ist deterministisch; Unit-Tests mit Fixtures |
| R5 | **Geheime Abstimmung + Audit** | Vote-Docs ohne userId, Stimmzettel-Box-Prinzip; Audit loggt nur Anzahl |
| R6 | **Firebase Auth als Identitätsnachweis** | Nur nicht-anonyme User dürfen an geschlossenen Abstimmungen teilnehmen (Google/Email Auth = "starke Auth") |
| R7 | **Settings-Kombinationen** | Nicht alle Kombinationen sind sinnvoll (z.B. geheime Wahl + offene Teilnahme). UI zeigt Empfehlungen, blockiert aber nicht. |
| R8 | **Kein Schriftführer** | GenG §47 verlangt Unterschrift von Versammlungsleiter UND Schriftführer. Ohne Schriftführer-Rolle genügt nur die Leiter-Signatur. Risiko: reduzierter Beweiswert. Mitigation: In juristischer Prüfung (R1) klären. |

### Explizite Annahmen

1. **Keine Genossenschafts-Entity**: Teilnehmerkreis wird pro Decision definiert, nicht global verwaltet.
2. **Keine Tagesordnung**: Eine Decision = ein Beschlussantrag. Mehrere TOPs = mehrere Decisions.
3. **Kein Versammlungs-Lifecycle**: Keine Einladungs-/Eröffnungs-/Schließungszeremonie.
4. **Kein Schriftführer**: Owner/Chairperson übernimmt Protokollgenerierung und -signatur.
5. **Klartext für formale Features**: Server muss Content für PDF + Hashing kennen. Transport- und At-Rest-Encryption via Firebase reichen.
6. **Firebase Auth Pflicht**: Anonyme User können nicht an geschlossenen Abstimmungen teilnehmen.
7. **Additive Settings**: Jede Option kann unabhängig aktiviert werden. Es gibt keine "Preset-Modi", die mehrere Optionen gleichzeitig setzen (kann als UI-Convenience in der Zukunft ergänzt werden).

---

## 8. Liste konkreter Codeänderungen

### Neue Dateien

| Datei | Typ | Beschreibung |
|-------|-----|--------------|
| `functions/voting.js` | Cloud Functions | openFormalVoting, castFormalVote, closeFormalVoting |
| `functions/protocol.js` | Cloud Functions | finalizeProtocol, signProtocol |
| `functions/services/AuditService.js` | Service | Append-only Log + Hash-Chain |
| `functions/services/CanonicalHashService.js` | Service | RFC 8785 JCS + SHA-256 |
| `functions/services/QuorumService.js` | Service | Quorum + Mehrheitsberechnung |
| `functions/services/ProtocolGenerator.js` | Service | JSON → PDF (pdf-lib) |
| `functions/services/SignatureService.js` | Service | Pluggable Signatur-Interface |
| `functions/services/signatures/AdvancedProvider.js` | Provider | Auth-basierte Signatur |
| `functions/services/signatures/MockProvider.js` | Provider | Test-Mock für QES |
| `functions/services/signatures/QesProvider.js` | Provider | PAdES-QES via QTSP (Phase 5) |
| `functions/services/qtsp/QtspAdapter.js` | Adapter | QTSP REST-Client (Phase 5) |
| `functions/services/Logger.js` | Utility | Structured Logging + correlationId |
| `functions/config.js` | Config | Feature Flags erweitert |
| `storage.rules` | Rules | Firebase Storage für PDFs |
| `frontend/src/components/DecisionSettings.jsx` + `.module.css` | Component | Granulares Settings-Panel |
| `frontend/src/components/ParticipantManager.jsx` + `.module.css` | Component | Teilnehmer einladen/verwalten |
| `frontend/src/components/FormalVotingPanel.jsx` + `.module.css` | Component | Ja/Nein/Enthaltung + Write-once |
| `frontend/src/components/VotingResult.jsx` + `.module.css` | Component | Ergebnis-Anzeige mit Quorum/Mehrheit |
| `frontend/src/components/SignaturePanel.jsx` + `.module.css` | Component | Signatur-UI |
| `frontend/src/components/AuditLogViewer.jsx` + `.module.css` | Component | Audit-Anzeige |
| `frontend/src/pages/ProtocolViewer.jsx` + `.module.css` | Page | Protokoll-Anzeige + Download |
| `frontend/src/services/hashVerification.js` | Service | Client-seitige Hash-Prüfung |
| `frontend/src/config/features.js` | Config | Feature Flags Frontend |

### Modifizierte Dateien

| Datei | Änderung |
|-------|----------|
| `firestore.rules` | Neue Match-Blöcke: `resolutionVotes`, `auditLog` |
| `firestore.indexes.json` | Index für `auditLog` (timestamp sortiert) |
| `firebase.json` | Storage aktivieren |
| `functions/package.json` | `canonicalize`, `pdf-lib`, `uuid` |
| `functions/index.js` | Imports voting.js + protocol.js + erweiterte decisions.js |
| `frontend/src/App.jsx` | Route `/d/:id/protocol` |
| `frontend/src/pages/Decision.jsx` | Bedingte UI: Settings-Panel, FormalVotingPanel, Results |
| `frontend/src/services/firebase.js` | Neue httpsCallable Bindings + resolutionVotes Subscription |
| `frontend/src/locales/en.json` | ~80 neue Keys unter `settings.*`, `voting.*`, `protocol.*`, `audit.*` |
| `frontend/src/locales/de.json` | ~80 neue Keys unter `settings.*`, `voting.*`, `protocol.*`, `audit.*` |
| `frontend/src/components/DecisionCard.jsx` | Settings-Badges (closed, secret, protocol, etc.) |
| `frontend/src/pages/MyDecisions.jsx` | Filter/Sortierung nach aktiven Settings |
| `frontend/package.json` | Ggf. Web Crypto Polyfill |
| `ROADMAP.md` | v2.0 Section |
| `ARCHITECTURE.md` | Erweiterte Doku |

### Testplan

| Testart | Scope | Werkzeug |
|---------|-------|----------|
| **Unit** | QuorumService (alle Majority × Quorum Kombinationen), CanonicalHashService, AuditService (Hash-Chain) | Vitest |
| **Unit** | ProtocolGenerator (PDF enthält alle Pflichtfelder, passt sich aktiven Settings an) | Vitest + pdf-lib parse |
| **Integration** | Cloud Functions: Settings-Update, Voting-Lifecycle, Write-once, Secret Ballot | Vitest + Firestore Emulator |
| **Security** | Firestore Rules: write-once resolutionVotes, append-only auditLog, no-delete | `@firebase/rules-unit-testing` |
| **Contract** | SignatureProvider Interface: Mock ↔ Advanced | Vitest |
| **E2E** | Vollständiger Flow: Settings → Einladen → Abstimmen → Protokoll → Signatur | Playwright |
| **Tamper Detection** | Änderung an finalen Docs → Hash mismatch | Vitest |
| **Hash Reproducibility** | Canonical JSON + Hash aus Fixtures → deterministisch | Vitest |
| **Settings-Kombinationen** | Verschiedene Presets: nur closed, nur secret, nur protocol, vollformal | Playwright |

---

## MVP vs. Vollausbau

### MVP (v2.0)
- Konfigurierbare Decision-Settings (US-R01)
- Geschlossener Teilnehmerkreis + Chairperson-Rolle (US-R02, US-R03)
- Formale Abstimmung: Write-once, Secret, Enthaltung (US-R04, US-R05, US-R06)
- Protokoll-Generierung PDF + Hashes (US-R07, US-R08)
- Advanced Signature (US-R09)
- Audit-Trail + Hash-Verifizierung (US-R11, US-R12)
- **Ohne:** QES, RFC 3161, Blockchain, Settings-Presets

### Vollausbau (v2.1+)
- QES via QTSP (US-R10)
- Qualifizierter Zeitstempel (RFC 3161)
- Blockchain Hash-Anker
- Settings-Presets ("Informal", "Vereinsbeschluss", "GenG-konform") als UI-Convenience
- Batch-Beschlüsse (mehrere Decisions in einer "Sitzung")
- Export (CSV, DATEV)
