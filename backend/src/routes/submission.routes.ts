import { Router, Request, Response } from "express";
import { store } from "../services/store.service.js";
import { problemStore } from "../stores/problem.store.js";
import { compilerService, TestCaseInput } from "../services/compiler.service.js";
import { Submission, JudgeStatus } from "../types/domain.js";

const router = Router();

// GET /api/submissions
router.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    total: store.submissions.length,
    data: store.submissions
  });
});

// GET /api/submissions/:id
router.get("/:id", (req: Request, res: Response) => {
  const sub = store.submissions.find(s => s.id === req.params.id);
  if (!sub) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  // Sensitive-flow policy for proctored sessions
  const isStudent = req.headers["x-user-role"] === "student" || req.query.role === "student";
  const isAssessment = req.query.session_type === "assessment";

  if (isStudent && isAssessment && sub.discrepancy_flag) {
    const sanitized = {
      ...sub,
      discrepancy_flag: false,
      verification_engine: null,
      discrepancy_details: null,
      verification_notes: null
    };
    res.json(sanitized);
    return;
  }

  res.json(sub);
});

// POST /api/submissions/run — Dry run against sample test cases (does not score officially)
router.post("/run", async (req: Request, res: Response) => {
  const {
    problem_id = "two-sum",
    source_code = "",
    language = "python",
    tests
  } = req.body;

  if (!source_code) {
    res.status(400).json({ success: false, error: "Field 'source_code' is required." });
    return;
  }

  try {
    // Resolve problem
    const problem = problemStore.findBySlug(problem_id) ||
                    problemStore.findById(problem_id) ||
                    store.problems.find(p => p.id === problem_id || p.slug === problem_id);

    // Resolve test cases
    let testCasesToRun: TestCaseInput[] = [];
    if (Array.isArray(tests) && tests.length > 0) {
      testCasesToRun = tests;
    } else if (problem && "testCases" in problem && Array.isArray((problem as any).testCases)) {
      testCasesToRun = (problem as any).testCases.filter((tc: any) => tc.isSample);
    } else {
      // Default sample test cases for two sum
      testCasesToRun = [
        { id: "tc-sample-1", input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isSample: true },
        { id: "tc-sample-2", input: "3\n3 2 4\n6", expectedOutput: "1 2", isSample: true }
      ];
    }

    const evaluation = await compilerService.evaluate({
      language,
      sourceCode: source_code,
      testCases: testCasesToRun,
      problemSlug: problem?.slug || problem_id,
      timeLimitMs: (problem as any)?.timeLimitMs || (problem as any)?.time_limit_ms || 2000,
      memoryLimitKb: (problem as any)?.memoryLimitKb || (problem as any)?.memory_limit_kb || 262144
    });

    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || "Failed to execute dry-run test cases"
    });
  }
});

// POST /api/submissions — Official submission against ALL test cases (ranked evaluation)
router.post("/", async (req: Request, res: Response) => {
  const {
    problem_id = "two-sum",
    user_id = `u-${Date.now().toString(36)}`,
    username = "CIPHER_WARRIOR",
    language_id = 1,
    language = "python",
    source_code = "",
    contest_id = null
  } = req.body;

  if (!problem_id || !source_code) {
    res.status(400).json({ error: "problem_id and source_code are required" });
    return;
  }

  try {
    // Resolve problem
    const problem = problemStore.findBySlug(problem_id) ||
                    problemStore.findById(problem_id) ||
                    store.problems.find(p => p.id === problem_id || p.slug === problem_id);

    const problemTitle = problem?.title || "Two Sum";
    const problemId = problem?.id || "p1010000-0000-0000-0000-000000000001";

    // Collect all test cases (both samples and hidden)
    let allTestCases: TestCaseInput[] = [];
    if (problem && "testCases" in problem && Array.isArray((problem as any).testCases)) {
      allTestCases = (problem as any).testCases;
    } else {
      allTestCases = [
        { id: "tc-001", input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isSample: true, points: 33 },
        { id: "tc-002", input: "3\n3 2 4\n6", expectedOutput: "1 2", isSample: true, points: 33 },
        { id: "tc-003", input: "2\n3 3\n6", expectedOutput: "0 1", isSample: false, points: 34 }
      ];
    }

    // Execute real compiler evaluation
    const evaluation = await compilerService.evaluate({
      language,
      sourceCode: source_code,
      testCases: allTestCases,
      problemSlug: problem?.slug || problem_id,
      timeLimitMs: (problem as any)?.timeLimitMs || (problem as any)?.time_limit_ms || 2000,
      memoryLimitKb: (problem as any)?.memoryLimitKb || (problem as any)?.memory_limit_kb || 262144
    });

    // Map compiler status to domain JudgeStatus
    let domainStatus: JudgeStatus = "accepted";
    if (evaluation.status === "Accepted") domainStatus = "accepted";
    else if (evaluation.status === "Wrong Answer") domainStatus = "wrong_answer";
    else if (evaluation.status === "Compilation Error") domainStatus = "compilation_error";
    else if (evaluation.status === "Runtime Error") domainStatus = "runtime_error";
    else if (evaluation.status === "Time Limit Exceeded") domainStatus = "time_limit_exceeded";

    const submissionId = `sub-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

    const newSubmission: Submission = {
      id: submissionId,
      user_id,
      username,
      problem_id: problemId,
      problem_title: problemTitle,
      contest_id: contest_id || null,
      language_id: Number(language_id),
      language_name: language === "python" ? "Python 3.13" : language === "cpp" ? "C++20 (GCC 15.2)" : language === "typescript" ? "TypeScript (TSX)" : "JavaScript (Node.js 24)",
      source_code,
      status: domainStatus,
      runtime_ms: evaluation.runtimeMs,
      memory_kb: evaluation.memoryKb,
      score: evaluation.score,
      grading_type: (problem as any)?.grading_type || "standard_diff",
      execution_engine: "isolated_worker",
      verification_engine: null,
      discrepancy_flag: false,
      is_verified: domainStatus === "accepted",
      verified_at: domainStatus === "accepted" ? new Date().toISOString() : null,
      submitted_at: new Date().toISOString(),
      subtask_results: evaluation.results.map((r, idx) => ({
        subtask_id: r.id,
        order_index: idx + 1,
        title: `Test Case #${idx + 1} (${r.isSample ? "Public Sample" : "Hidden Benchmark"})`,
        status: (r.passed ? "accepted" : (r.status === "Time Limit Exceeded" ? "time_limit_exceeded" : "wrong_answer")) as JudgeStatus,
        score: r.passed ? Math.round(100 / evaluation.totalTests) : 0,
        max_score: Math.round(100 / evaluation.totalTests),
        runtime_ms: r.runtimeMs,
        memory_kb: r.memoryKb,
        details: {
          tests_passed: r.passed ? 1 : 0,
          total_tests: 1,
          failed_test: r.passed ? undefined : 1,
          diagnostic: r.passed ? undefined : `Expected "${r.expectedOutput}", got "${r.actualOutput}"`
        }
      }))
    };

    store.submissions.unshift(newSubmission);

    // Update or insert into contest standings
    let standing = store.contestStandings.find(s => s.user_id === user_id || s.username === username);
    if (standing) {
      standing.total_score = Math.max(standing.total_score, evaluation.score);
      standing.is_verified = true;
      if (domainStatus === "accepted") {
        standing.last_accepted_at = new Date().toISOString();
      }
    } else {
      standing = {
        rank: store.contestStandings.length + 1,
        user_id,
        username,
        display_name: username,
        total_score: evaluation.score,
        penalty: Math.floor(Math.random() * 20) + 10,
        is_verified: true
      };
      store.contestStandings.push(standing);
    }

    // Re-sort standings by score (descending) and penalty (ascending)
    store.contestStandings.sort((a, b) => b.total_score - a.total_score || a.penalty - b.penalty);
    store.contestStandings.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    res.status(201).json({
      ...newSubmission,
      evaluation,
      success: true
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to execute submission" });
  }
});

export default router;
