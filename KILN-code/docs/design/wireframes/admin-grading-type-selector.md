# Wireframe: Admin Problem Creation — Grading Type & Engine Selector
**Component**: `AdminProblemCreate / GradingTypeSelector`  
**Route**: `/admin/problems/create`

---

## 1. Visual Layout & Component Anatomy

```text
+--------------------------------------------------------------------------------------------------+
| Create New Problem                                                         [Cancel]  [Save Draft] |
+--------------------------------------------------------------------------------------------------+
| Title: [ Maximum Subarray Sum with Modulo K                                                    ] |
| Slug:  [ maximum-subarray-sum-modulo-k                                                          ] |
| Difficulty: [ (o) Easy  (*) Medium  (o) Hard ]       Category: [ Dynamic Programming, Prefix Sum] |
|                                                                                                  |
| Time Limit: [ 1500 ] ms           Memory Limit: [ 256 ] MB          Target Engine: [ Judge0 (v1.13) v] |
+--------------------------------------------------------------------------------------------------+
| ⚙️ GRADING SPECIFICATION & EXECUTION ENGINE                                                      |
|                                                                                                  |
| [X] Standard Diff (Deterministic output comparison with whitespace/token trim)                   |
| [ ] Custom Checker (Upload testlib C++ checker for multiple valid outputs)                       |
| [*] Subtask-Based (IOI / Partial Scoring: Partition tests into weighted subtasks)               |
+--------------------------------------------------------------------------------------------------+
| 📦 SUBTASK CONFIGURATION (3 Subtasks defined · Total: 100 Points)                                |
|                                                                                                  |
| +----------------------------------------------------------------------------------------------+ |
| | Subtask 1: N <= 100, K <= 10^3                                                [ 20 Points ]  | |
| | Description: Brute force O(N^2) solutions can pass within time limit.                        | |
| | Assigned Test Cases: [TC-01, TC-02, TC-03, TC-04] (4 tests)                 [Edit Tests] [x] | |
| +----------------------------------------------------------------------------------------------+ |
| | Subtask 2: N <= 5,000, K <= 10^9                                              [ 30 Points ]  | |
| | Description: O(N log N) solutions with sorted prefix sums.                                   | |
| | Assigned Test Cases: [TC-05, TC-06, TC-07, TC-08, TC-09, TC-10] (6 tests)  [Edit Tests] [x] | |
| +----------------------------------------------------------------------------------------------+ |
| | Subtask 3: N <= 200,000, K <= 10^18 (Original Constraints)                    [ 50 Points ]  | |
| | Description: Full constraints requiring balanced BST / Fenwick tree prefix lookup.          | |
| | Assigned Test Cases: [TC-11, TC-12, TC-13, TC-14, TC-15, TC-16] (6 tests)  [Edit Tests] [x] | |
| +----------------------------------------------------------------------------------------------+ |
| [ + Add Subtask ]                                                   Total Points: 100 / 100   |
+--------------------------------------------------------------------------------------------------+
| Problem Statement (Markdown Editor)                                                              |
| [ Write statement, examples, and constraints here...                                           ] |
|                                                                                                  |
| [ Preview Problem ]                                                     [ Publish Problem -> ]    |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. Interactive States & Validation Rules

1. **Subtask Points Sum Validation**:
   - Total problem points = sum of all subtask points.
   - If sum != 100 (or the specified problem point total), a warning chip indicates: `Points mismatch: Total is 80, expected 100`.
2. **Engine Switching**:
   - When `Custom Checker` is chosen, an upload dropzone for `checker.cpp` appears with syntax linting.
   - When `Standard Diff` is chosen, test cases are managed as a single flat list without subtask dividers.
   - Target Engine dropdown offers: `Judge0 (Default Sandbox)`, `Piston (Fast Multi-language)`, and `Isolated High-Mem Worker`.
