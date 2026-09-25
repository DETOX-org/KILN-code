import { Router, Request, Response } from "express";
import { store } from "../services/store.service.js";

const router = Router();

// GET /api/contests — List active contests
router.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: store.contestState.id,
        title: store.contestState.title,
        status: store.contestState.status,
        participantsCount: store.contestStandings.length,
        discrepancy_count: store.getDiscrepancyQueue().length
      }
    ]
  });
});

// GET /api/contests/:id
router.get("/:id", (req: Request, res: Response) => {
  res.json({
    id: store.contestState.id,
    title: store.contestState.title,
    status: store.contestState.status,
    discrepancy_count: store.getDiscrepancyQueue().length,
    standings: store.contestStandings
  });
});

// GET /api/contests/:id/standings
router.get("/:id/standings", (_req: Request, res: Response) => {
  res.json({
    contest_id: store.contestState.id,
    title: store.contestState.title,
    status: store.contestState.status,
    standings: store.contestStandings
  });
});

// GET /api/contests/:id/leaderboard (alias for standings)
router.get("/:id/leaderboard", (_req: Request, res: Response) => {
  res.json({
    contest_id: store.contestState.id,
    title: store.contestState.title,
    status: store.contestState.status,
    standings: store.contestStandings
  });
});

export default router;
