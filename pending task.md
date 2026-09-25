# DETOX Code (KILN-Code) — Comprehensive Project Research & System Status

> **Document Status**: Production Verified  
> **Last Comprehensive Audit**: September 25, 2026  
> **Architecture Focus**: Competitive Arena, Proctored Anti-Cheat Engine, Native Multi-Language Compiler Sandbox, Admin Challenge Configurator, Unique Session ID Deployment, and Atomic Single-Write Database Persistence (Firebase + Local Persistent Engine).

---

## 1. Executive System Overview

**DETOX Code** (internally designated as **KILN-Code**) is an enterprise-grade, synchronized, high-performance competitive programming and proctored technical arena platform. It is engineered with a strict **tactical industrial HUD aesthetic** (zero border-radius, `#ff4d00` ember orange accents, technical monospace typography, high-contrast dark palette) and zero reliance on bubbly consumer UI libraries.

### Key Operational Capabilities
1. **Admin Challenge Configurator & Orchestrator**: Admin portal where administrators define challenges, resource limits, public/hidden test suites, and proctored rules, publishing them as an atomic metadata document.
2. **Unique Session ID System**: Generates human-friendly, cryptographically distinct `KILN-XXXX` Session IDs (e.g., `KILN-1001`, `KILN-XFY9`) for private or cohort-specific matches.
3. **Single Atomic Database Write Architecture**: Prevents network flood and database transaction exhaustion by accumulating participant telemetry, code versions, strikes, and execution verdicts locally, flushing the complete audit dossier in a **single consolidated atomic write** to Firebase Firestore (`challenges` & `submissions`) and the local persistent engine.
4. **Native Sandbox Execution Engine**: Multi-language execution (Python 3.13, C++20 via MinGW GCC 15.2, JavaScript Node.js 24, TypeScript TSX) running in isolated processes on Windows with CPU/RAM boundary enforcement, TLE guards, and memory tracking.
5. **Anti-Cheat Surveillance Suite**: Dual-display and window blur detection, fullscreen lock enforcement, reverse-clipboard paste purge, bot typing cadence / virtual keystroke injection detection, DevTools shortcut blocking, and a 3-strike disqualification protocol.

---

## 2. High-Level Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DETOX CODE SYSTEM TOPOLOGY                                       │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│  [ ADMIN COMMAND PORTAL ] (admin.html + admin.js)                                                      │
│  Admin Login ──▶ Challenge Configurator ──▶ Single Metadata Document ──▶ Atomic DB Write               │
│                  - Problem Title, Statement     (Generates Unique ID:     (Firebase Firestore          │
│                  - CPU Limit, RAM Limit          e.g. KILN-XFY9)           collection 'challenges'     │
│                  - Public & Hidden Test Cases                              + Local Persistent Store)   │
│                  - Proctored Rules (Strikes,                                         │                 │
│                    Fullscreen, Paste Purge)                                          ▼                 │
│                                                                              Session ID Published      │
│                                                                                      │                 │
│  [ PARTICIPANT ARENA LOBBY ] (index.html + anticheat.js)                             │                 │
│  Coder Enters: Callsign (Saved Locally) + Session ID (e.g. KILN-XFY9) ◀──────────────┘                 │
│            │                                                                                           │
│            ▼                                                                                           │
│  Dynamic Query: GET /api/sessions/KILN-XFY9 ──▶ Ingests Problem, Samples & Rules                      │
│            │                                                                                           │
│            ▼                                                                                           │
│  Proctored Coding Workspace (Fullscreen Enforced, Native Sandbox, 10s Idle Local Snapshot)             │
│            │                                                                                           │
│            ▼                                                                                           │
│  Local Telemetry Accumulator (Strikes, Blurs, Paste Purges, Snapshots buffered in localStorage)       │
│            │                                                                                           │
│            ▼                                                                                           │
│  Challenge Finalization (Submit Button / 3-Strike Disqualification / Timer 00:00)                      │
│            │                                                                                           │
│            ▼                                                                                           │
│  [ SINGLE ATOMIC DATABASE WRITE ] (POST /api/sessions/:sessionId/submit-final)                        │
│  Persists: Final Code, Language, Score, Runtime, Verdict, Strikes, Full Telemetry Timeline             │
│  Updates: Live Contest Leaderboard Standings                                                           │
│                                                                                                        │
│  [ ADMIN AUDIT DOSSIER ] (GET /api/sessions/admin/:sessionId/audit)                                   │
│  Admin inspects real-time coder submissions, audit timelines, strikes, and source code.                │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Comprehensive Project Audit: What is COMPLETED (100% Operational)

### Component 1: Native Compiler Sandbox (`backend/src/services/compiler.service.ts`)
- [x] **File-based process execution**: Writes code to temporary script files (`.py`, `.cpp`, `.cjs`, `.ts`) in `os.tmpdir()` to prevent Windows command-line escaping errors and string line continuation syntax errors.
- [x] **Multi-language execution verified on Windows**:
  - **Python 3.13**: `python <file>` execution with standard input piping.
  - **C++20**: GCC 15.2 at `D:\mingw64\bin\g++.exe` with `-O3 -std=c++20` flags.
  - **JavaScript**: Node.js 24 running `.cjs` files.
  - **TypeScript**: Direct execution via `tsx`.
- [x] **Dual execution mode**:
  - Solution Harness Mode: Automatically injects solution driver code for algorithmic LeetCode-style challenges (`two-sum`, `reverse-string`, `palindrome-number`).
  - Raw CP Mode: Standard stdin/stdout execution for general competitive programming problems.
- [x] **Windows Defender Latency Mitigation**: Adjusted timeouts and warmup handling to prevent false TLEs on freshly compiled binaries scanned by Windows Defender.
- [x] **Resource Tracking**: Real CPU execution time (ms) and peak memory usage (KB) measurement.

### Component 2: Session & Unique ID Generator (`backend/src/stores/session.store.ts`)
- [x] **Unique Session ID Generator**: Generates `KILN-XXXX` alphanumeric identifiers with zero collisions.
- [x] **Seeded Default Session**: Pre-seeded with `KILN-1001` (Two Sum, 45 minutes, 100 points, 3 strikes).
- [x] **Test Case Security**: Public sample test cases (`isSample: true`) are segregated from hidden benchmark test cases. Participants only receive public sample test cases upon querying the session.
- [x] **Participant Audit Store**: Stores complete submission manifests, per-test case results, strike totals, and telemetry logs.

### Component 3: Database Persistence Engine (`backend/src/services/database.service.ts`)
- [x] **Dual Persistence Engine**:
  - **Local Persistent Engine**: High-speed JSON storage for standalone operation with zero external dependencies.
  - **Firebase Firestore REST API**: Writes to `challenges` and `submissions` collections when credentials (`projectId`, `apiKey`) are supplied.
- [x] **Single-Write Pattern**: Writes challenge sessions and finalized submissions in a single atomic transaction.
- [x] **Runtime Configuration API**: `POST /api/sessions/admin/firebase-config` allows dynamically connecting or updating Firebase credentials from the Admin UI.

### Component 4: REST API Routes (`backend/src/routes/session.routes.ts`)
- [x] `GET /api/sessions/:sessionId`: Public participant query for challenge metadata and public sample test cases.
- [x] `POST /api/sessions/:sessionId/submit-final`: Single consolidated write endpoint that evaluates code against sample and hidden test cases, records score, strikes, and telemetry, and persists to database.
- [x] `POST /api/sessions/admin/create`: Admin endpoint to create and publish a new challenge session with atomic write.
- [x] `GET /api/sessions/admin/list`: Admin dashboard endpoint listing all challenge sessions and coder counts.
- [x] `GET /api/sessions/admin/:sessionId/audit`: Admin audit inspector returning all submissions, strikes, telemetry timelines, and source code.
- [x] `POST /api/sessions/admin/firebase-config`: Runtime Firebase connection toggle.

### Component 5: Admin Command Portal (`frontend/admin.html` & `frontend/js/admin.js`)
- [x] **Tactical HUD Design**: Ember orange tactical aesthetic, sharp zero border-radius, status telemetry LED.
- [x] **Challenge Configurator Form**:
  - Session Title, Match Duration (minutes).
  - Problem Title, Slug, Difficulty, CPU Time Limit (ms), RAM Limit (MB).
  - Problem Statement in Markdown.
- [x] **Dynamic Test Case Builder**:
  - Add/delete test cases with STDIN and STDOUT text areas.
  - Toggle between public sample and hidden benchmark.
  - Minimum 1 test case validation guard.
- [x] **Proctored Integrity Rule Switches**:
  - Enforce Fullscreen Lock (toggle).
  - Purge External Copy-Pastes (toggle).
  - 10s Idle Debounce Autosave (toggle).
  - Max Violation Strikes (1–10).
- [x] **Atomic Session Publishing**:
  - Generates unique `KILN-XXXX` Session ID on button press.
  - Shows animated generated session badge with one-click **"📋 COPY CODE"** and **"🔗 COPY DIRECT INVITE LINK"**.
- [x] **Live Session Monitor Table**:
  - Displays Session ID, Problem Title, Submissions count, and Active status.
  - Direct invite link launcher (`open in new tab`).
- [x] **Audit Dossier Modal**:
  - Inspects real-time submissions for any session.
  - Displays participant CallSign, User ID, Verdict badge (Accepted / Disqualified), Score, Strikes, Runtime, and Memory.
  - Renders expandable anti-cheat telemetry violation timeline (with event types and client timestamps).
  - Collapsible source code viewer with language syntax badge.
- [x] **Firebase Cluster Connector UI**:
  - Inputs for Firebase Project ID and Web API Key.
  - Instant status update to `MODE: FIREBASE FIRESTORE ACTIVE`.

### Component 6: Arena Lobby & Dynamic Session Onboarding (`frontend/index.html` & `frontend/js/anticheat.js`)
- [x] **Lobby Inputs**:
  - Coder CallSign input (`#coderCallsign`) saved locally in `localStorage`.
  - Session ID input (`#sessionCodeInput`) defaulted to `KILN-1001` or auto-populated from `?session=KILN-XXXX` query param.
- [x] **Admin Navigation**: Top header link directly accessing `admin.html`.
- [x] **Dynamic Challenge Loading**:
  - On clicking "ENTER ARENA", queries `GET /api/sessions/${sessionId}`.
  - Verifies session existence before granting entry.
  - Dynamically populates problem title, difficulty, statement, resource boundaries, and public sample test cases into the workspace.
  - Configures active proctoring rules (fullscreen toggle, paste blocking, strike ceiling) according to the admin's session specification.
  - Displays `SESSION: KILN-XXXX` badge in the workspace header.

### Component 7: Proctored Anti-Cheat & Local Telemetry Engine (`frontend/js/anticheat.js`)
- [x] **Fullscreen Intercept**: Requests fullscreen on entry (if enforced); exits trigger warning and strike.
- [x] **Window Blur & Focus Intercept**: Tracks focus lost to secondary monitors or external windows.
- [x] **Tab Switch & Visibility**: Flags tab minimization or browser switching.
- [x] **Reverse-Clipboard Integrity**: Compares clipboard text against internal editor copy history; purges external paste and flags violation.
- [x] **Virtual Keystroke & Bot Typing Guard**: Flags burst paste/injection (>40 chars in <60ms).
- [x] **DevTools Restriction**: Suppresses F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U.
- [x] **10-Second Idle Debounce Snapshot**: Buffers code versions locally without spamming network endpoints.
- [x] **Strike Escalation Protocol**:
  - Strike pips in HUD header.
  - Modal warning alert on strikes 1 and 2.
  - 3rd strike triggers termination and disqualification.
- [x] **Single-Write Finalization**:
  - Telemetry events buffered in `localTelemetryEvents` array.
  - On Submit / Disqualification / Timer Expiry / Escape Exit: sends a **single atomic POST request** to `/api/sessions/:sessionId/submit-final`.

### Component 8: Live Contest Leaderboard
- [x] Leaderboard endpoint `GET /api/contests/:contestId/standings`.
- [x] Leaderboard modal in Arena displaying rank (#01, #02, etc.), coder callsign, total score, penalty time, and verification badges (`ACCEPTED ✓` / `SUBMITTED`).
- [x] Instant rank re-sorting upon new submissions.

---

## 4. Comprehensive Project Audit: What is NOT Done / Left / Future Roadmap

The following table provides an exhaustive breakdown of components in the repository that are either partial, architectural prototypes, or planned for future enterprise scale:

| Area / Component | Current File Location | Status | What is Completed | What is Left / Needs Implementation | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Next.js Frontend Reconciliation** | `frontend/app/` (`page.jsx`, `components/*.jsx`) | Prototype / Standalone | High-fidelity React components (Plagiarism review, Algorithm visualizer, Courses view, Strict assessment view). | Currently runs separately from the static production HUD (`frontend/index.html` + `frontend/admin.html`). Needs Next.js router integration to unify both under one Next.js 14 SSR app if desired. | Medium |
| **PostgreSQL Database Driver** | `database/migrations/` (`001_initial_core_schema.sql`, `002_grading_subtasks_verification.sql`) | Schema Ready | Enterprise SQL tables for users, contests, problems, submissions, testcases, and verification logs. | Backend currently uses `database.service.ts` (in-memory + local JSON file + Firebase Firestore). Needs direct PostgreSQL/Prisma/Kysely connection if SQL database deployment is preferred over Firebase. | Medium |
| **Distributed Judge Worker & Queue** | `services/judge/` (`workers/server.ts`, `engines/piston-engine.ts`) | Code Ready | BullMQ Redis job processor and Piston engine client. | In development, the native compiler (`backend/src/services/compiler.service.ts`) executes directly on Windows without Redis/Docker. For cloud cluster scaling, BullMQ workers need a running Redis instance and Docker sandbox. | Low (Scale) |
| **AST-Based Plagiarism Detection Engine** | `frontend/app/components/PlagiarismReviewView.jsx` | UI Complete | UI review matrix, pair diff view, token match percentage visualization. | Backend AST parser (Python `ast`, Tree-sitter for C++/JS) to compute MOSS-like similarity matrices between submitted source codes across a session. | Low |
| **AI Webcam & Audio Surveillance** | Documented in `content.md` / `README.md` | Conceptual Spec | Documented architecture for gaze estimation, face presence, and ambient noise anomaly detection. | Browser MediaStream API integration (`getUserMedia`) with lightweight TensorFlow.js / BlazeFace model to flag multiple faces or gaze deviation. | Low |
| **Multi-Problem Contest Playlists** | `backend/src/stores/problem.store.ts` | Single/Multi Mixed | Catalog supports multiple problems (`two-sum`, `reverse-string`, `palindrome-number`). Sessions currently hold 1 primary problem. | Extend session model to hold an array of problems with cumulative scoring across the duration of a multi-problem contest. | Medium |

---

## 5. API Reference & Specification

### Public Participant Endpoints
| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/sessions/:sessionId` | Load public challenge metadata & sample test cases. | None | `{ success: true, data: { id, title, durationMinutes, rules, problem: { title, statement, samples } } }` |
| `POST` | `/api/sessions/:sessionId/submit-final` | **Single Atomic Write**: Submit solution, record telemetry & strikes. | `{ userId, username, sourceCode, language, strikes, telemetryEvents, snapshotsCount, terminationReason, isDisqualified }` | `{ success: true, data: { submissionId, verdict, score, runtimeMs, memoryKb, strikes, dbMode, results } }` |
| `POST` | `/api/submissions/run` | Sample run against public test cases (dry run). | `{ problem_id, language, source_code, tests? }` | `{ success: true, data: { status, score, runtimeMs, passedTests, totalTests, results } }` |
| `GET` | `/api/contests/:contestId/standings` | Query live contest leaderboard. | None | `{ contest_id, title, standings: [{ rank, username, total_score, is_verified }] }` |

### Admin Management Endpoints
| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/sessions/admin/create` | **Single Atomic Write**: Publish new challenge session and generate `KILN-XXXX`. | `{ title, description, durationMinutes, points, rules, problem, createdBy }` | `{ success: true, data: { sessionId, title, problemTitle, rules, dbMode, shareUrl } }` |
| `GET` | `/api/sessions/admin/list` | List all active sessions and submission counts. | None | `{ success: true, total, data: [{ id, title, problemTitle, submissionsCount }] }` |
| `GET` | `/api/sessions/admin/:sessionId/audit` | Admin inspection of participant dossiers, strikes, and telemetry. | None | `{ success: true, data: { sessionId, title, rules, submissions: [{ username, verdict, score, strikes, telemetryEvents, sourceCode }] } }` |
| `POST` | `/api/sessions/admin/firebase-config` | Update runtime Firebase credentials. | `{ projectId, apiKey }` | `{ success: true, config: { projectId, hasApiKey } }` |

---

## 6. Developer Runbook & Verification Manual

### Running the System Locally
1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   *Runs `tsx watch src/server.ts` on port 3000.*
   *Serves REST API at `/api/*` and static frontend at `http://localhost:3000/`.*

2. **Access Admin Portal**:
   - URL: `http://localhost:3000/admin.html`
   - Fill in Challenge Title, Problem Title, Statement, Resource Limits.
   - Add/remove test cases (toggle public samples vs. hidden benchmarks).
   - Configure proctoring switches (Fullscreen, Paste Blocking, Max Strikes).
   - Click **"⚡ GENERATE SESSION ID & PUBLISH (SINGLE WRITE)"**.
   - Copy the generated `KILN-XXXX` Session ID or invite link.

3. **Access Arena Workspace as Participant**:
   - URL: `http://localhost:3000/` (or `http://localhost:3000/?session=KILN-XXXX`).
   - Enter Warrior Callsign (e.g. `CIPHER_ONE`).
   - Enter Session ID (auto-populated if direct link was used).
   - Click **"⚡ ENTER ARENA"**.
   - Review proctoring rules and click **"I ACCEPT // ENTER PROCTORED ARENA"**.
   - Solve problem, test with **"▶ RUN TESTS"**, and officially submit via **"⚡ SUBMIT"**.

4. **Inspect Audit Manifest in Admin Portal**:
   - Open `http://localhost:3000/admin.html`.
   - Locate the session in **"ACTIVE ARENA SESSIONS"** table.
   - Click **"AUDIT"** to inspect the coder's verdict, execution time, strikes, complete telemetry violation timeline, and submitted source code.
