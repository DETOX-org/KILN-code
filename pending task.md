# DETOX Code — Master Roadmap & Pending Tasks Specification

> **Mission**: Transform DETOX Code (KILN-code) into an industry-grade, synchronous, event-driven competitive coding platform with an integrated Admin Portal, unique Session ID challenge creation, single-write database storage (Firebase + Local Persistent Engine), dynamic participant session onboarding, and batched anti-cheat telemetry.

---

## 1. System Architecture Overview

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DETOX CODE SYSTEM TOPOLOGY                                     │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                   │
│  [ ADMIN PORTAL ]                                                                                 │
│  Admin Login ──▶ Problem & Rules Configurator ──▶ Single Metadata Object ──▶ Atomic DB Write      │
│                  (Title, Limits, Test Cases,       (Generates Unique          (Firebase + Local   │
│                   Strikes, Duration, Points)        Session ID: KILN-8392)     Session Store)     │
│                                                                                     │             │
│                                                                                     ▼             │
│  [ PARTICIPANT WORKSPACE ]                                                     Shared Session ID  │
│  Participant Enters: Name + Session ID (e.g. KILN-8392) ───────────────────────────┘             │
│            │                                                                                      │
│            ▼                                                                                      │
│  Loads Authorized Challenge Payload (Exact Problem, Time Limit, Rules, Test Cases)                 │
│            │                                                                                      │
│            ▼                                                                                      │
│  Proctored Coding Workspace (Fullscreen Lock, Tab Surveillance, Paste Purge, Native Sandbox)      │
│            │                                                                                      │
│            ▼                                                                                      │
│  Local Telemetry Accumulator (Events, Strikes, Code Snapshots buffered locally in memory)         │
│            │                                                                                      │
│            ▼                                                                                      │
│  Final Submission / Match Conclusion ────────────────────────────────────────────────────────┐     │
│                                                                                              │     │
│  [ ATOMIC WRITE FINISH ]                                                                     │     │
│  Single Consolidated Write to Database ◀────────────────────────────────────────────────────┘     │
│  (Final Code, Language, Verdict, Score, Strikes, Telemetry Timeline, Verification Flag)           │
│                                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Pillars

### Pillar A: Admin Portal & Unique Session ID Generation
- **Authentication**: Admin credentials / passkey protection (`/admin` portal).
- **Challenge Configuration Engine**:
  - **Problem Specification**: Problem Title, Slug, Markdown Description, Operational Constraints, Starter Code.
  - **Resource Boundaries**: CPU Time Limit (ms), RAM Boundary (MB).
  - **Custom Test Suite**: Public Sample Test Cases and Hidden Benchmark Test Cases with per-case point weightings.
  - **Integrity & Anti-Cheat Rules**:
    - Fullscreen Enforcement Toggle (Required / Optional)
    - Max Allowed Anti-Cheat Strikes (e.g., 3 strikes before disqualification)
    - External Clipboard Paste Blocking (Strict internal copy buffer only)
    - 10-Second Idle Debounce Snapshot Autosave
  - **Match Parameters**: Challenge Duration (minutes, e.g., 45 mins), Total Points Pool (e.g., 100 or 1000 pts).
- **Session Code Generation**:
  - Generates a human-friendly, cryptographically secure 6-character unique identifier: `KILN-XXXX` (e.g. `KILN-7492`, `KILN-3184`).
- **Single-Write Metadata Ingestion**:
  - Gathers all program parameters, test cases, and anti-cheat rules into a single standardized metadata document.
  - Performs an **atomic single write** to Firebase Firestore (`challenges/{sessionId}`) and local persistent session store.

### Pillar B: Participant Onboarding via Session ID
- **Lobby Entry Flow**:
  - Participant specifies:
    1. **Warrior Name / Callsign** (e.g. `CIPHER_BLADE`) — saved locally in `localStorage`.
    2. **Unique Session ID** (e.g. `KILN-7492`) — entered manually or auto-detected from URL query parameters (`?session=KILN-7492`).
- **Dynamic Challenge Provisioning**:
  - Frontend queries the database (`/api/sessions/:sessionId` or Firebase) using the session number.
  - Loads the exact problem statement, sample test cases, starter code, and anti-cheat constraints defined by the Admin for that session.
  - Prevents public display of hidden test cases; only public samples are sent to the client.

### Pillar C: Proctored Coding & Native Compiler Execution
- **Zero-Trust Sandbox Judging**:
  - Submissions execute in isolated processes with strict CPU/memory limits.
  - Supports 5 runtimes natively on Windows: Python 3.13, C++20 (GCC 15.2), JavaScript (Node.js 24), TypeScript (TSX Engine), and C.
  - Problem-specific solution harnesses automate I/O stream parsing for LeetCode-style classes or raw CP-style code.
- **Client-Side Anti-Cheat Surveillance**:
  - Fullscreen lock detection (`fullscreenchange`).
  - Window blur and secondary monitor focus tracking (`window.blur`).
  - Browser tab switching and window minimization (`visibilitychange`).
  - External clipboard paste intercept (strictly compares against internal editor copy history).
  - 10-second idle debounce snapshot generation.

### Pillar D: Local Accumulation & Single-Write Submission Finalization
- **Optimization Rationale**: Avoid spamming cloud databases with high-frequency network writes for every keystroke or blur event.
- **Local Manifest Accumulation**:
  - Strikes, telemetry events, and code snapshots are buffered locally in a client-side session dossier:
    ```json
    {
      "sessionId": "KILN-7492",
      "userId": "CIPHER_WARRIOR",
      "strikes": 1,
      "events": [
        { "type": "FULLSCREEN_ENTER", "timestamp": "2026-09-25T11:00:00Z" },
        { "type": "TAB_SWITCH", "timestamp": "2026-09-25T11:15:20Z", "strike": 1 }
      ],
      "snapshotsCount": 8,
      "lastCode": "..."
    }
    ```
- **Single-Write Database Flush**:
  - Triggered atomically when:
    1. Participant clicks **"⚡ SUBMIT"** and evaluation completes.
    2. Participant incurs **3 Strikes** (Disqualification / Terminated).
    3. Match **Countdown Clock reaches 00:00**.
    4. Participant confirms **"Submit & Exit"** via Escape modal.
  - Flushes the complete finalized package to Firebase Firestore (`submissions/{submissionId}`) and backend store in **one single write operation**.

---

## 3. Step-by-Step Implementation Roadmap

- [ ] **Task 1: Backend Session Management & Admin API**
  - Create `backend/src/stores/session.store.ts` for managing session lifecycle (`SCHEDULED`, `LIVE`, `CLOSED`, `ARCHIVED`).
  - Create `backend/src/routes/session.routes.ts`:
    - `POST /api/admin/sessions` — Create new challenge session (atomic write).
    - `GET /api/sessions/:sessionId` — Fetch public session metadata & problem statement for participants.
    - `POST /api/sessions/:sessionId/submit-final` — Single consolidated write for participant submission, score, and telemetry dossier.
    - `GET /api/admin/sessions/:sessionId/audit` — Admin view of all participant dossiers, telemetry timelines, and strikes.
  - Mount session routes in `backend/src/app.ts`.

- [ ] **Task 2: Firebase Adapter & Cloud Database Integration**
  - Implement dual-mode database service (`backend/src/services/database.service.ts` and `frontend/js/firebase-adapter.js`):
    - Reads Firebase config from environment variables or UI configuration.
    - Writes challenge sessions directly to Firebase Firestore collection `challenges`.
    - Writes finalized participant dossiers to Firebase Firestore collection `submissions`.
    - Gracefully falls back to local high-speed persistent store if Firebase credentials are not provided.

- [ ] **Task 3: Admin Portal Interface (`frontend/admin.html` & `frontend/js/admin.js`)**
  - Industrial tactical HUD styling matching the DETOX Code design language (strict zero border-radius, high-contrast ember orange, technical mono typography).
  - Admin login panel with session auth.
  - Comprehensive Challenge Form:
    - Title, Slug, Statement (rich markdown editor), Difficulty, Points, CPU Limit, Memory Limit.
    - Test Case Builder (Add/remove public sample cases and hidden judge cases).
    - Anti-Cheat Rules (Fullscreen toggle, Max Strikes 1-5, External Paste block, Match Duration).
  - One-click "⚡ PUBLISH ARENA CHALLENGE" button:
    - Generates 6-character Session Code (`KILN-XXXX`).
    - Performs atomic single write to database.
    - Displays copyable Session Code, QR/Direct Link (`http://localhost:3000/?session=KILN-XXXX`).
  - Live Admin Monitor: Table of active sessions, registered coders, live scores, and integrity strikes.

- [ ] **Task 4: Participant Entry Flow Update (`frontend/index.html` & `frontend/js/anticheat.js`)**
  - Update Lobby Hero Form:
    - Warrior Callsign input field (stored locally in `localStorage`).
    - Unique Session ID input field (auto-populated if `?session=` query param is present).
    - "ENTER ARENA" button initiates validation against `/api/sessions/:sessionId`.
  - When Session ID is verified:
    - Dynamically loads the specific problem statement, time limit, and sample test cases.
    - Sets starter template code for the configured problem and selected language.
    - Launches the proctored workspace for that challenge session.

- [ ] **Task 5: Batched Telemetry & Single Final Database Write**
  - Refactor client telemetry in `anticheat.js`:
    - Collect events (`FULLSCREEN_ENTER`, `TAB_SWITCH`, `WINDOW_BLUR`, `EXTERNAL_PASTE_BLOCKED`) into `localAuditTrail` array.
    - Accumulate 10s idle debounce code snapshots in local storage cache.
    - On Submit / Timer Expiry / 3-Strike Termination:
      - Construct the consolidated audit package.
      - Send a **single atomic POST request** to `/api/sessions/:sessionId/submit-final` (and Firebase).
      - Display verdict, points, rank, and celebration effects.

- [ ] **Task 6: Verification & End-to-End Validation**
  - Test Admin Portal: create a session with custom problem and test cases.
  - Copy generated Session Code.
  - Open Participant Lobby, enter callsign and Session Code.
  - Verify customized problem statement, time limit, and test cases load dynamically.
  - Run tests and submit code: verify execution in Native KILN Sandbox.
  - Trigger anti-cheat strikes: verify local logging and final single-write to database.
  - Verify session audit and leaderboard in the Admin Monitor.
