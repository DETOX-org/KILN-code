import Redis from "ioredis";

import {
  Router,
  Request,
  Response,
} from "express";
import {
  dryRunRateLimiter,
  finalSubmissionRateLimiter,
} from "../middleware/rate-limit.middleware.js";
import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";
import {
  problemStore,
} from "../stores/problem.store.js";

import {
  compilerService,
  TestCaseInput,
} from "../services/compiler.service.js";

import {
  createSubmission,
  finalizeSubmission,
  findAllSubmissions,
  findSubmissionById,
} from "../repositories/submission.repository.js";

const router = Router();

const redis = new Redis(
  process.env.REDIS_URL ??
  "redis://redis:6379",
);

const JUDGE_QUEUE_KEY = "judge:queue";
const JUDGE_RESULT_PREFIX = "judge:result:";

const JUDGE_WAIT_TIMEOUT_MS = 60000;
const JUDGE_POLL_INTERVAL_MS = 250;

function sleep(
  ms: number,
): Promise<void> {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms),
  );
}

async function waitForJudgeResult(
  jobId: string,
  timeoutMs =
    JUDGE_WAIT_TIMEOUT_MS,
): Promise<any> {
  const resultKey =
    `${JUDGE_RESULT_PREFIX}${jobId}`;

  const startedAt = Date.now();

  while (
    Date.now() - startedAt <
    timeoutMs
  ) {
    const payload =
      await redis.get(resultKey);

    if (payload) {
      try {
        return JSON.parse(payload);
      } catch {
        throw new Error(
          "Judge returned an invalid result payload.",
        );
      }
    }

    await sleep(
      JUDGE_POLL_INTERVAL_MS,
    );
  }

  throw new Error(
    "Judge timed out while waiting for execution result.",
  );
}

// ============================================================================
// GET ALL SUBMISSIONS
// ============================================================================
router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  async (
    _req: Request,
    res: Response,
  ) => {
    try {
      const submissions =
        await findAllSubmissions();

      res.json({
        success: true,
        total:
          submissions.length,
        data: submissions,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error:
          err.message ||
          "Failed to load submissions",
      });
    }
  },
);

// ============================================================================
// GET ONE SUBMISSION
// ============================================================================
router.get(
  "/:id",
  requireAuth,
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const submissionId =
        Array.isArray(
          req.params.id,
        )
          ? req.params.id[0]
          : req.params.id;

      const submission =
        await findSubmissionById(
          submissionId,
        );

      if (!submission) {
        res.status(404).json({
          success: false,
          error:
            "Submission not found",
        });
        return;
      }

      // Admins can access any submission.
      // Students can access only their own submission.
      if (
        req.authUser!.role !== "admin" &&
        submission.user_id !==
        req.authUser!.id
      ) {
        res.status(403).json({
          success: false,
          error:
            "You are not authorized to access this submission.",
        });
        return;
      }

      // Sensitive-flow policy for proctored assessments.
      // These fields are hidden from students even for their own submission.
      const isStudent =
        req.authUser!.role ===
        "student";

      const isAssessment =
        req.query.session_type ===
        "assessment";

      if (
        isStudent &&
        isAssessment &&
        submission.discrepancy_flag
      ) {
        res.json({
          ...submission,
          discrepancy_flag: false,
          verification_engine: null,
          discrepancy_details: null,
          verification_notes: null,
        });
        return;
      }

      res.json(submission);
    } catch (err: any) {
      console.error(
        "Failed to load submission:",
        err,
      );

      res.status(500).json({
        success: false,
        error:
          "Failed to load submission.",
      });
    }
  },
);

// ============================================================================
// DRY RUN
// ============================================================================

router.post(
  "/run",
  dryRunRateLimiter,
  async (req: Request, res: Response) => {
    const {
      problem_id =
      "two-sum",

      source_code = "",

      language =
      "python",

      tests,
    } = req.body ?? {};


    if (
      !source_code ||
      source_code
        .trim()
        .length === 0
    ) {
      res.status(400).json({
        success: false,
        error:
          "Field 'source_code' is required.",
      });
      return;
    }

    try {
      const problem =
        (await problemStore.findBySlug(
          problem_id,
        )) ??
        (await problemStore.findById(
          problem_id,
        ));

      let testCasesToRun:
        TestCaseInput[] = [];

      if (
        Array.isArray(tests) &&
        tests.length > 0
      ) {
        testCasesToRun = tests;
      } else if (
        problem &&
        Array.isArray(
          problem.testCases,
        )
      ) {
        testCasesToRun =
          problem.testCases.filter(
            (testCase) =>
              testCase.isSample,
          );
      }

      if (
        testCasesToRun.length === 0
      ) {
        res.status(404).json({
          success: false,
          error:
            `No sample test cases found for problem '${problem_id}'.`,
        });
        return;
      }

      const evaluation =
        await compilerService.evaluate(
          {
            language,
            sourceCode:
              source_code,

            testCases:
              testCasesToRun,

            problemSlug:
              problem?.slug ||
              problem_id,

            timeLimitMs:
              problem?.timeLimitMs ??
              2000,

            memoryLimitKb:
              problem?.memoryLimitKb ??
              262144,
          },
        );

      res.status(200).json({
        success: true,
        data: evaluation,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error:
          err.message ||
          "Failed to execute dry-run test cases",
      });
    }
  },
);

// ============================================================================
// OFFICIAL SUBMISSION
//
// Flow:
//
// API
//   -> PostgreSQL queued submission
//   -> Redis judge:queue
//   -> Judge worker
//   -> Piston isolated execution
//   -> Redis judge:result:<submission-id>
//   -> PostgreSQL finalization
//   -> API response
// ============================================================================

router.post(
  "/",
  requireAuth,
  finalSubmissionRateLimiter,
  async (
    req: Request,
    res: Response,
  ) => {
    const {
      problem_id = "two-sum",
      language_id = 1,
      language = "python",
      source_code = "",
      contest_id = null,
    } = req.body ?? {};

    if (
      !problem_id ||
      !source_code ||
      source_code
        .trim()
        .length === 0
    ) {
      res.status(400).json({
        success: false,
        error:
          "problem_id and source_code are required",
      });
      return;
    }

    try {
      // ----------------------------------------------------------
      // 1. Resolve PostgreSQL-backed problem.
      // ----------------------------------------------------------

      const problem =
        (await problemStore.findBySlug(
          problem_id,
        )) ??
        (await problemStore.findById(
          problem_id,
        ));

      if (!problem) {
        res.status(404).json({
          success: false,
          error:
            `Problem '${problem_id}' not found`,
        });
        return;
      }

      const allTestCases =
        problem.testCases;

      if (
        !Array.isArray(
          allTestCases,
        ) ||
        allTestCases.length === 0
      ) {
        res.status(400).json({
          success: false,
          error:
            "This problem has no test cases configured.",
        });
        return;
      }

      // ----------------------------------------------------------
      // 2. Create PostgreSQL submission FIRST.
      // ----------------------------------------------------------

      const submission =
        await createSubmission({
          userId:
            req.authUser!.id,

          username:
            req.authUser!.username,

          problemIdOrSlug:
            problem.slug,

          language:
            language,

          sourceCode:
            source_code,

          contestId:
            contest_id,

          status:
            "queued",

          score:
            0,

          runtimeMs:
            0,

          memoryKb:
            0,

          results: [],
        });

      const jobId =
        submission.id;

      // ----------------------------------------------------------
      // 3. Build Redis judge job.
      // ----------------------------------------------------------

      const judgeJob = {
        jobId:

          jobId,

        language:
          language
            .trim()
            .toLowerCase(),

        code:
          source_code,

        tests:
          allTestCases.map(
            (testCase: any) => ({
              input:
                String(
                  testCase.input ??
                  "",
                ),

              expectedOutput:
                String(
                  testCase.expectedOutput ??
                  "",
                ),

              visibility:
                testCase.isSample
                  ? "public"
                  : "hidden",
            }),
          ),

        attempt:
          0,
      };

      // ----------------------------------------------------------
      // 4. Put job into controlled Redis queue.
      // ----------------------------------------------------------

      await redis.rpush(
        JUDGE_QUEUE_KEY,
        JSON.stringify(
          judgeJob,
        ),
      );

      // ----------------------------------------------------------
      // 5. Wait for Judge worker result.
      // ----------------------------------------------------------

      const judgeResult =
        await waitForJudgeResult(
          jobId,
        );

      // ----------------------------------------------------------
      // 6. Convert Judge results to PostgreSQL format.
      // ----------------------------------------------------------

      const judgeResults =
        Array.isArray(
          judgeResult?.results,
        )
          ? judgeResult.results
          : [];

      const persistedResults =
        judgeResults.map(
          (
            result: any,
            index: number,
          ) => ({
            id:
              allTestCases[index]
                ?.id,

            verdict:
              result?.status ??
              (
                result?.passed
                  ? "Accepted"
                  : "Wrong Answer"
              ),

            runtimeMs:
              Number(
                result?.runtimeMs ??
                0,
              ),

            memoryKb:
              Number(
                result?.memoryKb ??
                0,
              ),

            stdout:
              result?.stdout ??
              result?.actualOutput ??
              "",

            stderr:
              result?.stderr ??
              result?.error ??
              "",
          }),
        );

      // ----------------------------------------------------------
      // 7. Calculate aggregate values.
      // ----------------------------------------------------------

      const totalTests =
        allTestCases.length;

      const acceptedTests =
        persistedResults.filter(
          (result: any) =>
            String(
              result.verdict ??
              "",
            )
              .trim()
              .toLowerCase() ===
            "accepted",
        ).length;

      const calculatedScore =
        totalTests > 0
          ? Math.round(
            (
              acceptedTests /
              totalTests
            ) * 100,
          )
          : 0;

      const calculatedRuntimeMs =
        persistedResults.reduce(
          (
            max: number,
            result: any,
          ) =>
            Math.max(
              max,
              Number(
                result.runtimeMs ??
                0,
              ),
            ),
          0,
        );

      const calculatedMemoryKb =
        persistedResults.reduce(
          (
            max: number,
            result: any,
          ) =>
            Math.max(
              max,
              Number(
                result.memoryKb ??
                0,
              ),
            ),
          0,
        );

      const score =
        Number.isFinite(
          Number(
            judgeResult?.score,
          ),
        )
          ? Number(
            judgeResult.score,
          )
          : calculatedScore;

      const runtimeMs =
        Number.isFinite(
          Number(
            judgeResult?.runtimeMs,
          ),
        )
          ? Number(
            judgeResult.runtimeMs,
          )
          : calculatedRuntimeMs;

      const memoryKb =
        Number.isFinite(
          Number(
            judgeResult?.memoryKb,
          ),
        )
          ? Number(
            judgeResult.memoryKb,
          )
          : calculatedMemoryKb;

      // ----------------------------------------------------------
      // 8. Finalize PostgreSQL submission.
      // ----------------------------------------------------------

      const finalized =
        await finalizeSubmission(
          submission.id,
          {
            status:
              String(
                judgeResult?.status ??
                "Judge Error",
              ),

            score:
              score,

            runtimeMs:
              runtimeMs,

            memoryKb:
              memoryKb,

            results:
              persistedResults,
          },
        );

      // ----------------------------------------------------------
      // 9. Return final persisted submission.
      // ----------------------------------------------------------

      res.status(201).json({
        ...finalized,

        success:
          true,

        persistence:
          "postgres",

        queue:
          "redis",

        execution_engine:
          "isolated_worker",

        language_id:
          Number(
            language_id,
          ),

        judge_result:
          judgeResult,
      });
    } catch (err: any) {
      console.error(
        "Submission execution failed:",
        err,
      );

      res.status(500).json({
        success: false,
        error:
          err.message ||
          "Failed to execute and persist submission.",
      });
    }
  },
);

export default router;