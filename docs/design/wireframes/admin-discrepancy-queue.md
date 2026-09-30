# Wireframe: Admin Discrepancy Review Queue (Contest Finalization)
**Component**: `AdminDiscrepancyQueue`  
**Route**: `/admin/discrepancies`

---

## 1. Context & Scope

> [!IMPORTANT]
> This review queue is fed **strictly by contest finalization dual-run audits** for top-of-leaderboard submissions. The full "Engine Health / Continuous A/B split" screen is dropped. This queue is a focused, high-trust investigative workbench for contest directors.

---

## 2. Queue Overview Screen

```text
+--------------------------------------------------------------------------------------------------+
| Admin / Contest Auditing / Discrepancy Review Queue                                              |
| Filter by Contest: [ DETOX Weekly Contest #14 v ]   Status: [ Unresolved (1) v ]   [Export Audit] |
+--------------------------------------------------------------------------------------------------+
| ⚠️ 1 Verification Discrepancy Pending Resolution (Contest Finalization Blocked)                  |
+--------------------------------------------------------------------------------------------------+
| Submission ID | Contest Rank | Participant | Problem                 | Primary (Judge0) | Verification (Piston) | Action |
| sub-98a2f1    | Rank #2      | @alex_code  | Fenwick Prefix Queries  | Accepted (100)   | TLE (Test #14) (70)   | [Review]|
+--------------------------------------------------------------------------------------------------+
```

---

## 3. Side-by-Side Detail & Resolution View

```text
+--------------------------------------------------------------------------------------------------+
| Discrepancy Review: Submission #sub-98a2f1 · Contest: DETOX Weekly #14                            |
| Participant: @alex_code (Current Rank: #2) · Problem: Fenwick Prefix Queries                     |
+--------------------------------------------------------------------------------------------------+
| SUMMARY OF DISCREPANCY:                                                                          |
| Test Case #14 failed on Verification Engine. Primary passed in 1920ms (Limit: 2000ms).           |
+--------------------------------------------------------------------------------------------------+
| PRIMARY ENGINE (Judge0 v1.13)              | VERIFICATION ENGINE (Piston Sandbox)               |
| Runtime: 1920ms · Memory: 64MB             | Runtime: >2000ms (TLE) · Memory: 68MB              |
| Status: Accepted (100/100)                 | Status: Time Limit Exceeded (70/100)               |
| Compiler: g++ 12.2 (-O3 optimization)      | Compiler: g++ 11.4 (-O2 optimization)              |
|                                            |                                                    |
| stdout: [4892182049]                       | stdout: [Process killed after 2012ms]              |
| stderr: [Clean execution]                  | stderr: [SIGKILL CPU limit reached]                |
+--------------------------------------------------------------------------------------------------+
| CODE PREVIEW:                                                                                    |
| 1: #include <bits/stdc++.h>                                                                      |
| 2: using namespace std;                                                                          |
| 3: // Fast I/O included; inner loop constant factor caused 1920ms vs 2012ms variance...          |
+--------------------------------------------------------------------------------------------------+
| STAFF RESOLUTION ACTIONS:                                                                        |
|                                                                                                  |
| [ Accept Primary (Judge0) ]                                                                      |
| Confirm 100/100 points. Rational: Primary engine matches official contest environment specs.     |
|                                                                                                  |
| [ Accept Verification (Piston) ]                                                                 |
| Downgrade score to 70/100. Rational: Exceeded hard 2.0s barrier under standard GCC sandbox.      |
|                                                                                                  |
| [ Re-run Clean Isolated Benchmark ]                                                              |
| Triggers 3-run median execution benchmark on dedicated isolated worker.                          |
|                                                                                                  |
| Resolution Note: [ Compiler optimization flag variance (-O3 vs -O2). Approved as Accepted.     ] |
|                                                                                                  |
| [ Resolve & Finalize Standings ✓ ]                                                               |
+--------------------------------------------------------------------------------------------------+
```
