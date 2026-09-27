/**
 * Admin Routes — Authentication & Dashboard
 * 
 * Admin registers → gets random ADMIN-XXXX ID → logs in with it
 * Dashboard: see all rooms created, participant details, scores, audit
 * Create new rooms (existing flow preserved)
 */

import { Router, Request, Response } from "express";
import { adminStore } from "../stores/admin.store.js";
import { sessionStore } from "../stores/session.store.js";
import { store } from "../services/store.service.js";
import { judgeRouter } from "../services/judge-router.service.js";
import { StaffResolutionAction } from "../types/domain.js";

const router = Router();

// ──────────── Authentication ────────────

/**
 * POST /api/admin/register
 * Create a new admin account, returns unique ADMIN-XXXX ID
 */
router.post("/register", (req: Request, res: Response) => {
  const { displayName } = req.body;
  const profile = adminStore.register(displayName || "");
  res.json({
    success: true,
    message: `Admin account created. Save your Admin ID: ${profile.adminId}`,
    data: profile
  });
});

/**
 * POST /api/admin/login
 * Validate admin ID and return profile
 */
router.post("/login", (req: Request, res: Response) => {
  const { adminId } = req.body;
  if (!adminId) {
    res.status(400).json({ success: false, error: "adminId is required" });
    return;
  }

  const profile = adminStore.login(adminId);
  if (!profile) {
    res.status(401).json({ success: false, error: "Invalid Admin ID. Check your credentials." });
    return;
  }

  // Refresh room count
  const rooms = sessionStore.getSessionsByAdmin(profile.adminId);
  const totalParticipants = rooms.reduce((sum, r) => sum + r.participantsCount, 0);

  res.json({
    success: true,
    data: {
      ...profile,
      totalRoomsCreated: rooms.length,
      totalParticipants
    }
  });
});

/**
 * GET /api/admin/profile
 * Get admin profile (requires x-admin-id header)
 */
router.get("/profile", (req: Request, res: Response) => {
  const adminId = req.headers["x-admin-id"] as string;
  if (!adminId) {
    res.status(401).json({ success: false, error: "x-admin-id header required" });
    return;
  }

  const profile = adminStore.getProfile(adminId);
  if (!profile) {
    res.status(401).json({ success: false, error: "Invalid Admin ID" });
    return;
  }

  const rooms = sessionStore.getSessionsByAdmin(profile.adminId);
  const totalParticipants = rooms.reduce((sum, r) => sum + r.participantsCount, 0);

  res.json({
    success: true,
    data: {
      ...profile,
      totalRoomsCreated: rooms.length,
      totalParticipants
    }
  });
});

// ──────────── Dashboard: Room Management ────────────

/**
 * GET /api/admin/rooms
 * List all rooms created by this admin
 */
router.get("/rooms", (req: Request, res: Response) => {
  const adminId = req.headers["x-admin-id"] as string;
  if (!adminId) {
    res.status(401).json({ success: false, error: "x-admin-id header required" });
    return;
  }

  const profile = adminStore.getProfile(adminId);
  if (!profile) {
    res.status(401).json({ success: false, error: "Invalid Admin ID" });
    return;
  }

  const rooms = sessionStore.getSessionsByAdmin(adminId);

  res.json({
    success: true,
    data: rooms.map(r => ({
      id: r.id,
      title: r.title,
      problemTitle: r.problem.title,
      difficulty: r.problem.difficulty,
      durationMinutes: r.durationMinutes,
      points: r.points,
      status: r.status,
      participantsCount: r.participantsCount,
      submissionsCount: r.submissions.length,
      createdAt: r.createdAt
    }))
  });
});

/**
 * GET /api/admin/rooms/:sessionId
 * Full room detail with participants, scores, and leaderboard
 */
router.get("/rooms/:sessionId", (req: Request, res: Response) => {
  const adminId = req.headers["x-admin-id"] as string;
  if (!adminId) {
    res.status(401).json({ success: false, error: "x-admin-id header required" });
    return;
  }

  const sessionId = req.params.sessionId as string;
  const session = sessionStore.getSession(sessionId);

  if (!session) {
    res.status(404).json({ success: false, error: `Room ${sessionId} not found` });
    return;
  }

  const leaderboard = sessionStore.getLeaderboard(sessionId);

  // Build detailed participant list
  const participants = session.submissions.map(sub => ({
    userId: sub.userId,
    username: sub.username,
    score: sub.score,
    verdict: sub.verdict,
    language: sub.language,
    runtimeMs: sub.runtimeMs,
    memoryKb: sub.memoryKb,
    strikes: sub.strikes,
    snapshotsCount: sub.snapshotsCount,
    submittedAt: sub.submittedAt,
    terminationReason: sub.terminationReason || null,
    telemetryCount: sub.telemetryEvents?.length || 0
  }));

  res.json({
    success: true,
    data: {
      room: {
        id: session.id,
        title: session.title,
        description: session.description,
        durationMinutes: session.durationMinutes,
        points: session.points,
        status: session.status,
        rules: session.rules,
        problem: {
          title: session.problem.title,
          statement: session.problem.statement,
          difficulty: session.problem.difficulty,
          points: session.problem.points,
          testCasesCount: session.problem.testCases.length
        },
        createdAt: session.createdAt,
        createdBy: session.createdBy,
        participantsCount: session.participantsCount
      },
      leaderboard,
      participants
    }
  });
});

/**
 * GET /api/admin/rooms/:sessionId/audit
 * Detailed audit with telemetry data and code for each participant
 */
router.get("/rooms/:sessionId/audit", (req: Request, res: Response) => {
  const adminId = req.headers["x-admin-id"] as string;
  if (!adminId) {
    res.status(401).json({ success: false, error: "x-admin-id header required" });
    return;
  }

  const sessionId = req.params.sessionId as string;
  const session = sessionStore.getSession(sessionId);

  if (!session) {
    res.status(404).json({ success: false, error: `Room ${sessionId} not found` });
    return;
  }

  // Full audit with code and telemetry
  const auditEntries = session.submissions.map(sub => ({
    userId: sub.userId,
    username: sub.username,
    score: sub.score,
    verdict: sub.verdict,
    language: sub.language,
    sourceCode: sub.sourceCode,
    runtimeMs: sub.runtimeMs,
    memoryKb: sub.memoryKb,
    strikes: sub.strikes,
    snapshotsCount: sub.snapshotsCount,
    submittedAt: sub.submittedAt,
    terminationReason: sub.terminationReason || null,
    telemetryEvents: sub.telemetryEvents || [],
    results: sub.results || []
  }));

  // Telemetry summary
  const totalBlurs = auditEntries.reduce((sum, e) =>
    sum + e.telemetryEvents.filter((t: any) => t.eventType === "WINDOW_BLUR").length, 0);
  const totalPasteBlocks = auditEntries.reduce((sum, e) =>
    sum + e.telemetryEvents.filter((t: any) => t.eventType === "EXTERNAL_PASTE_BLOCKED").length, 0);
  const totalStrikes = auditEntries.reduce((sum, e) => sum + e.strikes, 0);

  res.json({
    success: true,
    data: {
      roomId: session.id,
      title: session.title,
      telemetrySummary: {
        totalBlurs,
        totalPasteBlocks,
        totalStrikes,
        totalParticipants: session.participantsCount,
        totalSubmissions: session.submissions.length
      },
      auditEntries
    }
  });
});

// ──────────── Existing Admin Functionality (Preserved) ────────────

// GET /api/admin/discrepancies
router.get("/discrepancies", (_req: Request, res: Response) => {
  const queue = store.getDiscrepancyQueue();
  res.json({
    total_pending: queue.length,
    contest_id: store.contestState.id,
    contest_status: store.contestState.status,
    items: queue
  });
});

// POST /api/admin/discrepancies/:id/resolve
router.post("/discrepancies/:id/resolve", (req: Request, res: Response) => {
  const submissionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { action, notes = "" } = req.body;

  if (!action || !["accept_primary", "accept_verification", "rerun_benchmark"].includes(action)) {
    res.status(400).json({ error: "Invalid action." });
    return;
  }

  try {
    const updated = judgeRouter.resolveDiscrepancy({
      submissionId,
      action: action as StaffResolutionAction,
      notes
    });
    res.json({
      message: "Discrepancy successfully resolved.",
      submission: updated,
      contest_status: store.contestState.status
    });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/admin/contests/:id/finalize
router.post("/contests/:id/finalize", async (req: Request, res: Response) => {
  const contestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const topN = Number(req.body.top_qualifiers || 10);

  try {
    const result = await judgeRouter.finalizeContest(contestId, topN);
    res.json({
      message: result.finalized
        ? "Contest finalized successfully."
        : "Contest finalization blocked: discrepancies flagged.",
      ...result,
      contest_status: store.contestState.status
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
