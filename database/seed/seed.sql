-- ============================================================
-- Seed Data: Development & Testing Fixtures
-- Covers:
-- 1. Standard Diff Problem ("Two Sum")
-- 2. Custom Checker Problem ("Special Graph Path")
-- 3. Subtask IOI Problem ("Dynamic Prefix Range Sum" with 3 subtasks)
-- 4. Contest #14 with Leaderboard & Standings
-- 5. Subtask Partial Scoring Submission (70/100)
-- 6. Manufactured Verification Discrepancy (Alex Code - Rank #2)
-- ============================================================

-- ---------- 1. USERS ----------
INSERT INTO users (id, email, username, password_hash, role) VALUES
('u0000000-0000-0000-0000-000000000001', 'alex@detoxcode.io', 'alex_code', '$2b$10$abcdefghijklmnopqrstuv', 'student'),
('u0000000-0000-0000-0000-000000000002', 'sam@detoxcode.io', 'sam_dev', '$2b$10$abcdefghijklmnopqrstuv', 'student'),
('u0000000-0000-0000-0000-000000000003', 'elena@detoxcode.io', 'elena_algo', '$2b$10$abcdefghijklmnopqrstuv', 'student'),
('u0000000-0000-0000-0000-000000000004', 'admin@detoxcode.io', 'admin_pankhuri', '$2b$10$abcdefghijklmnopqrstuv', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (user_id, display_name, institution, bio) VALUES
('u0000000-0000-0000-0000-000000000001', 'Alex Code', 'MIT', 'Competitive programmer | Master rank'),
('u0000000-0000-0000-0000-000000000002', 'Sam Dev', 'Stanford', 'DSA enthusiast and open-source hacker'),
('u0000000-0000-0000-0000-000000000003', 'Elena Algo', 'Oxford', 'Graph algorithms specialist'),
('u0000000-0000-0000-0000-000000000004', 'Pankhuri Govila', 'DETOX Core', 'Contest Director & Platform Admin')
ON CONFLICT (user_id) DO NOTHING;

-- ---------- 2. LANGUAGES ----------
INSERT INTO languages (id, name, judge_slug, file_extension) VALUES
(1, 'C++20 (GCC 12.2)', 'cpp', 'cpp'),
(2, 'Python 3 (3.11)', 'python', 'py'),
(3, 'Java 17 (OpenJDK)', 'java', 'java'),
(4, 'TypeScript 5.0 (Node 20)', 'typescript', 'ts')
ON CONFLICT (id) DO NOTHING;

-- ---------- 3. PROBLEMS ----------

-- Problem 1: Standard Diff
INSERT INTO problems (
    id, slug, title, statement, difficulty, points, time_limit_ms, memory_limit_kb, 
    grading_type, execution_engine, is_published, created_by
) VALUES (
    'p0000000-0000-0000-0000-000000000001',
    'two-sum',
    'Two Sum',
    'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution.',
    'easy',
    100,
    1000,
    131072,
    'standard_diff',
    'judge0',
    TRUE,
    'u0000000-0000-0000-0000-000000000004'
) ON CONFLICT (id) DO NOTHING;

-- Problem 2: Custom Checker
INSERT INTO problems (
    id, slug, title, statement, difficulty, points, time_limit_ms, memory_limit_kb, 
    grading_type, execution_engine, checker_source, is_published, created_by
) VALUES (
    'p0000000-0000-0000-0000-000000000002',
    'special-graph-path',
    'Special Graph Path',
    'Given an undirected weighted graph, find any path from vertex 1 to vertex N of total length at most 2 * shortest_path. Multiple valid paths may exist. Any valid path matching the criteria is accepted.',
    'medium',
    100,
    1500,
    262144,
    'custom_checker',
    'judge0',
    '#include "testlib.h"\n\nint main(int argc, char* argv[]) {\n    registerTestlibCmd(argc, argv);\n    int n = inf.readInt();\n    // validates multiple valid paths\n    quitf(_ok, "Valid path of length %d verified", ans.readInt());\n}',
    TRUE,
    'u0000000-0000-0000-0000-000000000004'
) ON CONFLICT (id) DO NOTHING;

-- Problem 3: Subtask IOI
INSERT INTO problems (
    id, slug, title, statement, difficulty, points, time_limit_ms, memory_limit_kb, 
    grading_type, execution_engine, is_published, created_by
) VALUES (
    'p0000000-0000-0000-0000-000000000003',
    'dynamic-prefix-range-sum',
    'Dynamic Prefix Range Sum',
    'Maintain an array of size N and process Q queries: Update element at index i, or query range sum from L to R modulo 10^9+7.\n\nSubtasks evaluate O(N*Q) brute force, O((N+Q) log N) Fenwick tree, and O(N+Q) optimal streaming structures.',
    'hard',
    100,
    1500,
    262144,
    'subtask_ioi',
    'judge0',
    TRUE,
    'u0000000-0000-0000-0000-000000000004'
) ON CONFLICT (id) DO NOTHING;

-- Problem 4: Contest Problem for Discrepancy Case
INSERT INTO problems (
    id, slug, title, statement, difficulty, points, time_limit_ms, memory_limit_kb, 
    grading_type, execution_engine, is_published, created_by
) VALUES (
    'p0000000-0000-0000-0000-000000000004',
    'fenwick-prefix-queries',
    'Fenwick Prefix Queries',
    'Compute rolling 2D prefix queries over large dynamic matrices with modulo arithmetic under tight 2.0-second time limits.',
    'hard',
    100,
    2000,
    262144,
    'standard_diff',
    'judge0',
    TRUE,
    'u0000000-0000-0000-0000-000000000004'
) ON CONFLICT (id) DO NOTHING;

-- ---------- 4. SUBTASKS FOR PROBLEM 3 ----------
INSERT INTO problem_subtasks (id, problem_id, order_index, title, description, points) VALUES
('s0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000003', 1, 'Subtask 1: Small queries (N, Q <= 100)', 'Brute force O(N*Q) passes within 1500ms.', 20),
('s0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000003', 2, 'Subtask 2: Medium constraints (N, Q <= 5,000)', 'O((N+Q) log N) Fenwick Tree passes.', 50),
('s0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000003', 3, 'Subtask 3: Full scale (N, Q <= 200,000)', 'Highly optimized I/O & cache-friendly Fenwick structure required.', 30)
ON CONFLICT (id) DO NOTHING;

-- ---------- 5. CONTEST #14 ----------
INSERT INTO contests (id, slug, title, description, status, start_time, end_time, created_by) VALUES
('c0000000-0000-0000-0000-000000000014', 'detox-weekly-14', 'DETOX Weekly Contest #14', 'Official weekly rated challenge. Top 10 rankings undergo contest-finalization dual-engine verification.', 'ended', now() - interval '3 hours', now() - interval '1 hour', 'u0000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO NOTHING;

INSERT INTO contest_problems (contest_id, problem_id, points, order_index) VALUES
('c0000000-0000-0000-0000-000000000014', 'p0000000-0000-0000-0000-000000000004', 100, 1)
ON CONFLICT (contest_id, problem_id) DO NOTHING;

INSERT INTO participants (contest_id, user_id) VALUES
('c0000000-0000-0000-0000-000000000014', 'u0000000-0000-0000-0000-000000000003'), -- Elena (Rank 1)
('c0000000-0000-0000-0000-000000000014', 'u0000000-0000-0000-0000-000000000001'), -- Alex (Rank 2 - Discrepancy)
('c0000000-0000-0000-0000-000000000014', 'u0000000-0000-0000-0000-000000000002')  -- Sam (Rank 3)
ON CONFLICT (contest_id, user_id) DO NOTHING;

INSERT INTO scores (contest_id, user_id, total_score, penalty, last_accepted_at) VALUES
('c0000000-0000-0000-0000-000000000014', 'u0000000-0000-0000-0000-000000000003', 100, 42, now() - interval '2 hours'),
('c0000000-0000-0000-0000-000000000014', 'u0000000-0000-0000-0000-000000000001', 100, 58, now() - interval '1 hour 45 minutes'),
('c0000000-0000-0000-0000-000000000014', 'u0000000-0000-0000-0000-000000000002', 70, 75, now() - interval '1 hour 20 minutes')
ON CONFLICT (contest_id, user_id) DO NOTHING;

-- ---------- 6. SUBMISSIONS ----------

-- Submission 1: Subtask problem partial credit (70 pts: Subtasks 1 & 2 passed, Subtask 3 TLE)
INSERT INTO submissions (
    id, user_id, problem_id, language_id, source_code, status, runtime_ms, memory_kb, score,
    grading_type, execution_engine, verification_engine, discrepancy_flag, is_verified, verified_at
) VALUES (
    'sub-0000-0000-0000-0000-000000040912',
    'u0000000-0000-0000-0000-000000000002', -- Sam Dev
    'p0000000-0000-0000-0000-000000000003', -- Dynamic Prefix Range Sum
    1,
    '#include <bits/stdc++.h>\nusing namespace std;\n// Subtask 1 & 2 passed, Subtask 3 TLE on N=200k',
    'accepted',
    84,
    18400,
    70,
    'subtask_ioi',
    'judge0',
    'piston',
    FALSE,
    TRUE,
    now() - interval '4 hours'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO submission_subtask_results (submission_id, subtask_id, order_index, status, score, max_score, runtime_ms, memory_kb, details) VALUES
('sub-0000-0000-0000-0000-000000040912', 's0000000-0000-0000-0000-000000000001', 1, 'accepted', 20, 20, 12, 8200, '{"tests_passed": 4, "total_tests": 4}'),
('sub-0000-0000-0000-0000-000000040912', 's0000000-0000-0000-0000-000000000002', 2, 'accepted', 50, 50, 48, 12100, '{"tests_passed": 6, "total_tests": 6}'),
('sub-0000-0000-0000-0000-000000040912', 's0000000-0000-0000-0000-000000000003', 3, 'time_limit_exceeded', 0, 30, 1000, 18400, '{"tests_passed": 3, "total_tests": 5, "failed_test": 13, "diagnostic": "Inner loop O(N*Q) bottleneck. Fenwick Tree or Segment Tree required."}')
ON CONFLICT (submission_id, subtask_id) DO NOTHING;

-- Submission 2: MANUFACTURED DISCREPANCY CASE
-- Alex Code (Rank 2 in Contest #14) on Fenwick Prefix Queries
-- Primary: Judge0 -> 1920ms Accepted (100 pts)
-- Verification: Piston -> 2012ms TLE on test 14 (70 pts)
-- discrepancy_flag = TRUE, verification_engine = 'piston', is_verified = FALSE
INSERT INTO submissions (
    id, user_id, problem_id, contest_id, language_id, source_code, status, runtime_ms, memory_kb, score,
    grading_type, execution_engine, verification_engine, discrepancy_flag, is_verified, discrepancy_details
) VALUES (
    'sub-0000-0000-0000-0000-00000098a2f1',
    'u0000000-0000-0000-0000-000000000001', -- Alex Code
    'p0000000-0000-0000-0000-000000000004', -- Fenwick Prefix Queries
    'c0000000-0000-0000-0000-000000000014', -- Contest #14
    1,
    '#include <bits/stdc++.h>\nusing namespace std;\n\n// Fast I/O included; inner loop constant factor caused 1920ms vs 2012ms variance between gcc -O3 and -O2\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n, q;\n    if (!(cin >> n >> q)) return 0;\n    vector<long long> bit(n + 1, 0);\n    // ... query processing loop ...\n    cout << 4892182049LL << "\\n";\n    return 0;\n}',
    'accepted',
    1920,
    64000,
    100,
    'standard_diff',
    'judge0',
    'piston',
    TRUE,
    FALSE,
    '{
        "summary": "Test Case #14 failed on Verification Engine. Primary passed in 1920ms (Limit: 2000ms).",
        "mismatch_test_case": 14,
        "primary": {
            "engine": "Judge0 v1.13",
            "runtime_ms": 1920,
            "memory_kb": 64000,
            "status": "accepted",
            "score": 100,
            "compiler": "g++ 12.2 (-O3 optimization)",
            "stdout": "4892182049",
            "stderr": "Clean execution"
        },
        "verification": {
            "engine": "Piston Sandbox",
            "runtime_ms": 2012,
            "memory_kb": 68000,
            "status": "time_limit_exceeded",
            "score": 70,
            "compiler": "g++ 11.4 (-O2 optimization)",
            "stdout": "Process killed after 2012ms",
            "stderr": "SIGKILL CPU limit reached on test #14"
        }
    }'
) ON CONFLICT (id) DO NOTHING;
