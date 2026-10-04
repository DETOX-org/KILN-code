# Wireframe: Subtask Breakdown View (Submission Details)
**Component**: `SubtaskBreakdown`  
**Route**: `/submissions/[id]`

---

## 1. Context & Purpose
When a problem uses the **Subtask-Based (IOI)** grading type, participants receive partial points based on which constraint sets their solution satisfies.
This component provides a clear, transparent breakdown of each subtask, its points, its pass/fail verdict, and the individual test cases inside it.

---

## 2. Visual Layout

```text
+--------------------------------------------------------------------------------------------------+
| Submission #sub-40912  ·  Problem: Dynamic Prefix Range Sum  ·  Language: C++20                  |
| Overall Status: [ Partially Accepted: 70 / 100 Points ]   Runtime: 84ms   Memory: 18.4MB        |
| Trust Status:   [ Verified ✓ ] Audited by contest finalization dual-engine run                    |
+--------------------------------------------------------------------------------------------------+
| 📊 SUBTASK BREAKDOWN                                                                             |
|                                                                                                  |
| [✓] Subtask 1 (N <= 100, Q <= 100)                                      Score: 20 / 20 pts       |
|     Status: Accepted · Runtime: 12ms · Memory: 8.2MB                                             |
|     Tests: [✓ TC-01: 2ms] [✓ TC-02: 4ms] [✓ TC-03: 3ms] [✓ TC-04: 3ms]                          |
|                                                                                                  |
| [✓] Subtask 2 (N <= 5,000, Q <= 5,000)                                  Score: 50 / 50 pts       |
|     Status: Accepted · Runtime: 48ms · Memory: 12.1MB                                            |
|     Tests: [✓ TC-05: 8ms] [✓ TC-06: 10ms] [✓ TC-07: 9ms] [✓ TC-08: 11ms] [✓ TC-09: 10ms]       |
|                                                                                                  |
| [✗] Subtask 3 (N <= 200,000, Q <= 200,000 — Full Constraints)            Score: 0 / 30 pts       |
|     Status: Time Limit Exceeded (on test #13) · Limit: 1000ms                                    |
|     Tests: [✓ TC-10: 18ms] [✓ TC-11: 42ms] [✓ TC-12: 89ms] [✗ TC-13: >1000ms (TLE)] [— TC-14]   |
|     Diagnostics: Inner loop O(N*Q) bottleneck. Fenwick Tree or Segment Tree required.          |
+--------------------------------------------------------------------------------------------------+
| 💡 Real-World System Mapping (Spec §20):                                                         |
| "Dynamic Range Prefix Sums are used in real-time streaming analytics and database indexing       |
| engines to compute rolling aggregations with low latency."                                       |
+--------------------------------------------------------------------------------------------------+
```

---

## 3. UI States & Rules
1. **Partial Credit Aggregation**:
   - Total score = Sum of scores of all passing subtasks.
   - A subtask is awarded points **strictly if ALL tests in that subtask pass**. If even one test fails, the subtask yields 0 points.
2. **Test Case Visibility**:
   - Sample test cases show input/output diff if failed.
   - Hidden test cases show only verdict (TLE, WA, MLE) and execution time; test data remains private.
