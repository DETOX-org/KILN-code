# DETOX Code

> A competitive coding platform for turning coding practice into timed, community-driven events.

**DETOX Code** is a coding challenge platform being built for the DETOX community. It takes the core idea of competitive programming platforms such as LeetCode and Codeforces, but focuses on **community-hosted, time-bound coding events** rather than simply providing a large problem archive.

The project is intentionally designed to evolve. The current goal is to establish a solid competitive coding foundation and gradually build features around contests, performance, integrity, rankings, and analytics.

---

## Table of Contents

- [Overview](#overview)
- [Core Idea](#core-idea)
- [How It Works](#how-it-works)
- [Core Features](#core-features)
- [Challenge Lifecycle](#challenge-lifecycle)
- [Online Judge](#online-judge)
- [Scoring](#scoring)
- [Leaderboard](#leaderboard)
- [Integrity and Anti-Cheat](#integrity-and-anti-cheat)
- [Participant Experience](#participant-experience)
- [Admin and Challenge Management](#admin-and-challenge-management)
- [Analytics and Future Potential](#analytics-and-future-potential)
- [High-Level Architecture](#high-level-architecture)
- [Major System Components](#major-system-components)
- [Planned Development Phases](#planned-development-phases)
- [Future Ideas](#future-ideas)
- [Project Principles](#project-principles)
- [Status](#status)
- [Contributing](#contributing)

---

## Overview

Most coding practice platforms are designed around an individual workflow:

```text
Open Problem → Solve → Submit → Repeat
```

DETOX Code is designed around a different experience:

```text
Challenge → Participants → Timer → Competition → Results → Ranking
```

The objective is to make coding practice feel more like a **small competitive event within the community**.

A typical challenge may contain one or more coding problems. Participants join the event, enter a dedicated coding environment, solve the problems under a fixed time limit, and submit their solutions. The platform automatically evaluates submissions and records performance information such as correctness, time taken, attempts, and submission time.

At the end of the challenge, participants receive scores and can compare their performance through a leaderboard.

---

## Core Idea

A competitive coding platform for conducting timed coding challenges within the DETOX community.

The platform will have a **Today's Challenge** section where one or more coding problems are published. Participants can join a challenge using their account and enter a dedicated coding environment.

Once the challenge starts, participants have a fixed amount of time to solve the problems directly on the platform.

The coding environment may use measures such as:

- Fullscreen mode
- Restricted copy/paste
- Focus/tab-switch monitoring
- Challenge-specific time limits
- Submission tracking

These mechanisms are intended to discourage external assistance and provide useful integrity signals. They are not intended to claim that cheating is impossible.

Every submission is automatically evaluated using predefined test cases. Along with the verdict, the system can record:

- Execution result
- Time taken
- Number of attempts
- Submission time
- Problem solved
- Language used
- Challenge participation state
- Integrity-related events

After the challenge, a scoring system determines participant performance and a leaderboard can display the results.

---

## How It Works

### Participant Flow

```text
                ┌─────────────────────┐
                │ Today's Challenge   │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │     Join Event      │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ Challenge Starts    │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   Coding Editor     │
                │      + Timer        │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │      Submit         │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │    Online Judge     │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ Record Performance  │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  Score Calculation  │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │     Leaderboard     │
                └─────────────────────┘
```

---

## Core Features

### 1. Today's Challenge

A central section where active or upcoming coding challenges are displayed.

Potential information includes:

- Challenge name
- Description
- Start time
- End time
- Duration
- Number of problems
- Difficulty
- Number of participants
- Challenge status

Possible statuses:

```text
Upcoming → Registration Open → Live → Finished → Archived
```

### 2. Participant Accounts

Participants will eventually be able to create or use community accounts.

Possible profile information:

- Display name
- Username
- Profile statistics
- Challenge history
- Points
- Rating
- Achievements
- Problem-solving statistics

### 3. Timed Coding Environment

Participants solve problems in a dedicated environment containing:

- Problem statement
- Code editor
- Language selector
- Timer
- Run/test functionality
- Submit functionality
- Submission history
- Test results

### 4. Multiple Programming Languages

The platform can eventually support multiple languages through the online judge.

The exact supported languages and execution infrastructure will be determined during implementation.

### 5. Automated Evaluation

Solutions are evaluated against hidden and/or visible test cases.

Possible verdicts include:

```text
Accepted
Wrong Answer
Compilation Error
Runtime Error
Time Limit Exceeded
Memory Limit Exceeded
System Error
```

### 6. Submission History

Participants can see their submissions for a challenge, including relevant information such as:

- Submission time
- Language
- Verdict
- Execution time
- Attempt number

### 7. Performance Scoring

The platform can calculate a challenge score using multiple factors rather than simply counting accepted solutions.

Possible factors:

- Correctness
- Problem difficulty
- Time taken
- Number of attempts
- Completion order

The exact scoring formula is intentionally not finalized yet.

### 8. Leaderboard

The leaderboard can show:

- Rank
- Participant
- Score
- Problems solved
- Time
- Attempts
- Other challenge statistics

It may support both live and final rankings depending on the challenge format.

---

## Challenge Lifecycle

A challenge can follow a controlled lifecycle:

```text
Draft
  ↓
Scheduled
  ↓
Registration Open
  ↓
Live
  ↓
Submission Closed
  ↓
Evaluation Complete
  ↓
Results Published
  ↓
Archived
```

This allows organizers to prepare challenges in advance while keeping the participant-facing experience simple.

---

## Online Judge

The online judge is one of the most important technical components of DETOX Code.

A submission should not execute directly inside the main application server.

A high-level flow is:

```text
Participant
    │
    ▼
Frontend
    │
    ▼
Backend API
    │
    ▼
Submission Service
    │
    ▼
Job Queue
    │
    ▼
Judge Worker
    │
    ▼
Isolated Sandbox
    │
    ├── Compile
    ├── Execute
    ├── Apply Time Limit
    ├── Apply Memory Limit
    └── Run Test Cases
    │
    ▼
Verdict
    │
    ▼
Score / Result Service
    │
    ▼
Participant + Leaderboard
```

### Why Isolation Matters

Participant code is untrusted code. The judge therefore needs strong isolation and resource limits.

Potential controls include:

- Container or sandbox isolation
- CPU limits
- Memory limits
- Execution time limits
- Process limits
- Restricted filesystem access
- Restricted network access
- Controlled compiler/runtime environments

The exact sandbox technology will be selected during implementation.

---

## Scoring

Scoring is intentionally designed as an area that can evolve.

A basic model could be:

```text
Challenge Score = Problem Score + Time Factor - Penalties
```

Where the system may consider:

- Whether the problem was solved
- Difficulty of the problem
- Time required to solve it
- Number of failed attempts
- Completion/submission order

For example, a future scoring model could reward:

```text
Correctness
    +
Difficulty
    +
Speed
    +
Consistency
    -
Failed Attempts
```

The final formula should be designed carefully so that speed is rewarded without making the competition unfair or encouraging poor-quality submissions.

---

## Leaderboard

The leaderboard is the competitive layer of the platform.

A challenge leaderboard could look conceptually like:

| Rank | Participant | Solved | Score | Time |
|------|-------------|--------|-------|------|
| 1 | Participant A | 3/3 | 980 | 18m |
| 2 | Participant B | 3/3 | 940 | 21m |
| 3 | Participant C | 2/3 | 710 | 25m |

The actual ranking fields and scoring rules may evolve.

Potential leaderboard types:

- Live challenge leaderboard
- Final challenge leaderboard
- Daily leaderboard
- Weekly leaderboard
- Monthly leaderboard
- Community leaderboard
- Seasonal leaderboard

---

## Integrity and Anti-Cheat

DETOX Code can include browser-level measures designed to discourage external assistance and record useful integrity signals.

Potential mechanisms include:

- Fullscreen mode
- Paste restrictions
- Copy restrictions
- Focus-loss detection
- Tab/window switching detection
- Challenge timer enforcement
- Submission timestamps
- Suspicious activity logs

### Important Principle

These features should be treated as **integrity mechanisms, not absolute anti-cheat guarantees**.

A browser-based platform cannot reliably prevent every form of external assistance. The goal is to make challenges more controlled, discourage casual cheating, and provide organizers with useful signals for reviewing suspicious sessions.

---

## Participant Experience

The intended experience should be simple.

### Before the Challenge

```text
Browse Challenge
      ↓
Read Rules
      ↓
Join
      ↓
Wait for Start
```

### During the Challenge

```text
Challenge Dashboard
      │
      ├── Timer
      ├── Problem List
      ├── Problem Statement
      ├── Code Editor
      ├── Run
      ├── Submit
      └── Submission History
```

### After the Challenge

```text
Final Submissions
      ↓
Evaluation
      ↓
Score
      ↓
Rank
      ↓
Performance Statistics
```

---

## Admin and Challenge Management

Organizers will eventually need a dedicated administration interface.

Potential capabilities:

- Create challenges
- Edit challenges
- Schedule challenges
- Add problems
- Configure test cases
- Set time limits
- Set memory limits
- Configure supported languages
- Publish/unpublish challenges
- Monitor active participants
- Review submissions
- View challenge results
- Review integrity events
- Publish final leaderboard
- Archive challenges

A problem-management system should eventually support reusable problems rather than forcing organizers to recreate every problem for every challenge.

---

## Analytics and Future Potential

One of the longer-term possibilities is turning challenge data into useful competitive programming analytics.

For each participant, the system could eventually track:

```text
Participant
│
├── Problems Attempted
├── Problems Solved
├── Success Rate
├── Average Solve Time
├── Average Attempts
├── Difficulty Distribution
├── Challenge Performance
├── Improvement Over Time
├── Rating
└── Achievements
```

This could allow DETOX Code to provide insights such as:

- Strongest problem categories
- Weakest problem categories
- Average solve time by difficulty
- Performance trends
- Challenge-to-challenge improvement
- Consistency across contests

This is a potential future direction rather than an MVP requirement.

---

## High-Level Architecture

The system is expected to evolve toward a service-oriented architecture with clear separation between the web application, challenge management, submissions, judging, and scoring.

```text
                         ┌───────────────────┐
                         │      Client       │
                         │ Web / Browser     │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │    API Gateway    │
                         └─────────┬─────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
      ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
      │    Users    │       │ Challenges  │       │ Submissions │
      │   Service   │       │   Service   │       │   Service   │
      └─────────────┘       └─────────────┘       └──────┬──────┘
                                                         │
                                                         ▼
                                                  ┌─────────────┐
                                                  │ Job Queue   │
                                                  └──────┬──────┘
                                                         │
                                                         ▼
                                                  ┌─────────────┐
                                                  │ Judge       │
                                                  │ Workers     │
                                                  └──────┬──────┘
                                                         │
                                                         ▼
                                                  ┌─────────────┐
                                                  │ Sandboxed   │
                                                  │ Execution   │
                                                  └─────────────┘

             ┌──────────────────────────────────────────────┐
             │                  Data Layer                  │
             │ Users │ Challenges │ Submissions │ Results │
             └──────────────────────────────────────────────┘

             ┌──────────────────────────────────────────────┐
             │          Scoring / Leaderboard Layer         │
             └──────────────────────────────────────────────┘
```

This is a conceptual architecture. The actual implementation should remain flexible until the team decides on the technology stack and deployment model.

---

## Major System Components

| Component | Responsibility |
|-----------|----------------|
| **Frontend** | User interface, editor, timer, challenge experience |
| **Authentication** | Accounts, sessions, authorization |
| **User Service** | Profiles and participant data |
| **Challenge Service** | Challenges, problems, scheduling and rules |
| **Contest Engine** | Start/end times and participant state |
| **Code Editor** | In-browser coding environment |
| **Submission Service** | Receives and tracks submissions |
| **Job Queue** | Distributes judging jobs |
| **Judge Workers** | Compile and execute submissions |
| **Sandbox** | Safely executes untrusted code |
| **Scoring Engine** | Calculates challenge scores |
| **Leaderboard** | Calculates and presents rankings |
| **Integrity System** | Records challenge integrity signals |
| **Admin Panel** | Challenge and result management |
| **Database** | Persistent application data |
| **Analytics** | Long-term performance statistics |

---

## Planned Development Phases

### Phase 1 — Core MVP

Focus on getting a complete challenge loop working.

- [ ] Basic frontend
- [ ] Basic participant identity/account
- [ ] Challenge page
- [ ] Problem statement
- [ ] Code editor
- [ ] Language selection
- [ ] Timer
- [ ] Code submission
- [ ] Basic online judge
- [ ] Basic test cases
- [ ] Verdict display
- [ ] Basic leaderboard

### Phase 2 — Competition System

- [ ] Challenge scheduling
- [ ] Challenge lifecycle
- [ ] Multiple problems per challenge
- [ ] Submission history
- [ ] Performance recording
- [ ] Scoring engine
- [ ] Final rankings
- [ ] Challenge history

### Phase 3 — Organizer Platform

- [ ] Admin dashboard
- [ ] Problem creation
- [ ] Test-case management
- [ ] Challenge creation
- [ ] Challenge scheduling
- [ ] Participant monitoring
- [ ] Result management
- [ ] Challenge archive

### Phase 4 — Integrity Layer

- [ ] Fullscreen handling
- [ ] Copy/paste restrictions
- [ ] Focus-loss detection
- [ ] Integrity event logging
- [ ] Organizer review tools
- [ ] Suspicious-session indicators

### Phase 5 — Community and Analytics

- [ ] User profiles
- [ ] Challenge history
- [ ] Ratings
- [ ] Achievements
- [ ] Performance analytics
- [ ] Historical leaderboards
- [ ] Weekly/monthly competitions

### Phase 6 — Advanced Competition

Potential future features include:

- [ ] Team competitions
- [ ] Head-to-head challenges
- [ ] Rating system
- [ ] Seasonal rankings
- [ ] Tournament brackets
- [ ] Custom challenge formats
- [ ] Advanced analytics
- [ ] Challenge recommendations

These phases are a roadmap, not a fixed specification. The project will evolve based on actual community needs and implementation experience.

---

## Future Ideas

The following ideas are intentionally exploratory.

### Rating System

Participants could receive a rating that changes based on challenge performance, similar to competitive programming rating systems.

### Team Battles

Allow teams to compete against one another rather than limiting challenges to individual participants.

### Tournaments

A series of challenges could form a tournament with rounds and elimination or cumulative scoring.

### Achievements

Examples:

- First Accepted Solution
- 10 Problems Solved
- Challenge Winner
- Fastest Solver
- Perfect Challenge
- Consistent Performer

### Problem Categories

Problems could eventually be organized by concepts such as:

- Arrays
- Strings
- Searching
- Sorting
- Graphs
- Dynamic Programming
- Mathematics
- Greedy Algorithms
- Data Structures
- Algorithms

### Personalized Analytics

The platform could eventually identify patterns in participant performance and provide useful practice recommendations.

### AI-Assisted Features

AI may eventually be explored for areas such as:

- Problem generation assistance for organizers
- Difficulty estimation
- Problem tagging
- Duplicate/similar problem detection
- Performance analysis

AI should not undermine the competitive nature of the platform by providing solutions during active challenges.

---

## Project Principles

### 1. Competition Over Cloning

DETOX Code is not intended to become a full clone of LeetCode or Codeforces.

The platform should focus on the **community competition experience**.

### 2. Security by Design

Participant code is untrusted. Code execution must be isolated and resource-limited.

### 3. Fairness

Scoring and challenge rules should be understandable and consistent.

### 4. Incremental Development

Build a working core first and expand only when the foundation is stable.

### 5. Extensibility

The architecture should allow future challenge types, languages, scoring models, and competition formats without requiring a complete rewrite.

### 6. Data-Driven Improvement

Challenge and submission data should eventually be useful for understanding how the community learns and competes.

---

## Current Status

**Project:** Early development / concept stage

The repository currently contains the initial project definition. The implementation will be developed incrementally from the MVP described above.

The architecture, technology stack, scoring model, judge infrastructure, and advanced features are **not considered final** and may change as development progresses.

---

## Contributing

DETOX Code is being developed as a community project.

Contributions can eventually cover areas such as:

- Frontend development
- Backend development
- Database design
- Online judge infrastructure
- Sandbox/security engineering
- UI/UX
- Challenge and problem design
- Testing
- DevOps/deployment
- Analytics
- Documentation

Before contributing significant functionality, discuss the proposed architecture or feature with the project team so that the system remains cohesive as it grows.

---

## Vision

> **Make coding practice feel like an event.**

DETOX Code starts with a simple idea: give the community a place to compete, solve problems under pressure, and see how they perform against one another.

The long-term goal is to grow that simple idea into a complete competitive coding ecosystem built specifically around the DETOX community.
