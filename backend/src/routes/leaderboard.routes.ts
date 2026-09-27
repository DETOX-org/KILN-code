import { Router, Request, Response } from "express";
import { leaderboardStore } from "../stores/leaderboard.store.js";

const router = Router();

/**
 * GET /api/leaderboards
 * Global leaderboard with filtering, search, pagination
 */
router.get("/", (req: Request, res: Response) => {
  const {
    limit = "20",
    offset = "0",
    search,
    tier,
    timeRange = "all"
  } = req.query;

  const result = leaderboardStore.getGlobalLeaderboard({
    limit: Math.min(Number(limit), 100),
    offset: Number(offset),
    search: search as string | undefined,
    tier: tier as string | undefined,
    timeRange: timeRange as 'all' | 'monthly' | 'weekly' | 'daily'
  });

  res.json({
    success: true,
    data: result.entries,
    pagination: {
      total: result.total,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < result.total
    }
  });
});

/**
 * GET /api/leaderboards/stats
 * Platform-wide leaderboard statistics
 */
router.get("/stats", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: leaderboardStore.getStats()
  });
});

/**
 * GET /api/leaderboards/user/:userId
 * Full profile for a specific user
 */
router.get("/user/:userId", (req: Request, res: Response) => {
  const profile = leaderboardStore.getUserProfile(req.params.userId);
  if (!profile) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    success: true,
    data: profile
  });
});

/**
 * GET /api/leaderboards/user/:userId/achievements
 * Achievements for a specific user
 */
router.get("/user/:userId/achievements", (req: Request, res: Response) => {
  const achievements = leaderboardStore.getAchievements(req.params.userId);
  res.json({
    success: true,
    data: achievements
  });
});

export default router;
