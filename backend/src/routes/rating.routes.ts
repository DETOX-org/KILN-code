import { Router, Request, Response } from "express";
import { leaderboardStore } from "../stores/leaderboard.store.js";
import { scoringService } from "../services/scoring.service.js";

const router = Router();

/**
 * GET /api/ratings/user/:userId
 * Rating history for a specific user
 */
router.get("/user/:userId", (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const history = leaderboardStore.getRatingHistory(userId);
  const profile = leaderboardStore.getUserProfile(userId);

  if (!profile) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    success: true,
    data: {
      userId: profile.userId,
      username: profile.username,
      currentRating: profile.rating,
      tier: profile.tier,
      globalRank: profile.globalRank,
      history
    }
  });
});

/**
 * POST /api/ratings/calculate
 * Calculate what rating change would result from a given contest performance
 * (Preview / simulation endpoint for admin or frontend estimation)
 */
router.post("/calculate", (req: Request, res: Response) => {
  const { currentRating = 1500, rank = 1, totalParticipants = 100 } = req.body;

  const result = scoringService.calculateRatingChange(
    Number(currentRating),
    Number(rank),
    Number(totalParticipants)
  );

  res.json({
    success: true,
    data: {
      currentRating: Number(currentRating),
      rank: Number(rank),
      totalParticipants: Number(totalParticipants),
      ...result
    }
  });
});

/**
 * GET /api/ratings/scoring-config
 * Get the current scoring engine configuration
 */
router.get("/scoring-config", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: scoringService.getConfig()
  });
});

/**
 * POST /api/ratings/update
 * Admin endpoint: update a user's rating after a contest
 */
router.post("/update", (req: Request, res: Response) => {
  const {
    userId,
    contestId,
    contestTitle,
    rank,
    totalParticipants,
    problemsSolved,
    totalProblems
  } = req.body;

  if (!userId || !contestId || !rank || !totalParticipants) {
    res.status(400).json({ error: "userId, contestId, rank, and totalParticipants are required" });
    return;
  }

  const result = leaderboardStore.updateRating(
    userId,
    contestId,
    contestTitle || "Unnamed Contest",
    Number(rank),
    Number(totalParticipants),
    Number(problemsSolved || 0),
    Number(totalProblems || 4)
  );

  if (!result) {
    res.status(404).json({ error: "User not found in leaderboard" });
    return;
  }

  res.json({
    success: true,
    data: result
  });
});

export default router;
