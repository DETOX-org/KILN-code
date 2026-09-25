# DETOX Code (KILN-Code) — Comprehensive System Documentation

## Executive Summary
DETOX Code (KILN-Code) is an enterprise competitive coding battleground and proctored technical evaluation platform built with a high-contrast industrial aesthetic, a native multi-language compiler sandbox, an Admin Challenge Configurator, a unique Session ID deployment flow, and an atomic single-write database persistence engine (Firebase Firestore + local persistent fallback).

---

## Architecture Specification

### 1. Admin Command Portal (`frontend/admin.html` + `frontend/js/admin.js`)
- **Challenge Configurator**: Enables administrators to define DSA challenge specifications (Title, Difficulty, CPU Limit, RAM Limit, Markdown Statement).
- **Dynamic Test Case Builder**: Configures public sample test cases and hidden judge benchmark test cases.
- **Proctoring Rules**: Toggles fullscreen lock, external paste blocking, 10s idle snapshot autosave, and maximum violation strikes (default: 3).
- **Unique Session Generation**: Generates `KILN-XXXX` unique IDs with direct invite URLs (`/?session=KILN-XXXX`).
- **Single Atomic Write**: Compiles the entire session into a single metadata document and writes it in one atomic transaction to Firebase Firestore (`challenges` collection) and local persistent storage.
- **Live Audit Dossier Inspector**: Renders coder submissions, scores, execution times, strikes, and expandable anti-cheat telemetry violation timelines.

### 2. Arena Workspace & Dynamic Onboarding (`frontend/index.html` + `frontend/js/anticheat.js`)
- **Lobby Entry Flow**:
  - Participant enters Warrior Callsign (persisted in `localStorage`).
  - Participant enters Session ID (`KILN-XXXX`), auto-filled from `?session=...` URL parameter if provided.
- **Dynamic Ingestion**:
  - Queries `GET /api/sessions/:sessionId`.
  - Ingests problem title, statement, resource boundaries, public sample test cases, and anti-cheat rules.
- **Proctored Coding Workspace**:
  - Code editor with line numbering, cursor tracking, language syntax templates (Python, C++, JS, TS).
  - Terminal console with test case pills and runner.

### 3. Anti-Cheat Surveillance Suite
- **Fullscreen Lock**: Monitored via `fullscreenchange`. Exiting fullscreen triggers a violation strike.
- **Window Blur & Focus Intercept**: Monitored via `window.onblur`. Focus lost to external monitors/apps triggers a strike.
- **Tab Switching**: Monitored via `document.visibilitychange`. Tab switching triggers a strike.
- **Reverse-Clipboard Integrity**: Compares clipboard text against internal copy buffer. External pastes are blocked and wiped, triggering a strike.
- **Virtual Keystroke & Bot Cadence Guard**: Detects bursts (>40 characters in <60ms).
- **DevTools Blocking**: Suppresses F12, Ctrl+Shift+I/J/C, Ctrl+U.
- **10-Second Idle Debounce Snapshot**: Records local code history without firing redundant network requests.
- **3-Strike Disqualification**: Escalates through visual strike pips in the HUD. The 3rd strike disqualifies the participant and immediately triggers a single atomic write to the database.

### 4. Native Compiler Sandbox (`backend/src/services/compiler.service.ts`)
- **Supported Runtimes on Windows**:
  - Python 3.13 (`python`)
  - C++20 via MinGW GCC 15.2 (`D:\mingw64\bin\g++.exe`)
  - JavaScript (`node`)
  - TypeScript (`tsx`)
- **Isolated Execution**: Scripts written to `os.tmpdir()` with CPU time limits, peak memory measurement, and output stream capture.
- **Problem Solution Harnesses**: Automates LeetCode-style class/method invocation and standard CP stdin/stdout execution.

### 5. Atomic Single-Write Database Persistence (`backend/src/services/database.service.ts`)
- **Dual-Mode Engine**: Writes to Firebase Firestore collections (`challenges` & `submissions`) via REST API when credentials are provided; automatically falls back to high-speed local persistent storage.
- **Zero-Network-Flood Design**: Instead of firing requests on every keystroke or blur event, all telemetry and code snapshots are buffered locally and submitted in a **single atomic transaction** upon submission, strike disqualification, or match timeout.

---

## Complete Audit: Component Status Matrix

| Component | Status | Details |
| :--- | :--- | :--- |
| **Native Compiler Sandbox** | ✅ COMPLETED | Tested & verified for Python, C++, Node.js, and TypeScript on Windows. |
| **Admin Command Portal** | ✅ COMPLETED | Challenge builder, dynamic test cases, atomic session generation, live monitor, and audit dossier modal. |
| **Session ID System** | ✅ COMPLETED | `KILN-XXXX` unique code generation, seed sessions, and participant query endpoints. |
| **Lobby Dynamic Loading** | ✅ COMPLETED | Callsign saved locally, Session ID verified, challenge loaded dynamically into workspace. |
| **Anti-Cheat Suite** | ✅ COMPLETED | Fullscreen lock, window blur, tab switch, reverse paste block, bot typing guard, 3-strike disqualification. |
| **Single Atomic Write** | ✅ COMPLETED | Buffers telemetry locally; flushes in single consolidated transaction to `/api/sessions/:sessionId/submit-final`. |
| **Contest Leaderboard** | ✅ COMPLETED | Live standings endpoint with score sorting, verified status, and leaderboard modal. |
| **Next.js Secondary UI** | ⏳ STANDALONE | `frontend/app/` contains rich React components; runs alongside the zero-dependency tactical HUD. |
| **PostgreSQL Migration Driver** | ⏳ SCHEMA READY | Migrations in `database/migrations/` ready for enterprise Postgres deployment if preferred over Firebase. |
| **Distributed Queue (BullMQ)** | ⏳ SCALE READY | Redis BullMQ worker in `services/judge/` ready for Kubernetes/Docker multi-node clustering. |
| **AI Webcam/Audio Proctoring** | 🔮 FUTURE ROADMAP | Documented architecture for gaze estimation and microphone ambient noise analysis. |
