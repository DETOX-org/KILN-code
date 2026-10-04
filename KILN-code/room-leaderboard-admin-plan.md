# DETOX Code — Room-Based Leaderboard & Admin Auth — Improvement Plan

> **Status**: PENDING IMPLEMENTATION  
> **Created**: September 27, 2026  
> **Priority**: HIGH — Core Feature Overhaul

---

## Overview

Replace the global leaderboard with a **room-specific leaderboard** system. Add a **public room viewer** where anyone can enter a room ID to see details and join. Implement **admin authentication** with a full dashboard.

---

## Part 1: Room-Specific Leaderboard (Replace Global)

### Current Problem
- Leaderboard is global with hardcoded seed data
- Not tied to actual KILN sessions/rooms

### Changes Required

#### 1.1 Each Room Has Its Own Leaderboard
- Remove global `leaderboard.store.ts` and `scoring.service.ts`
- Each session (`KILN-XXXX`) stores its own participant scores
- Leaderboard entries come from actual submissions within that session
- Stored inside the session metadata (single atomic read)

#### 1.2 Room Leaderboard Data Structure
```typescript
interface RoomLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  problemsSolved: number;
  totalProblems: number;
  penaltyMinutes: number;
  lastSubmitTime: string;
  strikes: number;
  verdict: string;
}
```

#### 1.3 Leaderboard Loads Locally
- Fetched via: `GET /api/sessions/:sessionId/leaderboard`
- Sorted by: score (desc) → penalty (asc) → submit time (asc)
- Updates on each submission within the room

#### 1.4 Frontend Update
- Update `loadLiveLeaderboard()` in `anticheat.js` to fetch room-specific data
- Update leaderboard modal in `index.html` to show current room participants only

---

## Part 2: Public Room Viewer (Enter Room ID → See Details)

### What Anyone Can Do
Enter a room ID (e.g., `KILN-XFY9`) and see everything about that room via **single metadata read**.

#### 2.1 Room Metadata Shown
- Room ID, Created by (admin name), Created at
- Problem title and statement
- Duration, Proctored rules (fullscreen, paste block, max strikes)
- Status: Active / Completed / Expired
- Participant count

#### 2.2 Room Leaderboard (Read-Only)
- Public scoreboard visible without joining

#### 2.3 Join Room Button
- "JOIN THIS ROOM" button below details
- Only works if room status is "Active"
- Pre-fills session ID in the arena entry

### API
```
GET /api/rooms/:sessionId       → Room metadata + leaderboard (single read)
GET /api/rooms/:sessionId/join  → Validates room is joinable
```

### Frontend Flow
1. Landing page input: "ENTER ROOM ID TO VIEW"
2. User types `KILN-XFY9` → hits "VIEW ROOM"
3. Modal shows: Room info card + leaderboard + "JOIN" button

---

## Part 3: Admin Authentication & Dashboard

### 3.1 Admin Authentication

#### Login System
- Admin gets a randomly generated Admin ID (e.g., `ADMIN-7X9K`) on registration
- Logs in with this ID (stored in localStorage)
- No password for MVP — the random ID is the secret

#### API
```
POST /api/admin/register   → Generates Admin ID + stores profile
POST /api/admin/login      → Validates Admin ID, returns profile
GET  /api/admin/profile    → Returns admin data (requires x-admin-id header)
```

#### Admin Data
```typescript
interface AdminProfile {
  adminId: string;         // e.g., "ADMIN-7X9K"
  displayName: string;
  createdAt: string;
  totalRoomsCreated: number;
  totalParticipants: number;
}
```

### 3.2 Admin Dashboard

#### A. All Rooms Created (Table)
| Room ID | Problem | Created | Duration | Participants | Status |
|---------|---------|---------|----------|-------------|--------|
| KILN-XFY9 | Two Sum | Sep 27 | 45 min | 12 | Completed |
| KILN-1001 | Reverse String | Sep 26 | 30 min | 8 | Active |

#### B. Room Detail Drill-Down (Click a room)
- Room metadata (problem, rules, duration)
- Participant list with full details:
  - Username, Score, Points earned
  - Which problems solved, in what time
  - Strikes / violations count
  - Final verdict (Accepted, WA, TLE)
  - Code snapshot (last submitted)
- Leaderboard for that room
- Telemetry summary (blurs, paste blocks)

#### C. Create New Room
- Same as current `admin.html` create flow — no changes needed

#### API
```
GET  /api/admin/rooms                    → All rooms by this admin
GET  /api/admin/rooms/:sessionId         → Full room details + participants
GET  /api/admin/rooms/:sessionId/audit   → Detailed audit (telemetry, code)
POST /api/admin/rooms/create             → Create room (existing flow)
```

---

## Part 4: Files to Remove / Modify / Create

### REMOVE
- `backend/src/stores/leaderboard.store.ts` — Global leaderboard
- `backend/src/services/scoring.service.ts` — Global ELO rating
- `backend/src/routes/leaderboard.routes.ts` — Global leaderboard API
- `backend/src/routes/rating.routes.ts` — Global rating API

### CREATE
- `backend/src/stores/admin.store.ts` — Admin profiles & auth
- `backend/src/routes/room.routes.ts` — Public room viewer API
- `backend/src/middleware/admin-auth.middleware.ts` — Admin ID validation

### MODIFY
- `backend/src/app.ts` — Mount new routes, remove global leaderboard
- `backend/src/stores/session.store.ts` — Add leaderboard per session
- `backend/src/routes/session.routes.ts` — Add session leaderboard endpoint
- `backend/src/routes/admin.routes.ts` — Add auth + dashboard endpoints
- `frontend/index.html` — Room viewer UI, updated leaderboard modal
- `frontend/admin.html` — Login screen, dashboard, room list
- `frontend/js/anticheat.js` — Room-specific leaderboard loading
- `frontend/js/admin.js` — Admin login, dashboard logic

---

## Part 5: Implementation Order

1. **Phase 1** — Remove global leaderboard, add room-level leaderboard to sessions
2. **Phase 2** — Public room viewer API + frontend
3. **Phase 3** — Admin auth (register/login with random ID)
4. **Phase 4** — Admin dashboard (room list, detail drill-down, audit)
5. **Phase 5** — Frontend polish (room view modal, admin dashboard UI)
6. **Phase 6** — Fix TypeScript errors, test, deploy
