import { Router, Request, Response } from "express";
import { sessionStore, FinalSubmissionAudit } from "../stores/session.store.js";
import { databaseService } from "../services/database.service.js";
import { compilerService } from "../services/compiler.service.js";
import { store } from "../services/store.service.js";

const router = Router();

// =========================================================================
// 1. PARTICIPANT ENTRY & QUERY ENDPOINTS
// =========================================================================

/**
 * GET /api/sessions/:sessionId
 * Participant queries challenge session using unique Session Code (e.g. KILN-7492)
 * Returns public metadata, operational rules, problem statement, and public sample test cases ONLY.
 */
router.get("/:sessionId", (req: Request, res: Response) => {
  const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  const session = sessionStore.getSession(sessionId);

  if (!session) {
    res.status(404).json({
      success: false,
      error: `Challenge Session '${sessionId}' was not found. Please verify the Session Code.`
    });
    return;
  }

  // Filter test cases: ONLY return public sample test cases to participant
  const publicSamples = session.problem.testCases
    .filter(tc => tc.isSample)
    .map(({ id, input, expectedOutput, isSample, points }) => ({
      id,
      input,
      expectedOutput,
      isSample,
      points
    }));

  res.json({
    success: true,
    data: {
      id: session.id,
      title: session.title,
      description: session.description,
      durationMinutes: session.durationMinutes,
      points: session.points,
      status: session.status,
      rules: session.rules,
      problem: {
        id: session.problem.id,
        slug: session.problem.slug,
        title: session.problem.title,
        statement: session.problem.statement,
        difficulty: session.problem.difficulty,
        points: session.problem.points,
        timeLimitMs: session.problem.timeLimitMs,
        memoryLimitKb: session.problem.memoryLimitKb,
        samples: publicSamples,
        starterTemplates: session.problem.starterTemplates
      },
      createdAt: session.createdAt
    }
  });
});

/**
 * POST /api/sessions/:sessionId/submit-final
 * Single Consolidated Write: Participant submits final code, or match times out, or 3 strikes trigger disqualification.
 * Ingests all telemetry events, strikes, and final code in a single atomic database write!
 */
router.post("/:sessionId/submit-final", async (req: Request, res: Response) => {
  const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  const session = sessionStore.getSession(sessionId);

  if (!session) {
    res.status(404).json({ success: false, error: `Session '${sessionId}' not found.` });
    return;
  }

  const {
    userId = `USER_${Date.now()}`,
    username = "WARRIOR",
    sourceCode = "",
    language = "python",
    strikes = 0,
    telemetryEvents = [],
    snapshotsCount = 0,
    terminationReason,
    isDisqualified = false
  } = req.body;

  try {
    let verdict = "Accepted";
    let score = 0;
    let runtimeMs = 0;
    let memoryKb = 0;
    let evaluationResults: any[] = [];

    if (isDisqualified || strikes >= session.rules.maxStrikes) {
      verdict = "Disqualified (Anti-Cheat Strike Limit Exceeded)";
      score = 0;
    } else if (!sourceCode || sourceCode.trim().length === 0) {
      verdict = "Empty Submission";
      score = 0;
    } else {
      // Execute full compiler evaluation against ALL test cases (both samples and hidden)
      const evaluation = await compilerService.evaluate({
        language,
        sourceCode,
        testCases: session.problem.testCases,
        problemSlug: session.problem.slug,
        timeLimitMs: session.problem.timeLimitMs,
        memoryLimitKb: session.problem.memoryLimitKb
      });

      verdict = evaluation.status;
      score = evaluation.score;
      runtimeMs = evaluation.runtimeMs;
      memoryKb = evaluation.memoryKb;
      evaluationResults = evaluation.results;
    }

    const auditId = `sub_${sessionId}_${Date.now().toString(36)}`;
    const auditRecord: FinalSubmissionAudit = {
      id: auditId,
      sessionId: session.id,
      userId,
      username,
      sourceCode,
      language,
      verdict,
      score,
      runtimeMs,
      memoryKb,
      strikes,
      telemetryEvents: Array.isArray(telemetryEvents) ? telemetryEvents : [],
      snapshotsCount: Number(snapshotsCount) || 0,
      submittedAt: new Date().toISOString(),
      terminationReason,
      results: evaluationResults
    };

    // 1. Record in local memory session store
    sessionStore.recordSubmissionAudit(session.id, auditRecord);

    // 2. Perform Single Atomic Write to Database (Firebase + Local Persistent Engine)
    const dbWriteResult = await databaseService.writeFinalSubmission(auditRecord);

    // 3. Update Contest Standings for live leaderboard
    let standing = store.contestStandings.find(s => s.user_id === userId || s.username === username);
    if (standing) {
      standing.total_score = Math.max(standing.total_score, score);
      standing.is_verified = verdict === "Accepted";
    } else {
      store.contestStandings.push({
        rank: store.contestStandings.length + 1,
        user_id: userId,
        username,
        display_name: username,
        total_score: score,
        penalty: Math.floor(Math.random() * 15) + 5,
        is_verified: verdict === "Accepted"
      });
    }

    store.contestStandings.sort((a, b) => b.total_score - a.total_score || a.penalty - b.penalty);
    store.contestStandings.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    res.status(201).json({
      success: true,
      message: "Final session audit recorded and persisted via single atomic write.",
      data: {
        submissionId: auditRecord.id,
        sessionId: session.id,
        verdict: auditRecord.verdict,
        score: auditRecord.score,
        runtimeMs: auditRecord.runtimeMs,
        memoryKb: auditRecord.memoryKb,
        strikes: auditRecord.strikes,
        dbMode: dbWriteResult.mode,
        results: auditRecord.results
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to finalize session submission" });
  }
});

// =========================================================================
// 2. ADMIN PORTAL MANAGEMENT ENDPOINTS
// =========================================================================

/**
 * POST /api/admin/sessions
 * Admin publishes a new challenge session with all rules, problem details, and test cases.
 * Generates unique KILN-XXXX Session ID and performs a single atomic write to database.
 */
router.post("/admin/create", async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      durationMinutes,
      points,
      rules,
      problem,
      createdBy
    } = req.body;

    if (!problem || !problem.title || !problem.statement) {
      res.status(400).json({ success: false, error: "Problem title and statement are required." });
      return;
    }

    // Create session in local store and generate unique KILN-XXXX Session Code
    const session = sessionStore.createSession({
      title,
      description,
      durationMinutes: Number(durationMinutes) || 45,
      points: Number(points) || Number(problem.points) || 100,
      rules,
      problem,
      createdBy: createdBy || "ADMIN_ORGANIZER"
    });

    // Single Atomic Write to Database (Firebase + Local Persistent Engine)
    const dbResult = await databaseService.writeSession(session);

    res.status(201).json({
      success: true,
      message: "Challenge Session created and published via single atomic write.",
      data: {
        sessionId: session.id,
        title: session.title,
        status: session.status,
        durationMinutes: session.durationMinutes,
        points: session.points,
        problemSlug: session.problem.slug,
        problemTitle: session.problem.title,
        rules: session.rules,
        dbMode: dbResult.mode,
        shareUrl: `/?session=${session.id}`
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to create challenge session" });
  }
});

/**
 * GET /api/admin/sessions
 * Lists all created challenge sessions for the admin dashboard.
 */
router.get("/admin/list", (_req: Request, res: Response) => {
  const sessions = sessionStore.getAllSessions().map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    durationMinutes: s.durationMinutes,
    points: s.points,
    status: s.status,
    problemTitle: s.problem.title,
    problemSlug: s.problem.slug,
    participantsCount: s.participantsCount,
    submissionsCount: s.submissions.length,
    createdAt: s.createdAt
  }));

  res.json({
    success: true,
    total: sessions.length,
    data: sessions
  });
});

/**
 * GET /api/admin/sessions/:sessionId/audit
 * Admin inspects all submissions, anti-cheat strikes, and telemetry timelines for a session.
 */
router.get("/admin/:sessionId/audit", (req: Request, res: Response) => {
  const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  const session = sessionStore.getSession(sessionId);

  if (!session) {
    res.status(404).json({ success: false, error: `Session '${sessionId}' not found.` });
    return;
  }

  res.json({
    success: true,
    data: {
      sessionId: session.id,
      title: session.title,
      rules: session.rules,
      submissions: session.submissions
    }
  });
});

/**
 * POST /api/admin/firebase-config
 * Admin connects / updates Firebase configuration at runtime
 */
router.post("/admin/firebase-config", (req: Request, res: Response) => {
  const { apiKey, projectId, databaseURL } = req.body;
  databaseService.setConfig({ apiKey, projectId, databaseURL });
  res.json({
    success: true,
    message: "Firebase configuration updated.",
    config: {
      projectId: databaseService.getConfig().projectId,
      hasApiKey: !!databaseService.getConfig().apiKey
    }
  });
});

export default router;
