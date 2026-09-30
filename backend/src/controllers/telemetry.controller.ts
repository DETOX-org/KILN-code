import { Request, Response, NextFunction } from "express";
import { telemetryStore } from "../stores/telemetry.store.js";
import {
  IntegrityEventType,
  TelemetryEventInput,
  AutoSaveInput,
  TerminateSessionInput
} from "../types/telemetry.types.js";

/**
 * POST /api/challenges/:id/telemetry
 * Records integrity telemetry events (blur, tab switch, fullscreen exit, paste attempt)
 */
export const logTelemetry = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const challengeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { userId, eventType, details } = req.body;

    if (!challengeId) {
      res.status(400).json({ success: false, error: "Parameter 'id' (challengeId) is required." });
      return;
    }

    if (!userId || typeof userId !== "string") {
      res.status(400).json({ success: false, error: "Field 'userId' is required." });
      return;
    }

    const validEvents: IntegrityEventType[] = [
      "FULLSCREEN_ENTER",
      "FULLSCREEN_EXIT",
      "WINDOW_BLUR",
      "TAB_SWITCH",
      "DEVTOOLS_OPEN_ATTEMPT",
      "EXTERNAL_PASTE_BLOCKED",
      "INTERNAL_PASTE_ALLOWED",
      "BURST_TYPING_FLAGGED",
      "ESCAPE_KEY_PRESSED"
    ];

    if (!eventType || !validEvents.includes(eventType as IntegrityEventType)) {
      res.status(400).json({
        success: false,
        error: `Field 'eventType' must be one of: ${validEvents.join(", ")}`
      });
      return;
    }

    const input: TelemetryEventInput = {
      userId,
      eventType: eventType as IntegrityEventType,
      details
    };

    const result = telemetryStore.recordEvent(challengeId, input);

    res.status(200).json({
      success: true,
      data: {
        event: result.event,
        sessionStatus: result.session.status,
        strikes: result.session.strikes,
        maxStrikes: result.session.maxStrikes,
        isTerminated: result.session.status === "TERMINATED",
        terminationReason: result.session.terminationReason
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/challenges/:id/autosave
 * Receives the 10-second idle debounce snapshot from the workspace
 */
export const autoSaveSnapshot = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const challengeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { userId, problemId, code, language } = req.body;

    if (!challengeId || !userId || !problemId || typeof code !== "string" || !language) {
      res.status(400).json({
        success: false,
        error: "Fields 'userId', 'problemId', 'code', and 'language' are required."
      });
      return;
    }

    const input: AutoSaveInput = {
      userId,
      problemId,
      code,
      language
    };

    const result = telemetryStore.saveSnapshot(challengeId, input);

    res.status(200).json({
      success: true,
      message: "Snapshot saved successfully.",
      data: {
        snapshotId: result.snapshot.id,
        savedAt: result.snapshot.timestamp,
        totalSnapshots: result.totalSnapshots
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/challenges/:id/terminate
 * Handles user Escape key exit or strike-based contest termination
 */
export const terminateSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const challengeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { userId, reason, action, code, language } = req.body;

    if (!challengeId || !userId) {
      res.status(400).json({ success: false, error: "Fields 'challengeId' and 'userId' are required." });
      return;
    }

    const validActions = ["SUBMIT_AND_EXIT", "ABANDON_AND_TERMINATE"];
    const chosenAction = validActions.includes(action) ? action : "ABANDON_AND_TERMINATE";

    const input: TerminateSessionInput = {
      userId,
      reason: reason || "User initiated termination from workspace",
      action: chosenAction,
      code,
      language
    };

    const session = telemetryStore.terminateSession(challengeId, input);

    res.status(200).json({
      success: true,
      message: `Session has been ${session.status.toLowerCase()}.`,
      data: {
        userId: session.userId,
        challengeId: session.challengeId,
        status: session.status,
        terminatedAt: session.terminatedAt,
        terminationReason: session.terminationReason
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/challenges/:id/telemetry/:userId
 * Retrieves audit history and snapshot count for organizer inspection
 */
export const getSessionAudit = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const challengeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

    if (!challengeId || !userId) {
      res.status(400).json({ success: false, error: "Parameters 'id' and 'userId' are required." });
      return;
    }

    const audit = telemetryStore.getAuditHistory(challengeId, userId);

    res.status(200).json({
      success: true,
      data: audit
    });
  } catch (error) {
    next(error);
  }
};
