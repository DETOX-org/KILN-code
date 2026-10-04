# DETOX Code Project Roadmap

> **Status**: Early Concept & Planning Phase  
> **Last Updated**: August 2026

This document outlines the planned development phases for DETOX Code. It clearly distinguishes between immediate technical priorities and long-term community features.

---

## Development Phases

### Phase 0: Project Setup & Repository Infrastructure *(Current Phase)*
- [x] Initial repository structure definition (`frontend/`, `backend/`, `judge/`, `shared/`)
- [x] Open-source governance documentation (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`)
- [x] Issue & Pull Request templates configuration
- [x] Repository configuration (.gitignore, .editorconfig, repository-validation CI)
- [ ] License selection by project maintainers

### Phase 1: Architecture & Technology Stack Selection *(Next Step)*
- [ ] Community RFC for Backend language/framework selection
- [ ] Community RFC for Frontend framework & UI design system
- [ ] Online Judge sandbox architecture definition & security requirements
- [ ] Shared domain model and API contract specification (`shared/`)

### Phase 2: Core Platform Baseline & Authentication
- [ ] User registration, login, and community profile management
- [ ] Basic problem schema and admin management interface
- [ ] "Today's Challenge" event model & state machine (`Upcoming`, `Live`, `Finished`)
- [ ] Initial frontend shell and challenge detail view

### Phase 3: Online Judge Engine & Execution Pipeline
- [ ] Isolated sandbox runner prototype (Docker / container / micro-vm security boundary)
- [ ] Multi-language compilation & execution pipeline (e.g. Python, C++, Java, JS/TS)
- [ ] Test case evaluation & verdict engine (`Accepted`, `WA`, `TLE`, `MLE`, `RE`, `CE`)
- [ ] Async job queue integration between Backend API and Judge

### Phase 4: Timed Challenge Environment & Integrity Signals
- [ ] Dedicated participant coding workspace with live countdown timer
- [ ] Real-time submission status updates
- [ ] Client-side integrity signal collection (focus switch detection, full-screen mode, copy/paste limits)
- [ ] Event submission window enforcement

### Phase 5: Scoring System, Leaderboards & Community Features
- [ ] Time-weighted and attempt-weighted scoring algorithm
- [ ] Real-time event leaderboard rendering
- [ ] Post-challenge analytics & participant performance history
- [ ] Community ratings, achievements, and badges

---

## Future Ideas & Explorations

*The following features are under conceptual evaluation and subject to future RFCs:*

- **Code Replay & Time-Lapse Visualizer**: Replaying participant solution construction post-challenge for learning.
- **AI Code Review & Optimization Insights**: Automated post-event feedback on code efficiency and complexity.
- **Team-Based Competitive Challenges**: Multi-participant relay or pair-programming challenge modes.
- **Custom Community Events**: Allowing community members to host private or custom challenges with custom problem sets.
- **Anti-Plagiarism & Code Similarity Detection**: AST-based code comparison across challenge submissions.
