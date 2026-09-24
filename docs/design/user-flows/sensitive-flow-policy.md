# Sensitive-Flow & Assessment Policy Specification
**Document Version**: 2.0 (Updated Post Architecture Review)  
**Owners**: UI/UX Team (Samiksha Patil, Pankhuri Govila, Avishek)  
**Audience**: Frontend, Backend, Assessment Proctors, Academic Staff

---

## 1. Executive Summary & Core Philosophy

Monitored assessments and competitive events inherently create user anxiety. The guiding UI/UX principle of KILN-Code is **clarity, dignity, and transparency**:
- Monitoring tools exist to provide high-signal audit trails, **never automatic proof of wrongdoing**.
- Student interfaces describe concrete system events (e.g. "fullscreen exited"), **never punitive intent or accusations**.
- **Crucial Architectural Rule**: **Discrepancies during an assessment or contest session (e.g. verification engine divergence or late-arriving results) stay completely invisible to the student.** The student's workspace remains uninterrupted and smooth. Discrepancies are queued strictly for staff review in the Admin Discrepancy Queue.

---

## 2. The Silent Discrepancy Rule

### 2.1 The Problem
When a dual-run or contest-finalization verification check flags a discrepancy (for example, Primary Engine `judge0` returns `Accepted (42ms)` while Verification Engine `piston` returns `Time Limit Exceeded` on test case #14 due to compiler divergence), alerting the student in real-time induces panic, breaks cognitive focus, and is impossible for a student to resolve mid-test.

### 2.2 The UX Policy
1. **Zero Real-time Student Exposure**:
   - The student only sees the primary evaluation verdict or a graceful "Evaluation complete" state.
   - No error banners, "Mismatch detected" warnings, or discrepancy badges are rendered to the student.
2. **Staff-Only Visibility**:
   - The submission has its `discrepancy_flag` set to `TRUE` in the database.
   - The submission is instantly routed to the **Admin Discrepancy Review Queue**.
   - Staff proctors and instructors inspect the side-by-side execution trace (stdout/stderr, CPU, memory, compiler flags) without the student ever knowing an audit is taking place.
3. **Late-Arriving Reconciliation**:
   - In contest finalization, verification runs asynchronously for qualifying top-of-leaderboard submissions.
   - If a mismatch occurs, the leaderboard status shows normal contest freeze / "Pending Finalization" status.
   - Once staff reviews and confirms or overrides the verdict, the leaderboard updates with the final authoritative score and awards the **"Verified ✓"** badge.

---

## 3. Pre-Assessment Consent & Environment Verification Flow

Before entering any strict-mode assessment or timed challenge, participants must progress through a mandatory 4-step readiness check:

```
Step 1: Rules & Integrity Disclosure 
   → Step 2: Browser & Fullscreen Capability Check 
   → Step 3: Camera & Presence Check (Local Preview only)
   → Step 4: Final Consent & Server Time Sync → Enter Workspace
```

### 3.1 Plain-Language Consent Disclosures
- **Camera Presence**: *"We check that a single person is facing the screen. No continuous video is streamed or saved to our servers — only presence timestamps and event risk signals are logged."*
- **Window & Focus Monitoring**: *"The assessment is conducted in fullscreen. Leaving fullscreen, switching tabs, or switching application focus generates a timestamped event."*
- **Clipboard Restrictions**: *"Copy, paste, and cut shortcuts are disabled within the code editor during the test to encourage authentic problem solving."*
- **Server Authority**: *"The countdown timer is authoritative on our server. Closing your tab or losing network connection does not pause or extend the remaining time."*

---

## 4. In-Session Progressive Warning Architecture

To avoid false-positive panic, violations follow a 3-tier progressive warning policy:

| Tier | UI Presentation | Student Message | System Action |
| :--- | :--- | :--- | :--- |
| **Warning 1** | Subdued Amber Banner (top of editor) | **🟡 Warning 1 of 3 — Fullscreen exited.** Staying in fullscreen keeps your session uninterrupted. | Log timestamped `IntegrityEvent`; reset focus. |
| **Warning 2** | Prominent Orange Banner + Sound Chime | **🟠 Warning 2 of 3 — Focus lost.** Another event will automatically submit your work to protect contest integrity. | Log `IntegrityEvent`; capture snapshot if enabled. |
| **Warning 3** | Modal Dialog + Graceful Freeze | **🔴 Assessment Auto-Submitted.** Your latest code has been securely saved and submitted at 14:32:05. | Lock editor; submit answers; tag for human proctor review. |

> [!NOTE]
> The violation threshold (default: 3) is configurable per assessment by the instructor or contest administrator.

---

## 5. Human-in-the-Loop Proctoring Rules

1. **No Consequential Decision is Automated**:
   - An auto-submission due to warning limit does not automatically award zero points or disqualify the student.
   - The instructor dashboard highlights the submission with an `Integrity Review Required` flag alongside the evidence timeline.
   - Human proctors can choose: **Accept Submission**, **Allow Retake**, or **Apply Penalty**.
2. **Data Retention & Privacy**:
   - Integrity event timelines are retained for 30 days post-contest and automatically archived.
   - Presence logs are strictly restricted to authenticated course instructors and platform administrators.
