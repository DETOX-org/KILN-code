# Frontend Handoff Specification (Architecture v2.0)
**From**: UI/UX Team (Samiksha Patil, Pankhuri Govila, Avishek)  
**To**: Frontend Team (Soniya, Atharv, Tanisha)  
**Date**: September 2026

---

## 1. Key Scope Changes Summary

| Area | Previous Draft | Updated Architecture (Current) | Frontend Action |
| :--- | :--- | :--- | :--- |
| **Engine Health Admin Screen** | Full page with A/B routing split gauges | **DROPPED** (No continuous A/B routing in backend) | Delete or omit this route. |
| **Verification Auditing** | Continuous background dual-run on every submission | **NARROWED** to contest finalization for top-rankers only | Wire discrepancy review queue to the narrow contest finalization trigger. |
| **Discrepancy Review Queue** | General real-time stream | Focused Admin Contest Finalization Queue | Build side-by-side engine output diff review with Staff resolution buttons. |
| **"Verified ✓" Indicator** | Missing | **NEW** trust badge on submissions & leaderboards | Show on submissions where `verification_engine IS NOT NULL AND discrepancy_flag = FALSE`. |
| **Grading-Type Selector** | Not present (standard only) | **NEW** selector in Problem Creator (Standard / Checker / Subtasks) | Build 3-way toggle with subtask configuration editor. |
| **Subtask Breakdown View** | Not present | **NEW** subtask scoring card on submission view | Group test cases by subtask, award points per subtask, show diagnostics. |
| **Sensitive Assessment Flow** | Warnings shown on discrepancies | **UPDATED**: Discrepancies stay completely silent to student | Never display discrepancy alerts or warnings to the test-taker. |

---

## 2. API Contract Expected by Frontend

### 2.1 Problem Creation (`POST /api/problems`)
```json
{
  "title": "Dynamic Prefix Range Sum",
  "slug": "dynamic-prefix-range-sum",
  "difficulty": "medium",
  "grading_type": "subtask_ioi", // "standard_diff" | "custom_checker" | "subtask_ioi"
  "execution_engine": "judge0",  // "judge0" | "piston" | "isolated_worker"
  "time_limit_ms": 1500,
  "memory_limit_kb": 262144,
  "subtasks": [
    {
      "order_index": 1,
      "title": "Subtask 1: Small queries (N, Q <= 100)",
      "points": 20,
      "description": "Brute-force O(N*Q) passes"
    },
    {
      "order_index": 2,
      "title": "Subtask 2: Medium constraints (N, Q <= 5,000)",
      "points": 50,
      "description": "O((N+Q) log N) passes"
    },
    {
      "order_index": 3,
      "title": "Subtask 3: Full scale (N, Q <= 200,000)",
      "points": 30,
      "description": "Optimal Fenwick / Segment Tree required"
    }
  ]
}
```

### 2.2 Submission Detail (`GET /api/submissions/:id`)
```json
{
  "id": "sub-40912",
  "user_id": "usr-alex",
  "problem_id": "prob-dynamic-sum",
  "status": "accepted",
  "score": 70,
  "runtime_ms": 84,
  "memory_kb": 18400,
  "grading_type": "subtask_ioi",
  "execution_engine": "judge0",
  "verification_engine": "piston",
  "discrepancy_flag": false,
  "is_verified": true, // Displays the "Verified ✓" badge!
  "subtask_results": [
    { "subtask_id": 1, "order_index": 1, "status": "accepted", "score": 20, "max_score": 20, "runtime_ms": 12 },
    { "subtask_id": 2, "order_index": 2, "status": "accepted", "score": 50, "max_score": 50, "runtime_ms": 48 },
    { "subtask_id": 3, "order_index": 3, "status": "time_limit_exceeded", "score": 0, "max_score": 30, "runtime_ms": 1000 }
  ]
}
```

### 2.3 Contest Finalization Discrepancies (`GET /api/admin/contests/:id/discrepancies`)
```json
[
  {
    "submission_id": "sub-98a2f1",
    "contest_rank": 2,
    "user": { "username": "alex_code", "display_name": "Alex Code" },
    "problem": { "title": "Fenwick Prefix Queries", "id": "prob-fenwick" },
    "primary_result": {
      "engine": "judge0 v1.13",
      "status": "accepted",
      "score": 100,
      "runtime_ms": 1920,
      "memory_kb": 64000
    },
    "verification_result": {
      "engine": "piston sandbox",
      "status": "time_limit_exceeded",
      "score": 70,
      "runtime_ms": 2012,
      "memory_kb": 68000,
      "mismatch_test_case": 14
    }
  }
]
```
