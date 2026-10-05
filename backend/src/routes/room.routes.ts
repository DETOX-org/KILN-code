/**
 * Room Routes — Public Room Viewer
 * 
 * Anyone can enter a room ID to view details, leaderboard, and join.
 * Single metadata read — no authentication required for viewing.
 */

import { Router, Request, Response } from "express";
import { sessionStore } from "../stores/session.store.js";

const router = Router();

/**
 * GET /api/rooms/:sessionId
 * Public room view: metadata + leaderboard in a single read
 */
router.get("/:sessionId", async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;
  const session = await sessionStore.getSession(sessionId);

  if (!session) {
    res.status(404).json({
      success: false,
      error: `Room '${sessionId}' not found. Check the Room ID and try again.`
    });
    return;
  }

  res.json({
    success: true,
    data: session
  });
});

/**
 * GET /api/rooms/:sessionId/leaderboard
 * Room-specific leaderboard only
 */
router.get("/:sessionId/leaderboard", async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;
  const session = await sessionStore.getSession(sessionId);

  if (!session) {
    res.status(404).json({
      success: false,
      error: `Room '${sessionId}' not found.`
    });
    return;
  }

  const leaderboard = session.submissions?.map(s => ({
    username: s.username,
    score: s.score,
    runtimeMs: s.runtimeMs,
    memoryKb: s.memoryKb
  })) || [];

  res.json({
    success: true,
    data: {
      roomId: session.id,
      title: session.title,
      status: session.status,
      participantsCount: session.participantsCount,
      leaderboard
    }
  });
});

/**
 * GET /api/rooms/:sessionId/join
 * Validate if a room is joinable
 */
router.get("/:sessionId/join", async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;
  const session = await sessionStore.getSession(sessionId);

  if (!session) {
    res.status(404).json({
      success: false,
      error: `Room '${sessionId}' not found.`
    });
    return;
  }

  if (session.status !== "live") {
    res.status(403).json({
      success: false,
      error: `Room '${sessionId}' is not active. Status: ${session.status}`,
      joinable: false
    });
    return;
  }

  res.json({
    success: true,
    joinable: true,
    data: {
      roomId: session.id,
      title: session.title,
      status: session.status,
      durationMinutes: session.durationMinutes
    }
  });
});

export default router;
