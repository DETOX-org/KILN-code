import { Router } from "express";
import {
  logTelemetry,
  autoSaveSnapshot,
  terminateSession,
  getSessionAudit
} from "../controllers/telemetry.controller.js";

const router = Router();

// POST /api/challenges/:id/telemetry — Record integrity events (blur, tab switch, paste attempt)
router.post("/challenges/:id/telemetry", logTelemetry);

// POST /api/challenges/:id/autosave — Save 10-second idle debounce snapshot
router.post("/challenges/:id/autosave", autoSaveSnapshot);

// POST /api/challenges/:id/terminate — Handle Escape key exit or forced termination
router.post("/challenges/:id/terminate", terminateSession);

// GET /api/challenges/:id/telemetry/:userId — Inspect audit log for participant
router.get("/challenges/:id/telemetry/:userId", getSessionAudit);

export default router;
