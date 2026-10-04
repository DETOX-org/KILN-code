import { Problem, Submission, ContestStandingsItem, DiscrepancyQueueItem } from "../types/domain.js";

class StoreService {
  public problems: Problem[] = [
    {
      id: "p0000000-0000-0000-0000-000000000001",
      slug: "two-sum",
      title: "Two Sum",
      statement: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution.",
      difficulty: "easy",
      points: 100,
      time_limit_ms: 1000,
      memory_limit_kb: 131072,
      grading_type: "standard_diff",
      execution_engine: "judge0",
      is_published: true,
      created_by: "u0000000-0000-0000-0000-000000000004",
      created_at: new Date().toISOString()
    },
    {
      id: "p0000000-0000-0000-0000-000000000002",
      slug: "special-graph-path",
      title: "Special Graph Path",
      statement: "Given an undirected weighted graph, find any path from vertex 1 to vertex N of total length at most 2 * shortest_path. Multiple valid paths may exist. Any valid path matching the criteria is accepted.",
      difficulty: "medium",
      points: 100,
      time_limit_ms: 1500,
      memory_limit_kb: 262144,
      grading_type: "custom_checker",
      execution_engine: "judge0",
      checker_source: '#include "testlib.h"\n\nint main(int argc, char* argv[]) {\n    registerTestlibCmd(argc, argv);\n    int n = inf.readInt();\n    quitf(_ok, "Valid path of length %d verified", ans.readInt());\n}',
      is_published: true,
      created_by: "u0000000-0000-0000-0000-000000000004",
      created_at: new Date().toISOString()
    },
    {
      id: "p0000000-0000-0000-0000-000000000003",
      slug: "dynamic-prefix-range-sum",
      title: "Dynamic Prefix Range Sum",
      statement: "Maintain an array of size N and process Q queries: Update element at index i, or query range sum from L to R modulo 10^9+7.\n\nSubtasks evaluate O(N*Q) brute force, O((N+Q) log N) Fenwick tree, and O(N+Q) optimal streaming structures.",
      difficulty: "hard",
      points: 100,
      time_limit_ms: 1500,
      memory_limit_kb: 262144,
      grading_type: "subtask_ioi",
      execution_engine: "judge0",
      is_published: true,
      created_by: "u0000000-0000-0000-0000-000000000004",
      created_at: new Date().toISOString(),
      subtasks: [
        {
          id: "s0000000-0000-0000-0000-000000000001",
          problem_id: "p0000000-0000-0000-0000-000000000003",
          order_index: 1,
          title: "Subtask 1: Small queries (N, Q <= 100)",
          description: "Brute force O(N*Q) passes within 1500ms.",
          points: 20
        },
        {
          id: "s0000000-0000-0000-0000-000000000002",
          problem_id: "p0000000-0000-0000-0000-000000000003",
          order_index: 2,
          title: "Subtask 2: Medium constraints (N, Q <= 5,000)",
          description: "O((N+Q) log N) Fenwick Tree passes.",
          points: 50
        },
        {
          id: "s0000000-0000-0000-0000-000000000003",
          problem_id: "p0000000-0000-0000-0000-000000000003",
          order_index: 3,
          title: "Subtask 3: Full scale (N, Q <= 200,000)",
          description: "Highly optimized I/O & cache-friendly Fenwick structure required.",
          points: 30
        }
      ]
    },
    {
      id: "p0000000-0000-0000-0000-000000000004",
      slug: "fenwick-prefix-queries",
      title: "Fenwick Prefix Queries",
      statement: "Compute rolling 2D prefix queries over large dynamic matrices with modulo arithmetic under tight 2.0-second time limits.",
      difficulty: "hard",
      points: 100,
      time_limit_ms: 2000,
      memory_limit_kb: 262144,
      grading_type: "standard_diff",
      execution_engine: "judge0",
      is_published: true,
      created_by: "u0000000-0000-0000-0000-000000000004",
      created_at: new Date().toISOString()
    }
  ];

  public submissions: Submission[] = [
    {
      id: "sub-0000-0000-0000-0000-000000040912",
      user_id: "u0000000-0000-0000-0000-000000000002",
      username: "sam_dev",
      problem_id: "p0000000-0000-0000-0000-000000000003",
      problem_title: "Dynamic Prefix Range Sum",
      language_id: 1,
      language_name: "C++20 (GCC 12.2)",
      source_code: "#include <bits/stdc++.h>\nusing namespace std;\n// Subtask 1 & 2 passed, Subtask 3 TLE on N=200k",
      status: "accepted",
      runtime_ms: 84,
      memory_kb: 18400,
      score: 70,
      grading_type: "subtask_ioi",
      execution_engine: "judge0",
      verification_engine: "piston",
      discrepancy_flag: false,
      is_verified: true,
      verified_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      submitted_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      subtask_results: [
        {
          subtask_id: "s0000000-0000-0000-0000-000000000001",
          order_index: 1,
          title: "Subtask 1: Small queries (N, Q <= 100)",
          status: "accepted",
          score: 20,
          max_score: 20,
          runtime_ms: 12,
          memory_kb: 8200,
          details: { tests_passed: 4, total_tests: 4 }
        },
        {
          subtask_id: "s0000000-0000-0000-0000-000000000002",
          order_index: 2,
          title: "Subtask 2: Medium constraints (N, Q <= 5,000)",
          status: "accepted",
          score: 50,
          max_score: 50,
          runtime_ms: 48,
          memory_kb: 12100,
          details: { tests_passed: 6, total_tests: 6 }
        },
        {
          subtask_id: "s0000000-0000-0000-0000-000000000003",
          order_index: 3,
          title: "Subtask 3: Full scale (N, Q <= 200,000)",
          status: "time_limit_exceeded",
          score: 0,
          max_score: 30,
          runtime_ms: 1000,
          memory_kb: 18400,
          details: {
            tests_passed: 3,
            total_tests: 5,
            failed_test: 13,
            diagnostic: "Inner loop O(N*Q) bottleneck. Fenwick Tree or Segment Tree required."
          }
        }
      ]
    },
    {
      id: "sub-0000-0000-0000-0000-00000098a2f1",
      user_id: "u0000000-0000-0000-0000-000000000001",
      username: "alex_code",
      problem_id: "p0000000-0000-0000-0000-000000000004",
      problem_title: "Fenwick Prefix Queries",
      contest_id: "c0000000-0000-0000-0000-000000000014",
      language_id: 1,
      language_name: "C++20 (GCC 12.2)",
      source_code: "#include <bits/stdc++.h>\nusing namespace std;\n\n// Fast I/O included; inner loop constant factor caused 1920ms vs 2012ms variance between gcc -O3 and -O2\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n, q;\n    if (!(cin >> n >> q)) return 0;\n    vector<long long> bit(n + 1, 0);\n    cout << 4892182049LL << \"\\n\";\n    return 0;\n}",
      status: "accepted",
      runtime_ms: 1920,
      memory_kb: 64000,
      score: 100,
      grading_type: "standard_diff",
      execution_engine: "judge0",
      verification_engine: "piston",
      discrepancy_flag: true,
      is_verified: false,
      submitted_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      discrepancy_details: {
        summary: "Test Case #14 failed on Verification Engine. Primary passed in 1920ms (Limit: 2000ms).",
        mismatch_test_case: 14,
        primary: {
          engine: "Judge0 v1.13",
          runtime_ms: 1920,
          memory_kb: 64000,
          status: "accepted",
          score: 100,
          compiler: "g++ 12.2 (-O3 optimization)",
          stdout: "4892182049",
          stderr: "Clean execution"
        },
        verification: {
          engine: "Piston Sandbox",
          runtime_ms: 2012,
          memory_kb: 68000,
          status: "time_limit_exceeded",
          score: 70,
          compiler: "g++ 11.4 (-O2 optimization)",
          stdout: "Process killed after 2012ms",
          stderr: "SIGKILL CPU limit reached on test #14"
        }
      }
    }
  ];

  public contestStandings: ContestStandingsItem[] = [
    {
      rank: 1,
      user_id: "u0000000-0000-0000-0000-000000000003",
      username: "elena_algo",
      display_name: "Elena Algo",
      total_score: 100,
      penalty: 42,
      is_verified: true
    },
    {
      rank: 2,
      user_id: "u0000000-0000-0000-0000-000000000001",
      username: "alex_code",
      display_name: "Alex Code",
      total_score: 100,
      penalty: 58,
      is_verified: false // blocked until discrepancy resolved!
    },
    {
      rank: 3,
      user_id: "u0000000-0000-0000-0000-000000000002",
      username: "sam_dev",
      display_name: "Sam Dev",
      total_score: 70,
      penalty: 75,
      is_verified: true
    }
  ];

  public contestState = {
    id: "c0000000-0000-0000-0000-000000000014",
    title: "DETOX Weekly Contest #14",
    status: "pending_finalization" // blocked by Alex's discrepancy
  };

  public getDiscrepancyQueue(): DiscrepancyQueueItem[] {
    const list: DiscrepancyQueueItem[] = [];
    for (const sub of this.submissions) {
      if (sub.discrepancy_flag && sub.discrepancy_details) {
        list.push({
          submission_id: sub.id,
          contest_id: sub.contest_id || "c0000000-0000-0000-0000-000000000014",
          contest_title: this.contestState.title,
          contest_rank: 2,
          user: {
            id: sub.user_id,
            username: sub.username || "alex_code",
            display_name: "Alex Code"
          },
          problem: {
            id: sub.problem_id,
            title: sub.problem_title || "Fenwick Prefix Queries",
            slug: "fenwick-prefix-queries"
          },
          primary_result: sub.discrepancy_details.primary,
          verification_result: sub.discrepancy_details.verification,
          source_code: sub.source_code,
          summary: sub.discrepancy_details.summary,
          mismatch_test_case: sub.discrepancy_details.mismatch_test_case
        });
      }
    }
    return list;
  }
}

export const store = new StoreService();
