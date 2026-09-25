import { Router, Request, Response } from "express";
import { store } from "../services/store.service.js";
import { judgeRouter } from "../services/judge-router.service.js";
import { StaffResolutionAction } from "../types/domain.js";

const router = Router();

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
    res.status(400).json({ error: "Invalid action. Must be 'accept_primary', 'accept_verification', or 'rerun_benchmark'." });
    return;
  }

  try {
    const updated = judgeRouter.resolveDiscrepancy({
      submissionId,
      action: action as StaffResolutionAction,
      notes
    });

    res.json({
      message: "Discrepancy successfully resolved by staff.",
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
        ? "Contest finalized successfully. All top qualifying submissions verified."
        : "Contest finalization blocked: discrepancies flagged for staff review.",
      ...result,
      contest_status: store.contestState.status
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
