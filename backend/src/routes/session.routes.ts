import {
  Router,
  Request,
  Response,
} from "express";
import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";
import {
  finalSubmissionRateLimiter,
} from "../middleware/rate-limit.middleware.js";
import { and, asc, eq, or, sql } from "drizzle-orm";

import { db } from "../db/index.js";

import {
  challenges,
  challengeProblems,
  problems,
  testCases as testCasesTable,
  users,
  participantSessions,
} from "../db/schema.js";
import {
  joinChallenge,
  getParticipantSession,
  touchParticipantSession,
} from "../repositories/participant-session.repository.js";
import {
  executeIsolatedJudge,
} from "../services/isolated-judge.service.js";
import {
  persistFinalParticipantSubmission,
} from "../repositories/submission.repository.js";

import {
  getAdminSessionList,
  getAdminSessionAudit,
} from "../repositories/admin-audit.repository.js";


const router = Router();

// ============================================================================
// DATABASE-BACKED SESSION HELPERS
// ============================================================================

type SessionRules = {
  fullscreenEnforced: boolean;
  maxStrikes: number;
  blockExternalPaste: boolean;
  autoSaveIntervalSec: number;
};

function normalizeRules(
  value: unknown,
): SessionRules {
  const rules =
    value &&
      typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    fullscreenEnforced:
      rules.fullscreenEnforced !== false,

    maxStrikes:
      Number(rules.maxStrikes ?? 3) || 3,

    blockExternalPaste:
      rules.blockExternalPaste !== false,

    autoSaveIntervalSec:
      Number(
        rules.autoSaveIntervalSec ?? 10,
      ) || 10,
  };
}

function normalizeSlug(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    ) || "problem";
}

function isUuid(
  value: string,
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function generateChallengeCode(): Promise<string> {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  for (; ;) {
    let suffix = "";

    for (let i = 0; i < 4; i += 1) {
      suffix +=
        chars[
        Math.floor(
          Math.random() *
          chars.length,
        )
        ];
    }

    const code =
      `KILN-${suffix}`;

    const existing =
      await db
        .select({
          id: challenges.id,
        })
        .from(challenges)
        .where(
          eq(
            challenges.code,
            code,
          ),
        )
        .limit(1);

    if (!existing[0]) {
      return code;
    }
  }
}

async function resolveCreatorId(
  value?: string,
): Promise<string> {
  if (
    value &&
    isUuid(value)
  ) {
    const explicitUser =
      await db
        .select({
          id: users.id,
        })
        .from(users)
        .where(
          eq(
            users.id,
            value,
          ),
        )
        .limit(1);

    if (explicitUser[0]) {
      return explicitUser[0].id;
    }
  }

  const adminUser =
    await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(
        eq(
          users.role,
          "admin",
        ),
      )
      .limit(1);

  if (adminUser[0]) {
    return adminUser[0].id;
  }

  const anyUser =
    await db
      .select({
        id: users.id,
      })
      .from(users)
      .limit(1);

  if (!anyUser[0]) {
    throw new Error(
      "No database user is available to own the challenge.",
    );
  }

  return anyUser[0].id;
}

async function loadChallengeForRoute(
  identifier: string,
) {
  const value =
    identifier.trim();

  if (!value) {
    return undefined;
  }

  const challengeRows =
    await db
      .select({
        challenge:
          challenges,

        challengeProblem:
          challengeProblems,

        problem:
          problems,
      })
      .from(challenges)
      .innerJoin(
        challengeProblems,
        eq(
          challengeProblems.challengeId,
          challenges.id,
        ),
      )
      .innerJoin(
        problems,
        eq(
          challengeProblems.problemId,
          problems.id,
        ),
      )
      .where(
        or(
          eq(
            challenges.code,
            value.toUpperCase(),
          ),
          sql`${challenges.id}::text = ${value}`,
        ),
      )
      .orderBy(
        asc(
          challengeProblems.orderIndex,
        ),
      )
      .limit(1);

  const row =
    challengeRows[0];

  if (!row) {
    return undefined;
  }

  const storedTestCases =
    await db
      .select({
        id:
          testCasesTable.id,

        input:
          testCasesTable.input,

        expectedOutput:
          testCasesTable.expectedOutput,

        isSample:
          testCasesTable.isSample,

        points:
          testCasesTable.points,
      })
      .from(testCasesTable)
      .where(
        eq(
          testCasesTable.problemId,
          row.problem.id,
        ),
      )
      .orderBy(
        asc(
          testCasesTable.orderIndex,
        ),
      );

  const rules =
    normalizeRules(
      row.challenge.rules,
    );

  return {
    id:
      row.challenge.code,

    databaseId:
      row.challenge.id,

    title:
      row.challenge.title,

    description:
      row.challenge.description ??
      "",

    durationMinutes:
      row.challenge.durationMinutes,

    points:
      row.challenge.points,

    status:
      row.challenge.status,

    rules,

    startAt:
      row.challenge.startAt,

    endAt:
      row.challenge.endAt,

    createdAt:
      row.challenge.createdAt,

    createdBy:
      row.challenge.createdBy,

    problem: {
      id:
        row.problem.id,

      slug:
        row.problem.slug,

      title:
        row.problem.title,

      statement:
        row.problem.statement,

      difficulty:
        row.problem.difficulty,

      points:
        row.problem.points,

      timeLimitMs:
        row.problem.timeLimitMs,

      memoryLimitKb:
        row.problem.memoryLimitKb,

      testCases:
        storedTestCases,

      // Starter templates are not currently persisted
      // in the PostgreSQL schema.
      starterTemplates:
        {},
    },
  };
}


// =========================================================================
// 1. PARTICIPANT ENTRY & QUERY ENDPOINTS
// =========================================================================

/**
 * GET /api/sessions/:sessionId
 *
 * Get public challenge information using the KILN session code.
 *
 * Example:
 * GET /api/sessions/KILN-1001
 */
router.get(
  "/:sessionId",
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const sessionId =
        Array.isArray(req.params.sessionId)
          ? req.params.sessionId[0]
          : req.params.sessionId;

      const session =
        await loadChallengeForRoute(
          sessionId,
        );

      if (!session) {
        res.status(404).json({
          success: false,
          error: `Challenge Session '${sessionId}' was not found. Please verify the Session Code.`,
        });
        return;
      }

      // Only public sample test cases are exposed.
      const publicSamples =
        session.problem.testCases
          .filter(
            (testCase) =>
              testCase.isSample,
          )
          .map(
            ({
              id,
              input,
              expectedOutput,
              isSample,
              points,
            }) => ({
              id,
              input,
              expectedOutput,
              isSample,
              points,
            }),
          );

      res.json({
        success: true,
        data: {
          id: session.id,
          title: session.title,
          description:
            session.description,
          durationMinutes:
            session.durationMinutes,
          points: session.points,
          status: session.status,
          rules: session.rules,

          problem: {
            id: session.problem.id,
            slug: session.problem.slug,
            title: session.problem.title,
            statement:
              session.problem.statement,
            difficulty:
              session.problem.difficulty,
            points:
              session.problem.points,
            timeLimitMs:
              session.problem.timeLimitMs,
            memoryLimitKb:
              session.problem.memoryLimitKb,
            samples: publicSamples,
            starterTemplates:
              session.problem
                .starterTemplates,
          },

          createdAt:
            session.createdAt,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error:
          err.message ||
          "Failed to load challenge session",
      });
    }
  },
);

// =========================================================================
// 2. PARTICIPANT JOIN
// =========================================================================

/**
 * POST /api/sessions/:sessionId/join
 *
 * Creates/resumes a persistent participant session.
 *
 * Request body:
 * {
 *   "username": "mohith",
 *   "displayName": "Mohith Dande",
 *   "email": "mohith@example.com"
 * }
 *
 * userId is optional. If supplied and it is a valid UUID,
 * an existing user can be reused.
 */
router.post(
  "/:sessionId/join",
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const sessionId =
        Array.isArray(req.params.sessionId)
          ? req.params.sessionId[0]
          : req.params.sessionId;

      const {
        userId,
        username,
        displayName,
        email,
      } = req.body ?? {};

      if (
        !username &&
        !userId
      ) {
        res.status(400).json({
          success: false,
          error:
            "Either username or userId is required.",
        });
        return;
      }

      const participant =
        await joinChallenge(
          sessionId,
          {
            userId,
            username,
            displayName,
            email,
          },
        );

      const challenge =
        await loadChallengeForRoute(
          sessionId,
        );

      if (!challenge) {
        res.status(404).json({
          success: false,
          error:
            "Challenge session could not be loaded after joining.",
        });
        return;
      }

      // Only expose public problem samples.
      const publicSamples =
        challenge.problem.testCases
          .filter(
            (testCase) =>
              testCase.isSample,
          )
          .map(
            ({
              id,
              input,
              expectedOutput,
              isSample,
              points,
            }) => ({
              id,
              input,
              expectedOutput,
              isSample,
              points,
            }),
          );

      res.status(200).json({
        success: true,
        message:
          "Participant joined the challenge and session state was persisted in PostgreSQL.",

        data: {
          participantSession:
            participant,

          challenge: {
            id: challenge.id,
            title:
              challenge.title,
            description:
              challenge.description,
            durationMinutes:
              challenge.durationMinutes,
            points:
              challenge.points,
            status:
              challenge.status,
            rules:
              challenge.rules,

            problem: {
              id:
                challenge.problem.id,
              slug:
                challenge.problem.slug,
              title:
                challenge.problem.title,
              statement:
                challenge.problem.statement,
              difficulty:
                challenge.problem
                  .difficulty,
              points:
                challenge.problem
                  .points,
              timeLimitMs:
                challenge.problem
                  .timeLimitMs,
              memoryLimitKb:
                challenge.problem
                  .memoryLimitKb,
              samples:
                publicSamples,
              starterTemplates:
                challenge.problem
                  .starterTemplates,
            },
          },
        },
      });
    } catch (err: any) {
      const message =
        err.message ||
        "Failed to join challenge";

      const status =
        message.includes(
          "not found",
        ) ||
          message.includes(
            "not currently live",
          )
          ? 404
          : 400;

      res.status(status).json({
        success: false,
        error: message,
      });
    }
  },
);

// =========================================================================
// 3. PARTICIPANT SESSION STATE
// =========================================================================

/**
 * GET /api/sessions/:sessionId/participant/:userId
 *
 * Returns the persistent participant-session state.
 *
 * userId must be the PostgreSQL UUID returned by /join.
 */
router.get(
  "/:sessionId/participant/:userId",
  requireAuth,
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const sessionId =
        Array.isArray(req.params.sessionId)
          ? req.params.sessionId[0]
          : req.params.sessionId;

      const userId =
        Array.isArray(req.params.userId)
          ? req.params.userId[0]
          : req.params.userId;
      if (userId !== req.authUser!.id) {
        res.status(403).json({
          success: false,
          error:
            "You are not authorized to access this participant session.",
        });
        return;
      }

      const participantSession =
        await getParticipantSession(
          sessionId,
          userId,
        );

      if (!participantSession) {
        res.status(404).json({
          success: false,
          error:
            "Participant session was not found.",
        });
        return;
      }

      res.json({
        success: true,
        data: participantSession,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error:
          err.message ||
          "Failed to load participant session",
      });
    }
  },
);

/**
 * PATCH /api/sessions/participant/:participantSessionId/heartbeat
 *
 * Updates lastActiveAt in PostgreSQL.
 *
 * This will later be called periodically by the frontend.
 */
router.patch(
  "/participant/:participantSessionId/heartbeat",
  requireAuth,
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const participantSessionId =
        Array.isArray(
          req.params
            .participantSessionId,
        )
          ? req.params
            .participantSessionId[0]
          : req.params
            .participantSessionId;
      const owner = await db
        .select({
          userId: participantSessions.userId,
        })
        .from(participantSessions)
        .where(
          eq(
            participantSessions.id,
            participantSessionId,
          ),
        )
        .limit(1);

      if (!owner[0]) {
        res.status(404).json({
          success: false,
          error: "Participant session was not found.",
        });
        return;
      }

      if (owner[0].userId !== req.authUser!.id) {
        res.status(403).json({
          success: false,
          error:
            "You are not authorized to update this participant session.",
        });
        return;
      }

      const updated =
        await touchParticipantSession(
          participantSessionId,
        );

      if (!updated) {
        res.status(404).json({
          success: false,
          error:
            "Participant session was not found.",
        });
        return;
      }

      res.json({
        success: true,
        message:
          "Participant heartbeat recorded.",
        data: {
          participantSessionId:
            updated.id,
          status:
            updated.status,
          strikes:
            updated.strikes,
          lastActiveAt:
            updated.lastActiveAt.toISOString(),
        },
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error:
          err.message ||
          "Failed to update participant heartbeat",
      });
    }
  },
);

// =========================================================================
// 4. FINAL SUBMISSION
// =========================================================================

/**
 * POST /api/sessions/:sessionId/submit-final
 *
 * Evaluates final code against all test cases and then persists the final
 * submission atomically in PostgreSQL:
 *
 *   submissions
 *   submission_results
 *   integrity_events
 *   code_snapshots
 *   participant_sessions
 *
 * No in-memory submission/leaderboard write is performed here.
 */
router.post(
  "/:sessionId/submit-final",
  requireAuth,
  finalSubmissionRateLimiter,
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const sessionId =
        Array.isArray(req.params.sessionId)
          ? req.params.sessionId[0]
          : req.params.sessionId;

      const session =
        await loadChallengeForRoute(
          sessionId,
        );

      if (!session) {
        res.status(404).json({
          success: false,
          error:
            `Session '${sessionId}' not found.`,
        });
        return;
      }

      const {
        userId,
        sourceCode = "",
        language = "python",
        strikes = 0,
        telemetryEvents = [],
        terminationReason,
        isDisqualified = false,
      } = req.body ?? {};

      if (!userId) {
        res.status(400).json({
          success: false,
          error:
            "userId is required. Use the PostgreSQL userId returned by the join endpoint.",
        });
        return;
      }

      if (userId !== req.authUser!.id) {
        res.status(403).json({
          success: false,
          error:
            "You are not authorized to submit for this participant.",
        });
        return;
      }

      const numericStrikes =
        Number(strikes) || 0;

      const reachedStrikeLimit =
        numericStrikes >=
        Number(
          session.rules.maxStrikes,
        );

      const finalDisqualified =
        Boolean(isDisqualified) ||
        reachedStrikeLimit;

      let verdict =
        "Accepted";
      let score = 0;
      let runtimeMs = 0;
      let memoryKb = 0;
      let evaluationResults: any[] =
        [];

      // -------------------------------------------------------------
      // 1. Evaluate the final code
      // -------------------------------------------------------------

      if (finalDisqualified) {
        verdict =
          "Disqualified (Anti-Cheat Strike Limit Exceeded)";
        score = 0;
      } else if (
        !sourceCode ||
        sourceCode.trim().length === 0
      ) {
        verdict =
          "Empty Submission";
        score = 0;
      } else {
        // -------------------------------------------------------------
        // 1. Evaluate the final code through the isolated Judge/Piston path
        // -------------------------------------------------------------
        const judgeResult = await executeIsolatedJudge({
          language: String(language).trim().toLowerCase(),
          code: String(sourceCode),
          tests: session.problem.testCases.map((testCase) => ({
            input: testCase.input ?? "",
            expectedOutput: testCase.expectedOutput ?? "",
            visibility: testCase.isSample ? "public" : "hidden",
          })),
          attempt: 1,
        });

        const judgeResults = Array.isArray(judgeResult?.results)
          ? judgeResult.results
          : [];

        const acceptedResults = judgeResults.filter((result: any) => {
          const status = String(result.status ?? "").trim().toLowerCase();

          return (
            status === "accepted" ||
            result.passed === true
          );
        });

        // Calculate the aggregate score from the actual per-test results.
        // This prevents a missing/default Judge-level score from becoming 0
        // when all test cases were accepted.
        const calculatedScore =
          judgeResults.length > 0
            ? Math.round(
              acceptedResults.length / judgeResults.length * 100
            )
            : Number(judgeResult?.score ?? 0);

        // Judge payloads may use either camelCase or snake_case field names.
        const calculatedRuntimeMs = judgeResults.reduce(
          (max: number, result: any) =>
            Math.max(
              max,
              Number(
                result.runtimeMs ??
                result.runtime_ms ??
                result.runtime ??
                0,
              ),
            ),
          0,
        );

        const calculatedMemoryKb = judgeResults.reduce(
          (max: number, result: any) =>
            Math.max(
              max,
              Number(
                result.memoryKb ??
                result.memory_kb ??
                result.memory ??
                0,
              ),
            ),
          0,
        );

        const allTestsAccepted =
          judgeResults.length > 0 &&
          acceptedResults.length === judgeResults.length;

        const judgeStatus =
          String(judgeResult?.status ?? "").trim();

        verdict =
          judgeStatus ||
          (allTestsAccepted
            ? "Accepted"
            : judgeResults.length > 0
              ? "Rejected"
              : "Judge Error");

        score =
          judgeResults.length > 0
            ? calculatedScore
            : Number(judgeResult?.score ?? 0);

        runtimeMs =
          calculatedRuntimeMs > 0
            ? calculatedRuntimeMs
            : Number(judgeResult?.runtimeMs ?? 0);

        memoryKb =
          calculatedMemoryKb > 0
            ? calculatedMemoryKb
            : Number(judgeResult?.memoryKb ?? 0);

        evaluationResults = judgeResults;

        // -------------------------------------------------------------
        // 2. Convert evaluation results to PostgreSQL result records
        // -------------------------------------------------------------

        const persistedResults =
          Array.isArray(
            evaluationResults,
          )
            ? evaluationResults
              .map(
                (
                  result: any,
                  index: number,
                ) => ({
                  testCaseId:
                    result.id ??
                    result.testCaseId ??
                    session.problem
                      .testCases[index]
                      ?.id,

                  verdict:
                    result.status ??
                    (
                      result.passed
                        ? "Accepted"
                        : verdict
                    ),

                  runtimeMs:
                    Number(
                      result.runtimeMs ??
                      result.runtime_ms ??
                      result.runtime ??
                      0,
                    ),

                  memoryKb:
                    Number(
                      result.memoryKb ??
                      result.memory_kb ??
                      result.memory ??
                      0,
                    ),

                  stdout:
                    result.stdout ??
                    result.actualOutput ??
                    "",

                  stderr:
                    result.stderr ??
                    result.error ??
                    "",
                }),
              )
              .filter(
                (result) =>
                  typeof result.testCaseId ===
                  "string" &&
                  result.testCaseId.length > 0,
              )
            : [];

        // -------------------------------------------------------------
        // 3. ONE ATOMIC POSTGRESQL WRITE
        // -------------------------------------------------------------

        const persisted =
          await persistFinalParticipantSubmission(
            {
              sessionCode:
                session.id,

              userId,

              problemId:
                session.problem.id,

              language,

              sourceCode,

              status:
                verdict,

              score,

              runtimeMs,

              memoryKb,

              strikes:
                numericStrikes,

              telemetryEvents:
                Array.isArray(
                  telemetryEvents,
                )
                  ? telemetryEvents
                  : [],

              results:
                persistedResults,

              terminationReason:
                terminationReason ??
                null,

              isDisqualified:
                finalDisqualified,
            },
          );

        // -------------------------------------------------------------
        // 4. Return the PostgreSQL-backed result
        // -------------------------------------------------------------

        res.status(201).json({
          success: true,
          message:
            "Final session submission persisted atomically in PostgreSQL.",
          data: {
            submissionId:
              persisted.submission.id,

            sessionId:
              session.id,

            verdict,

            score,

            runtimeMs,

            memoryKb,

            strikes:
              numericStrikes,

            participantSessionStatus:
              persisted
                .participantSessionStatus,

            dbMode:
              "postgres-atomic",

            results:
              persisted.submission
                .subtask_results,
          },
        });
      }
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error:
          err.message ||
          "Failed to finalize session submission",
      });
    }
  },
);

// =========================================================================
// 5. ADMIN PORTAL MANAGEMENT
// =========================================================================

/**
 * POST /api/sessions/admin/create
 *
 * Creates a challenge directly in PostgreSQL.
 *
 * The challenge, problem, test cases, and challenge-problem
 * relationship are committed in one transaction.
 */
router.use(
  "/admin",
  requireAuth,
  requireRole("admin"),
);

router.post(
  "/admin/create",
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const {
        title,
        description,
        durationMinutes,
        points,
        rules,
        problem,
        createdBy,
      } = req.body ?? {};

      if (
        !problem ||
        !problem.title ||
        !problem.statement
      ) {
        res.status(400).json({
          success: false,
          error:
            "Problem title and statement are required.",
        });
        return;
      }

      if (
        !Array.isArray(
          problem.testCases,
        ) ||
        problem.testCases.length === 0
      ) {
        res.status(400).json({
          success: false,
          error:
            "At least one test case is required.",
        });
        return;
      }

      const challengeCode =
        await generateChallengeCode();

      const challengeTitle =
        title ||
        `ARENA MATCH // ${normalizeSlug(problem.title).toUpperCase()}`;

      const problemSlug =
        normalizeSlug(
          problem.slug ||
          problem.title,
        );

      const duration =
        Math.max(
          1,
          Number(
            durationMinutes,
          ) || 45,
        );

      const problemPoints =
        Math.max(
          0,
          Number(
            problem.points,
          ) ||
          Number(points) ||
          100,
        );

      const totalPoints =
        Math.max(
          0,
          Number(points) ||
          problemPoints,
        );

      const now =
        new Date();

      const endAt =
        new Date(
          now.getTime() +
          duration *
          60 *
          1000,
        );

      const creatorId =
        await resolveCreatorId(
          createdBy,
        );

      const normalizedRules =
      {
        fullscreenEnforced:
          rules?.fullscreenEnforced ??
          true,

        maxStrikes:
          Number(
            rules?.maxStrikes,
          ) || 3,

        blockExternalPaste:
          rules?.blockExternalPaste ??
          true,

        autoSaveIntervalSec:
          Number(
            rules?.autoSaveIntervalSec,
          ) || 10,
      };

      await db.transaction(
        async (tx) => {
          const createdChallengeRows =
            await tx
              .insert(
                challenges,
              )
              .values({
                slug:
                  challengeCode
                    .toLowerCase(),

                code:
                  challengeCode,

                title:
                  challengeTitle,

                description:
                  description ??
                  null,

                durationMinutes:
                  duration,

                points:
                  totalPoints,

                rules:
                  normalizedRules,

                startAt:
                  now,

                endAt:
                  endAt,

                status:
                  "live",

                createdBy:
                  creatorId,

                createdAt:
                  now,

                updatedAt:
                  now,
              })
              .returning({
                id:
                  challenges.id,

                code:
                  challenges.code,

                title:
                  challenges.title,
              });

          const createdChallenge =
            createdChallengeRows[0];

          if (!createdChallenge) {
            throw new Error(
              "Challenge could not be created.",
            );
          }

          const createdProblemRows =
            await tx
              .insert(
                problems,
              )
              .values({
                slug:
                  problemSlug,

                title:
                  problem.title,

                statement:
                  problem.statement,

                difficulty:
                  problem.difficulty ??
                  "easy",

                points:
                  problemPoints,

                timeLimitMs:
                  Math.max(
                    1,
                    Number(
                      problem.timeLimitMs,
                    ) || 2000,
                  ),

                memoryLimitKb:
                  Math.max(
                    1,
                    Number(
                      problem.memoryLimitKb,
                    ) || 262144,
                  ),

                isPublished:
                  true,

                createdBy:
                  creatorId,

                createdAt:
                  now,

                updatedAt:
                  now,
              })
              .returning({
                id:
                  problems.id,
              });

          const createdProblem =
            createdProblemRows[0];

          if (!createdProblem) {
            throw new Error(
              "Problem could not be created.",
            );
          }

          await tx
            .insert(
              challengeProblems,
            )
            .values({
              challengeId:
                createdChallenge.id,

              problemId:
                createdProblem.id,

              orderIndex:
                0,
            });

          await tx
            .insert(
              testCasesTable,
            )
            .values(
              problem.testCases.map(
                (
                  testCase: any,
                  index: number,
                ) => ({
                  problemId:
                    createdProblem.id,

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

                  isSample:
                    Boolean(
                      testCase.isSample,
                    ),

                  points:
                    Math.max(
                      0,
                      Number(
                        testCase.points,
                      ) || 0,
                    ),

                  orderIndex:
                    index,
                }),
              ),
            );
        },
      );

      const createdSession =
        await loadChallengeForRoute(
          challengeCode,
        );

      if (!createdSession) {
        throw new Error(
          "Challenge was created but could not be reloaded.",
        );
      }

      const publicSamples =
        createdSession.problem.testCases
          .filter(
            (testCase) =>
              testCase.isSample,
          )
          .map(
            ({
              id,
              input,
              expectedOutput,
              isSample,
              points,
            }) => ({
              id,
              input,
              expectedOutput,
              isSample,
              points,
            }),
          );

      res.status(201).json({
        success: true,
        message:
          "Challenge Session created and persisted in PostgreSQL.",
        data: {
          sessionId:
            createdSession.id,

          title:
            createdSession.title,

          status:
            createdSession.status,

          durationMinutes:
            createdSession.durationMinutes,

          points:
            createdSession.points,

          problemSlug:
            createdSession.problem.slug,

          problemTitle:
            createdSession.problem.title,

          rules:
            createdSession.rules,

          dbMode:
            "postgres",

          shareUrl:
            `/?session=${createdSession.id}`,

          problem: {
            id:
              createdSession.problem.id,

            statement:
              createdSession
                .problem.statement,

            difficulty:
              createdSession
                .problem.difficulty,

            timeLimitMs:
              createdSession
                .problem.timeLimitMs,

            memoryLimitKb:
              createdSession
                .problem.memoryLimitKb,

            samples:
              publicSamples,
          },
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error:
          err.message ||
          "Failed to create challenge session",
      });
    }
  },
);

/**
 * GET /api/sessions/admin/list
 *
 * Lists challenge sessions with live participant and submission counts from PostgreSQL.
 */
router.get(
  "/admin/list",
  async (
    _req: Request,
    res: Response,
  ) => {
    try {
      const sessions =
        (
          await getAdminSessionList()
        ).map(
          (session) => ({
            id:
              session.id,
            title:
              session.title,
            description:
              session.description,
            durationMinutes:
              session.durationMinutes,
            points:
              session.points,
            status:
              session.status,
            problemTitle:
              session.problemTitle,
            problemSlug:
              session.problemSlug,
            participantsCount:
              session.participantsCount,
            submissionsCount:
              session.submissionsCount,
            createdAt:
              session.createdAt,
          }),
        );

      res.json({
        success: true,
        total:
          sessions.length,
        data: sessions,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error:
          err.message ||
          "Failed to load challenge sessions",
      });
    }
  },
);

/**
 * GET /api/sessions/admin/:sessionId/audit
 *
 * Returns PostgreSQL-backed participant sessions, submissions, submission results, integrity events, and code snapshots.
 *
 * These records are loaded directly from PostgreSQL for admin audit views.
 */
router.get(
  "/admin/:sessionId/audit",
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const sessionId =
        Array.isArray(req.params.sessionId)
          ? req.params.sessionId[0]
          : req.params.sessionId;

      const audit =
        await getAdminSessionAudit(
          sessionId,
        );

      if (!audit) {
        res.status(404).json({
          success: false,
          error: `Session '${sessionId}' not found.`,
        });
        return;
      }

      res.json({
        success: true,
        data: {
          sessionId:
            audit.sessionId,
          title:
            audit.title,
          rules:
            audit.rules,
          submissions:
            audit.submissions,
          participants:
            audit.participants,
          integrityEvents:
            audit.integrityEvents,
          codeSnapshots:
            audit.codeSnapshots,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error:
          err.message ||
          "Failed to load session audit",
      });
    }
  },
);

export default router;