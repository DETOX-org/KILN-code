# DETOX Code (KILN-code) — Master System Specification & Architecture

## System Overview & Core Philosophy

Most competitive programming and algorithmic practice platforms operate on a disconnected, single-user loop: a participant navigates a static catalog of problems, selects an individual task, works in isolation without time pressure or stakes, runs test cases, submits, and exits. This traditional archive-centric paradigm fosters individual problem-solving but completely misses the adrenaline, community synchronization, and competitive intensity of real-time sports.

**DETOX Code** fundamentally re-imagines competitive programming as a **Synchronous, Event-Driven Community Arena**. The platform does not position itself as an infinite static problem bank. Instead, it is architected around scheduled, timed coding events—anchored by **"Today's Challenge"**—where community members gather, check in, enter a locked and monitored coding workspace simultaneously, solve algorithmic problems under a live synchronized countdown clock, and compete for ranks on a live-updating leaderboard.

To make timed community competitions fair, authoritative, and secure, DETOX Code enforces three foundational engineering principles:
1. **Zero-Trust Untrusted Code Execution**: Participant code is untrusted arbitrary software. Submissions are never executed on the web application server; they are queued asynchronously and dispatched into isolated, resource-constrained sandbox enclaves that enforce strict CPU, memory, process, and execution time boundaries.
2. **Deterministic, Idempotent Evaluation & Scoring**: Test cases are evaluated with millisecond precision against standardized input/output streams. Scoring is calculated dynamically through mathematical decay functions that reward rapid correctness while penalizing failed attempts, guaranteeing identical score outputs for identical submission sequences.
3. **Comprehensive Client-Side Integrity Signals**: The browser workspace is not a casual notepad; it is an active proctored environment. The platform captures and streams telemetry—including fullscreen locks, tab switches, window blur events, and copy-paste limits—providing contest organizers with actionable integrity metrics to deter casual cheating and ensure fair community competition.

---

## The Complete End-to-End Challenge Lifecycle Narrative

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                             THE CONTINUOUS CHALLENGE STORY                                              │
│                                                                                                                         │
│  [1. Discovery]          [2. Check-In Lobby]        [3. Synchronized Start]    [4. Proctored Coding Workspace]           │
│  "Today's Challenge"  ─▶ Pre-Event Registration ──▶ Global Clock Sync       ──▶ Monaco Editor / 11 Language Runtimes     │
│  Upcoming Event Pool     Participant Profile Seed   State: LIVE                 Fullscreen Lock & Tab-Blur Telemetry    │
│                                                                                                   │                     │
│                                                                                                   ▼                     │
│  [8. Final Archive]      [7. Live Scoreboard]       [6. Verdict & Scoring]     [5. Queue & Isolated Judge]              │
│  Ratings & Badges     ◀── Real-Time SSE Stream   ◀── Dynamic Score Function ◀── Redis `judge:queue` ──▶ Piston Worker   │
│  Audit Integrity Log     ZADD Ranked Leaderboard    Time Decay & Attempt Pen.   11 Runtimes / Resource Boundary Limits  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

The entire system functions as a continuous story with tightly controlled state transitions across both the challenge and the participant:

### 1. Discovery & Registration
Every challenge begins in the `SCHEDULED` state. Organizers define the challenge metadata: title, description, start timestamp, duration, problem set, point allocations, and difficulty distributions. When the registration window opens (`REGISTRATION_OPEN`), users log into their DETOX accounts and register for the upcoming event. The system provisions a participant session record, links the user to the contest roster, and presents a live countdown timer ticking down to the exact second of contest kickoff.

### 2. Synchronized Event Start (`LIVE`)
When the global contest timestamp is reached, an automated scheduler triggers an atomic state transition to `LIVE`. The participant's browser transitions seamlessly from the countdown lobby into the **Dedicated Timed Workspace**. The contest timer initializes against authoritative server time (preventing client clock tampering).

### 3. Focused Proctored Coding Workspace
Inside the workspace, the participant is presented with a three-pane responsive layout:
- **Left Pane**: Rich Markdown problem statement, input/output specifications, mathematical constraints, sample test cases, and problem selection tabs.
- **Right Pane**: Embedded **Monaco Editor** equipped with syntax highlighting, automatic indentation, bracket matching, and a language selector supporting 11 runtimes (Python, C, C++, Java, JavaScript, TypeScript, Go, Rust, C#, Kotlin, SQLite).
- **Bottom Pane**: Interactive test console, execution stdout/stderr logs, and verdict feedback cards.

Simultaneously, the **Integrity Signal Tracker** activates:
- The user is prompted to enter **Fullscreen Mode**.
- Window `blur`, document `visibilitychange`, and tab switches are intercepted and timestamped.
- External paste operations into the editor are intercepted; only internal clipboard operations within the workspace are permitted.
- Any integrity event is logged locally and asynchronously dispatched via `POST /api/challenges/:id/telemetry` to build a verifiable integrity timeline for organizers.

### 4. Sample Testing & Local Dry-Run
Before submitting, participants can test their algorithm against public sample test cases. Clicking **"Run Sample Tests"** sends an ephemeral execution request. The engine compiles and executes the code against sample inputs, returning the output and execution time in milliseconds without registering an official submission or applying penalty scores.

### 5. Submission Ingestion & Redis Queue Dispatch
When the participant clicks **"Submit Solution"**, the frontend issues a `POST /api/submissions` request. The Backend Submission Service:
1. Verifies that the contest is currently `LIVE` and the submission window has not expired.
2. Generates a unique, cryptographically secure `jobId` (`job-<uuid>`).
3. Persists an initial `Submission` record in PostgreSQL with status `QUEUED`.
4. Assembles the job payload containing the code, language identifier, problem resource limits (`timeLimitMs`, `memoryLimitKb`), and the full suite of test cases (both public samples and hidden judge test cases).
5. Enqueues the job onto Redis list `judge:queue` using an atomic `LPUSH`.

### 6. Isolated Sandbox Execution & Verdict Resolution
On the judging cluster, background Judge Workers poll `judge:queue` using atomic `BRPOPLPUSH` into `judge:processing` to guarantee zero message loss even if a worker crashes. The worker forwards the payload to the self-hosted **Piston Sandbox**:
- The untrusted code is placed in an isolated, unprivileged container with dropped network access, memory limits, and process count limits.
- For compiled languages (C, C++, Java, Rust, Go, C#, Kotlin), the code is compiled within the sandbox. If compilation fails, the worker immediately returns `Compilation Error` with compiler stderr.
- The compiled binary or script is executed sequentially against each test case.
- For each test case, output is normalized (stripping trailing CRLF/whitespace) and compared against the expected output.
- Execution metrics (execution time, peak memory, exit code) are monitored. If the process exceeds `timeLimitMs`, it is killed with `SIGKILL` and assigned `Time Limit Exceeded`. If it exceeds memory limits, it is assigned `Memory Limit Exceeded`. If it exits with non-zero status or segfaults, it is assigned `Runtime Error`.
- If all test cases pass, the final verdict is `Accepted`. If any test case fails, execution stops immediately and returns `Wrong Answer` with the index of the failing test case.
- The completed verdict is recorded in Redis at `judge:result:<jobId>` with an expiration TTL, and the job is acknowledged and removed from `judge:processing`.

### 7. Real-Time Result Streaming & Dynamic Scoring
The backend receives the completed verdict and performs atomic state settlement:
1. Updates the `Submission` row in PostgreSQL with the final verdict, execution time, and memory consumption.
2. Emits a Server-Sent Event (SSE) or WebSocket message to the participant's browser, replacing the loading spinner with the verdict badge (`Accepted`, `Wrong Answer`, etc.).
3. If the verdict is `Accepted` and the problem has not been previously solved by this participant:
   - Calculates the problem score using the contest decay formula:
     $$\text{Score} = \max\left(\text{FloorPoints}, \text{BasePoints} \times \left(1 - \frac{\text{TimeElapsed}}{\text{TotalContestDuration}} \times \text{DecayRate}\right) - (\text{FailedAttempts} \times \text{AttemptPenalty})\right)$$
   - Updates the participant's total challenge score and penalty time.
   - Pushes the updated score to Redis Sorted Sets (`ZADD challenge:leaderboard:<challengeId> <score> <userId>`).
   - Broadcasts the updated leaderboard rank delta to the public live contest scoreboard.

### 8. Challenge Closure, Integrity Audit & Archiving
When the contest timer reaches zero:
1. The challenge state transitions to `SUBMISSION_CLOSED`. Any in-flight submissions are drained and evaluated, while new submissions are strictly rejected.
2. Organizers review the **Integrity Audit Dashboard**, which lists participants flagged for excessive tab switching, focus loss, or suspicious submission clusters.
3. Organizers confirm or disqualify flagged entries, and trigger **"Publish Results"**, transitioning the event to `FINISHED`.
4. Final standings are locked and archived. Global user ratings, problem-solving streaks, and achievement badges are calculated and updated on user profile pages.

---

## Architectural Decomposition into 8 Production Subsystems

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   8 PRODUCTION SUBSYSTEMS                                      │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Subsystem 1] Persistent Relational Data Layer (PostgreSQL + Prisma ORM)                       │
│ [Subsystem 2] Authentication, Session Guard & User Profiles (JWT + Argon2)                     │
│ [Subsystem 3] Challenge Orchestration & Lifecycle State Machine Engine                         │
│ [Subsystem 4] In-Browser Proctored Coding Workspace (Next.js / Monaco / Timer)                 │
│ [Subsystem 5] Backend Submission Ingestion & Redis Dispatch Pipeline                           │
│ [Subsystem 6] Online Judge Execution Engine & Multi-Language Piston Sandbox                    │
│ [Subsystem 7] Dynamic Scoring Engine & Live Real-Time Leaderboard (Redis Sorted Sets + SSE)    │
│ [Subsystem 8] Client-Side Integrity Signal Collector & Organizer Audit Studio                  │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Subsystem 1: Persistent Relational Data Layer
- **Engine**: PostgreSQL 16
- **ORM / Migrations**: Prisma ORM with strict type generation
- **Core Entities**:
  - `User`: `id` (UUID), `username` (unique), `email` (unique), `passwordHash`, `role` (`PARTICIPANT` | `ADMIN`), `rating`, `createdAt`
  - `Problem`: `id`, `slug` (unique), `title`, `statement` (Markdown), `difficulty` (`EASY` | `MEDIUM` | `HARD`), `basePoints`, `timeLimitMs`, `memoryLimitKb`, `isPublished`, `tags`, `createdAt`
  - `TestCase`: `id`, `problemId`, `input` (Text), `expectedOutput` (Text), `isSample` (Boolean), `points`, `orderIndex`
  - `Challenge`: `id`, `slug` (unique), `title`, `description`, `startTime`, `endTime`, `durationMinutes`, `status` (`DRAFT` | `SCHEDULED` | `REGISTRATION_OPEN` | `LIVE` | `SUBMISSION_CLOSED` | `FINISHED` | `ARCHIVED`), `decayRate`, `penaltyPerWrongAttempt`
  - `ChallengeProblem`: `challengeId`, `problemId`, `orderIndex`, `pointMultiplier`
  - `ChallengeParticipant`: `challengeId`, `userId`, `registeredAt`, `score`, `penaltyTimeMs`, `rank`, `isDisqualified`
  - `Submission`: `id`, `challengeId`, `problemId`, `userId`, `language`, `code`, `status` (`QUEUED` | `PROCESSING` | `EVALUATED`), `verdict` (`ACCEPTED` | `WRONG_ANSWER` | `TIME_LIMIT_EXCEEDED` | `MEMORY_LIMIT_EXCEEDED` | `COMPILATION_ERROR` | `RUNTIME_ERROR` | `JUDGE_ERROR`), `executionTimeMs`, `memoryUsedKb`, `failedTestCaseIndex`, `createdAt`
  - `IntegrityEvent`: `id`, `challengeId`, `userId`, `eventType` (`TAB_SWITCH` | `WINDOW_BLUR` | `FULLSCREEN_EXIT` | `PASTE_ATTEMPT`), `metadata` (JSON), `timestamp`

---

### Subsystem 2: Authentication, Session Guard & User Profiles
- Password hashing with **Argon2id** (memory-hard, resistant to GPU attacks).
- Stateless JWT issuance stored in secure, `SameSite=Strict`, `HttpOnly` cookies (or `Authorization: Bearer` headers).
- Role-based access middleware:
  - `authenticate`: Resolves user identity from token and attaches to request context.
  - `requireRole(['ADMIN'])`: Restricts problem authoring and contest lifecycle triggers to organizers.
- User profile APIs: Solved problem counters by difficulty, contest participation history, rating progression, and submission history.

---

### Subsystem 3: Challenge Orchestration & Lifecycle State Machine
- Strict state machine enforcement:
  $$\text{DRAFT} \longrightarrow \text{SCHEDULED} \longrightarrow \text{REGISTRATION\_OPEN} \longrightarrow \text{LIVE} \longrightarrow \text{SUBMISSION\_CLOSED} \longrightarrow \text{FINISHED} \longrightarrow \text{ARCHIVED}$$
- Automated state transitions powered by scheduled cron jobs checking timestamps every 15 seconds.
- Contest entry guard: Validates that participants can only enter the workspace when the challenge status is `LIVE`.
- Submission window enforcement: Rejects any submission attempt where `currentTime > challenge.endTime`.

---

### Subsystem 4: In-Browser Proctored Coding Workspace
- Built with **Next.js 14 / React**, styled with modern vanilla CSS and responsive grid layouts.
- **Monaco Editor Integration**:
  - Full syntax highlighting, error squiggles, and autocompletion for 11 programming languages.
  - Custom dark theme tailored for competitive programming.
  - Dynamic font sizing, tab spacing, and keybinding adjustments (Standard, Vim, Emacs).
- **Synchronized Contest Clock**:
  - Queries server timestamp at workspace initialization and computes network offset.
  - Ticks down locally with millisecond synchronization, flashing warning indicators when under 5 minutes remaining.
- **Problem Statement Viewer**:
  - Renders Markdown and LaTeX math formulas (KaTeX).
  - Copyable sample inputs and outputs with visual diffing on test runs.
- **Interactive Output Console**:
  - Displays test case tabs (Case 1, Case 2, etc.), input data, expected output, actual user output, execution time, and error logs.

---

### Subsystem 5: Backend Submission Ingestion & Redis Dispatch Pipeline
- High-throughput endpoint: `POST /api/challenges/:challengeId/problems/:problemId/submit`
- Atomic database write creating the `Submission` in `QUEUED` state.
- Formats the standardized **Judge Job**:
  ```json
  {
    "jobId": "sub_a9f81d4e-b01c-4b6e-8d77-6f81a0b3e120",
    "language": "python",
    "code": "def solve(): ...",
    "timeLimitMs": 2000,
    "memoryLimitKb": 262144,
    "tests": [
      { "input": "4\n2 7 11 15\n9", "expectedOutput": "0 1", "visibility": "public" },
      { "input": "3\n3 2 4\n6", "expectedOutput": "1 2", "visibility": "hidden" }
    ]
  }
  ```
- Dispatches job to Redis queue `judge:queue` via atomic `LPUSH`.
- Exposes verdict streaming via Server-Sent Events (SSE) at `GET /api/submissions/:jobId/stream`.

---

### Subsystem 6: Online Judge Execution Engine & Sandbox Isolation
- Located in `services/judge/`.
- Implements the contract defined in `docs/judge-engine-contract.md` and `docs/judge-queue-contract.md`.
- Background worker loops on `BRPOPLPUSH judge:queue judge:processing 5`.
- Interacts with self-hosted **Piston** container with language resource overrides.
- Supported Runtimes:
  - Python 3.10.0
  - C (GCC 10.2.0)
  - C++ (GCC 10.2.0)
  - Java 15.0.2
  - JavaScript (Node 18.15.0)
  - TypeScript 5.0.3
  - Go 1.16.2
  - Rust 1.68.2
  - C# (Mono 6.12.0)
  - Kotlin 1.8.20
  - SQL (SQLite 3.36.0)
- Normalizes exit codes, stdout, stderr, and resource constraints into standard verdicts:
  `Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Memory Limit Exceeded`, `Compilation Error`, `Runtime Error`, `Judge Error`.
- Writes output to `judge:result:<jobId>` with 1-hour TTL and acknowledges job from `judge:processing`.

---

### Subsystem 7: Dynamic Scoring Engine & Live Real-Time Leaderboard
- Evaluates scores immediately upon an `Accepted` submission.
- **Decay & Penalty Formula**:
  ```text
  If first accepted solution for user on problem:
      ElapsedMinutes = (SubmissionTime - ContestStartTime) in minutes
      TimeRatio = ElapsedMinutes / ContestDurationMinutes
      DecayedPoints = BasePoints * (1 - (TimeRatio * DecayRate))
      PenaltyDeduction = WrongAttempts * PenaltyPerWrongAttempt
      EarnedPoints = Max(FloorPoints, DecayedPoints - PenaltyDeduction)
      UserScore += EarnedPoints
      UserPenaltyTime += ElapsedMinutes + (WrongAttempts * PenaltyMinutes)
  ```
- **Redis Sorted Set Ranking**:
  - `ZADD challenge:leaderboard:<challengeId> <CompositeScore> <userId>`
  - Composite score encodes points and tie-breaking penalty time:
    $$\text{ScoreKey} = (\text{TotalPoints} \times 10^{10}) + (10^9 - \text{TotalPenaltySeconds})$$
  - `ZREVRANGE challenge:leaderboard:<challengeId> 0 -1 WITHSCORES` returns the instant, live leaderboard in O(log N + M) time.
- Leaderboard Broadcast: Emits SSE event to all connected dashboard clients whenever rank changes occur.

---

### Subsystem 8: Complete Anti-Cheat & Client-Side Integrity Engine

The anti-cheat subsystem guarantees contest fairness through a multi-layered browser-level integrity protocol:

#### 1. Entry Screen Access & Fullscreen Lock Workflow
- **Access Authorization Modal**: When a participant enters an active challenge, the workspace displays a high-priority prompt: *"Grant Fullscreen & Proctored Screen Access"*.
- **Forced Fullscreen Transition**: Upon accepting, the client requests `document.documentElement.requestFullscreen()`, locking the browser interface and suppressing window chrome.
- **Escape Key Intercept & Exit Warning**:
  - If the user presses `Escape` or attempts to exit fullscreen, the default exit behavior is intercepted.
  - A modal locks the editor: *"Warning: Leaving fullscreen will forfeit your attempt. Do you want to exit the challenge?"*
  - If confirmed (or if the user forces browser close), a termination event is dispatched to the backend API (`POST /api/challenges/:id/terminate`) tagged with their unique `userId`.
  - The backend records the session as either **`TERMINATED`** or **`SUBMITTED`** (auto-evaluating their latest saved code).

#### 2. 10-Second Idle Pause Local Auto-Save (Snapshot Versioning)
- **Anti-Spam Local-First Persistence**: To prevent flooding the backend with network requests on every keystroke, code changes are debounced.
- **10-Second Idle Trigger**: When the user pauses typing for **10 continuous seconds**, the workspace captures a snapshot of the entire editor buffer and saves an incremental version into `localStorage` / `IndexedDB` (`kiln_code_v_{timestamp}`).
- **Crash Recovery Grace Period**: If the browser unexpectedly crashes or internet flickers, the participant has a 60-second grace window to re-enter. The editor automatically restores the last 10-second local snapshot without loss of code.

#### 3. Smart Backward-Matching Internal Clipboard Restrictor
- **External Paste Interception**: The `paste` event is intercepted at the Monaco Editor and document level.
- **Backward Codebase Matching**: The pasted text is matched backwards against the participant's active document buffer and an in-memory `internalCopyHistory[]` ring buffer.
- **Zero-Tolerance Mismatch**: If even a single character or token was copied from an external window (ChatGPT, IDE, browser, text file), the pasted content is **instantly deleted and rejected**, displaying an alert: *"External pasting is prohibited. Only code copied within this workspace is allowed."*
- **Internal Duplication Allowed**: If the user selected code within the current workspace (such as duplicating a loop, helper function, or variable) and pressed `Ctrl+C`, the text is validated against `internalCopyHistory[]` and successfully pasted.

#### 4. Dual-Monitor & Window Blur Telemetry (3-Strike System)
- **Blur & Visibility Tracking**: Listens for `window.addEventListener('blur')` and `document.addEventListener('visibilitychange')` to catch participants clicking outside fullscreen on secondary monitors or switching tabs.
- **3-Strike Escalation Protocol**:
  - **Strike 1**: Warning modal + visual red border (*"Strike 1/3: Focus lost. Return to workspace immediately."*)
  - **Strike 2**: Severe warning (*"Strike 2/3: Next violation will terminate your contest attempt."*)
  - **Strike 3**: Immediate lock; the session triggers an automated termination request, auto-submits current code, and flags the account as `TERMINATED`.

#### 5. Developer Tools & Context Menu Suppression
- **Right-Click Block**: Suppresses `contextmenu` to prevent inspect element and contextual paste.
- **Keybinding Guard**: Intercepts and disables inspection shortcuts: `F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, and `Ctrl+U`.

#### 6. Keystroke Cadence & Virtual Injection Detector
- Analyzes typing velocity. If more than 30 characters appear in under 50 milliseconds without an internal paste trigger (indicating an AutoHotkey script or browser bot simulating typing), the injected block is purged and a warning strike is logged.

---

## 5. Master Roadmap & Phased Execution Plan

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PHASED IMPLEMENTATION PLAN                                   │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Phase 1: Persistence & Database Schema (PostgreSQL + Prisma Setup)                            │
│  Phase 2: Authentication & Authorization Microservice (Argon2 + JWT)                           │
│  Phase 3: Connect Backend to Judge Queue (Submission Endpoint + Redis Worker Producer)         │
│  Phase 4: Challenge Engine & Lifecycle State Machine                                           │
│  Phase 5: In-Browser Proctored Coding Workspace (Next.js + Monaco Editor + Timer)              │
│  Phase 6: Scoring Algorithm & Live Redis Leaderboard                                           │
│  Phase 7: Integrity Telemetry & Organizer Audit Dashboard                                      │
│  Phase 8: End-to-End Test Suite, Docker Compose Unification & Production Polish                 │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```
