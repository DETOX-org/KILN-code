import {
  Router,
  Request,
  Response,
} from "express";

import {
  getChallengeLeaderboard,
  getContestList,
} from "../repositories/leaderboard.repository.js";

const router = Router();

function getContestId(req: Request): string {
  return Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
}

// GET /api/contests
// Kept for compatibility with the current frontend.
// GET /api/contests
// Lists contests directly from PostgreSQL.
router.get(
  "/",
  async (
    _req: Request,
    res: Response,
  ) => {
    try {
      const contests =
        await getContestList();

      res.json({
        success: true,
        data: contests,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error:
          err.message ||
          "Failed to load contests",
      });
    }
  },
);

// GET /api/contests/:id
// Contest details + PostgreSQL-backed standings.
// GET /api/contests
// Lists contests directly from PostgreSQL.

// GET /api/contests/:id
// Contest details + PostgreSQL-backed standings.
router.get(
  "/:id",
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const contestId = Array.isArray(
        req.params.id,
      )
        ? req.params.id[0]
        : req.params.id;

      const leaderboard =
        await getChallengeLeaderboard(
          contestId,
        );

      res.json({
        id:
          leaderboard.contestId,
        title:
          leaderboard.title,
        status:
          leaderboard.status,
        standings:
          leaderboard.standings,
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        error:
          err.message ||
          "Failed to load contest",
      });
    }
  },
);

// GET /api/contests/:id/standings
router.get(
  "/:id/standings",
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const leaderboard =
        await getChallengeLeaderboard(
          getContestId(req),
        );

      res.json({
        contest_id:
          leaderboard.contestId,
        title:
          leaderboard.title,
        status:
          leaderboard.status,
        standings:
          leaderboard.standings,
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        error:
          err.message ||
          "Failed to load contest standings",
      });
    }
  },
);

// GET /api/contests/:id/leaderboard
router.get(
  "/:id/leaderboard",
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const leaderboard =
        await getChallengeLeaderboard(
          getContestId(req),
        );

      res.json({
        contest_id:
          leaderboard.contestId,
        title:
          leaderboard.title,
        status:
          leaderboard.status,
        standings:
          leaderboard.standings,
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        error:
          err.message ||
          "Failed to load contest leaderboard",
      });
    }
  },
);

export default router;
