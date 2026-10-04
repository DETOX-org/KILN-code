# Architectural Overview - DETOX Code

> **Status**: Early Concept & Setup Stage. The technical stack and detailed subsystem specifications are subject to architectural RFC approval.

---

## 1. Executive Summary

**DETOX Code** is a competitive programming platform designed specifically for community-hosted, time-bound coding challenges. Unlike traditional problem archives, DETOX Code revolves around event-driven coding challenges, fixed-duration execution windows, automated evaluation via an online judge, and community leaderboards.

---

## 2. Conceptual System Architecture

The project directory structure represents the core decoupling boundaries:

```text
Detox-Code/
├── frontend/    # User Interface & Participant Environment
├── backend/     # Core Platform API, Event Orchestration, User & Score Management
├── judge/       # Isolated Code Execution & Evaluation Engine
└── shared/      # Shared Domain Contracts, DTOs, and Protocol Schemas
```

### High-Level Component Relationship

```text
┌─────────────────────────────────────────────────────────┐
│                      Participant                        │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 frontend/ (Web Client)                  │
│  - Event Dashboard    - Timed Code Editor               │
│  - Leaderboard View   - Integrity Signal Tracker        │
└────────────────────────────┬────────────────────────────┘
                             │ (HTTPS / WebSocket)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 backend/ (Platform API)                 │
│  - Challenge State Engine  - Scoring & Leaderboard      │
│  - User & Profile Service  - Judge Job Producer         │
└────────────────────────────┬────────────────────────────┘
                             │ (Async Message / Queue)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  judge/ (Online Judge)                  │
│  - Isolated Sandbox Enclave                             │
│  - Language Compilers & Executors                       │
│  - Test Case Assessor & Verdict Engine                  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Core Component Responsibilities

### 3.1 Frontend (`frontend/`)
- **Participant Coding Workspace**: Code editor, problem statement rendering, multi-language selector, countdown timers.
- **Challenge Portal**: "Today's Challenge", event registration, real-time leaderboard rendering.
- **Integrity Signal Collector**: Focus switch monitoring, full-screen events, copy-paste limits (client-side telemetry reported to backend).

### 3.2 Backend API (`backend/`)
- **Challenge Lifecycle Management**: Controls event states (`Upcoming` -> `Live` -> `Finished` -> `Archived`).
- **Submission Dispatcher**: Queues evaluation jobs for the Online Judge upon submission.
- **Scoring & Leaderboard Engine**: Computes participant scores based on correctness, time taken, attempts, and penalty rules.
- **Authentication & User Profiles**: Manages participant identities, statistics, and event history.

### 3.3 Online Judge (`judge/`)
- **Sandbox Execution**: Executes untrusted participant code inside secured, resource-constrained environments (CPU, Memory, Process limiters).
- **Verdict Generation**: Evaluates output against problem test cases (`Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Memory Limit Exceeded`, `Runtime Error`, `Compilation Error`).
- **Security & Isolation**: Protects underlying infrastructure against malicious system calls or network access.

### 3.4 Shared Layer (`shared/`)
- **API Data Contracts**: Standardized DTOs and API payload specifications.
- **Verdict & Status Enums**: Common domain constants shared between Backend, Judge, and Frontend.
- **Protocol Schemas**: Shared event definitions for async messaging.

---

## 4. Key Architectural Goals & Principles

1. **Strict Decoupling**: Frontend, Backend, and Judge must remain decoupled so components can scale or be refactored independently.
2. **Security-First Judge**: The execution sandbox must assume all participant submissions are potentially untrusted.
3. **Event-Driven Resilience**: Challenge time limits and submission spikes require asynchronous job queuing and non-blocking evaluation pipelines.
4. **Technology Stack Neutrality**: Architecture boundaries are defined by interface contracts rather than specific language choices at this early stage.
