# End-to-End System & User Flows
**KILN-Code / DETOX Architecture Version 2.0**

---

## Flow 1: Admin Problem Creation with Grading-Type & Execution Engine Routing

```mermaid
graph TD
    A[Admin Opens 'Create Problem'] --> B[Enter Basic Info: Title, Slug, Statement, Difficulty, Time/Memory Limits]
    B --> C[Select 'Grading Type']
    C -->|Option A: Standard Diff| D1[Configure Test Cases: Input / Expected Output pairs]
    C -->|Option B: Custom Checker| D2[Upload Checker Source e.g. testlib C++ / Python]
    C -->|Option C: Subtask IOI| D3[Configure Subtasks & Points Distribution]
    D3 --> D31[Subtask 1: Points e.g. 30 pts, Constraints description, Assigned Test Cases]
    D3 --> D32[Subtask 2: Points e.g. 70 pts, Constraints description, Assigned Test Cases]
    D1 & D2 & D32 --> E[Select Execution Engine Target: Judge0 / Piston / Isolated Worker]
    E --> F[Preview Problem & Run Verification Test]
    F --> G[Publish Problem]
```

### Key UI Decisions:
- When **Subtask-Based** is selected, the Test Case manager switches to group-by-subtask mode. Total problem points automatically sum the subtask points (e.g. 30 + 70 = 100).
- Execution engine defaults to `judge0` for sandboxed multi-language reliability.

---

## Flow 2: Student Submission & Subtask Breakdown Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Workspace (Next.js)
    participant API as Backend API
    participant Judge as Judge Worker (Judge0)
    participant DB as PostgreSQL

    Student->>UI: Clicks 'Submit Solution' (Subtask Problem)
    UI->>API: POST /api/submissions {problem_id, language, code}
    API->>DB: INSERT into submissions (status='pending', grading_type='subtask_ioi')
    API->>Judge: Push job to submission queue
    UI->>Student: Shows 'Judging Subtasks...' animated progress
    Judge->>Judge: Run tests grouped by Subtask 1, Subtask 2...
    Note over Judge: Subtask score awarded if and only if ALL tests in subtask pass
    Judge->>API: Result {total_score: 70, subtasks: [{id: 1, passed: false, score: 0}, {id: 2, passed: true, score: 70}]}
    API->>DB: UPDATE submissions, INSERT submission_subtask_results
    API-->>UI: WebSocket event: submission_completed
    UI->>Student: Renders Subtask Breakdown View (Points, pass/fail chips, runtime, memory)
```

---

## Flow 3: Contest Finalization & Dual-Run Verification Flow (Narrow Trigger)

```mermaid
graph TD
    A[Contest Ends: Server Timer Reaches Zero] --> B[Contest Leaderboard Freezes]
    B --> C[Finalization Job Triggered: Select Top-N Submissions e.g. Top 10]
    C --> D[Run Dual-Run Verification: Primary Judge0 vs Verification Piston]
    D --> E{Do Both Engines Agree On Verdict & Score?}
    E -->|YES: Concordance| F[Mark Submission as 'Verified ✓' in DB]
    F --> G[Leaderboard Confirmed & Contest Officially Finalized]
    E -->|NO: Discrepancy Found| H[Set discrepancy_flag = TRUE, verification_engine = 'piston']
    H --> I[Route to Admin Discrepancy Review Queue]
    I --> J[Admin / Staff Inspects Side-by-Side Diff: stdout, time, compiler flags]
    J --> K{Staff Decision}
    K -->|Confirm Primary| L1[Approve Primary Verdict]
    K -->|Accept Verification| L2[Override with Verification Verdict]
    K -->|Re-judge| L3[Trigger Clean Isolated Re-run]
    L1 & L2 & L3 --> M[Record in AuditLog, Award 'Verified ✓', Finalize Standings]
```

### Crucial Invariants:
1. **No ongoing A/B routing**: Regular practice and live contest submissions run on the standard execution engine (`judge0`).
2. **Narrow Trigger**: Dual-run is exclusively fired during the contest finalization phase for top contenders.
3. **Trust Seal**: Only submissions that have passed dual-run verification earn the **"Verified ✓"** trust badge.

---

## Flow 4: Strict Assessment Session with Silent Discrepancy Handling

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Client as Assessment UI
    participant Backend as Assessment API
    participant Staff as Admin / Proctor Queue

    Note over Student, Client: Student begins 60-min timed assessment
    Student->>Client: Clicks 'Submit Solution'
    Client->>Backend: POST /api/submissions
    Backend->>Backend: Runs evaluation
    alt Evaluation succeeds with no discrepancy
        Backend-->>Client: Returns Score & Result normally
    else Dual-run / background audit detects discrepancy
        Backend->>Backend: Set discrepancy_flag = TRUE
        Backend->>Staff: Pushes alert to Admin Discrepancy Queue
        Note over Backend, Client: Discrepancy is SILENT to student!
        Backend-->>Client: Returns Primary score seamlessly (No warnings, no panic)
        Staff->>Staff: Reviewer verifies code & adjusts score post-exam if needed
    end
```
