import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  IntegrityEventType,
  TelemetryEventInput,
  AutoSaveInput,
  TerminateSessionInput,
} from "../types/telemetry.types.js";

import {
  recordTelemetryEvent,
  saveTelemetrySnapshot,
  terminateTelemetrySession,
  getTelemetryAudit,
} from "../repositories/telemetry.repository.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/**
 * POST /api/challenges/:id/telemetry
 * Records integrity telemetry events.
 */
export const logTelemetry = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const challengeId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const { userId, eventType, details } =
      req.body;

    if (!challengeId) {
      res.status(400).json({
        success: false,
        error:
          "Parameter 'id' (challengeId) is required.",
      });
      return;
    }

    if (!userId || typeof userId !== "string") {
      res.status(400).json({
        success: false,
        error: "Field 'userId' is required.",
      });
      return;
    }

    if (!isUuid(userId)) {
      res.status(400).json({
        success: false,
        error:
          "Field 'userId' must be a valid UUID.",
      });
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
      "ESCAPE_KEY_PRESSED",
    ];

    if (
      !eventType ||
      !validEvents.includes(
        eventType as IntegrityEventType,
      )
    ) {
      res.status(400).json({
        success: false,
        error:
          `Field 'eventType' must be one of: ${validEvents.join(", ")}`,
      });
      return;
    }

    const input: TelemetryEventInput = {
      userId,
      eventType:
        eventType as IntegrityEventType,
      details,
    };

    const result =
      await recordTelemetryEvent(
        challengeId,
        input,
      );

    res.status(200).json({
      success: true,
      data: {
        event: result.event,
        sessionStatus:
          result.session.status,
        strikes:
          result.session.strikes,
        maxStrikes:
          result.session.maxStrikes,
        isTerminated:
          result.session.status ===
          "TERMINATED",
        terminationReason:
          result.session
            .terminationReason,
        dbMode: "postgres",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/challenges/:id/autosave
 * Persists workspace code snapshots to PostgreSQL.
 */
export const autoSaveSnapshot = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const challengeId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const {
      userId,
      problemId,
      code,
      language,
    } = req.body;

    if (
      !challengeId ||
      !userId ||
      !problemId ||
      typeof code !== "string" ||
      !language
    ) {
      res.status(400).json({
        success: false,
        error:
          "Fields 'userId', 'problemId', 'code', and 'language' are required.",
      });
      return;
    }

    if (!isUuid(userId)) {
      res.status(400).json({
        success: false,
        error:
          "Field 'userId' must be a valid UUID.",
      });
      return;
    }

    if (!isUuid(problemId)) {
      res.status(400).json({
        success: false,
        error:
          "Field 'problemId' must be a valid UUID.",
      });
      return;
    }

    const input: AutoSaveInput = {
      userId,
      problemId,
      code,
      language,
    };

    const result =
      await saveTelemetrySnapshot(
        challengeId,
        input,
      );

    res.status(200).json({
      success: true,
      message:
        "Snapshot saved successfully.",
      data: {
        snapshotId:
          result.snapshot.id,
        savedAt:
          result.snapshot.timestamp,
        totalSnapshots:
          result.totalSnapshots,
        dbMode: "postgres",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/challenges/:id/terminate
 * Handles workspace termination or submit-and-exit.
 */
export const terminateSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const challengeId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const {
      userId,
      reason,
      action,
      code,
      language,
    } = req.body;

    if (!challengeId || !userId) {
      res.status(400).json({
        success: false,
        error:
          "Fields 'challengeId' and 'userId' are required.",
      });
      return;
    }

    if (
      typeof userId !== "string" ||
      !isUuid(userId)
    ) {
      res.status(400).json({
        success: false,
        error:
          "Field 'userId' must be a valid UUID.",
      });
      return;
    }

    const validActions = [
      "SUBMIT_AND_EXIT",
      "ABANDON_AND_TERMINATE",
    ];

    const chosenAction =
      validActions.includes(action)
        ? action
        : "ABANDON_AND_TERMINATE";

    const input: TerminateSessionInput = {
      userId,
      reason:
        reason ||
        "User initiated termination from workspace",
      action: chosenAction,
      code,
      language,
    };

    const session =
      await terminateTelemetrySession(
        challengeId,
        input,
      );

    res.status(200).json({
      success: true,
      message:
        `Session has been ${session.status.toLowerCase()}.`,
      data: {
        userId: session.userId,
        challengeId:
          session.challengeId,
        status: session.status,
        terminatedAt:
          session.terminatedAt,
        terminationReason:
          session.terminationReason,
        dbMode: "postgres",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/challenges/:id/telemetry/:userId
 * Retrieves PostgreSQL-backed audit history.
 */
export const getSessionAudit = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const challengeId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const userId = Array.isArray(
      req.params.userId,
    )
      ? req.params.userId[0]
      : req.params.userId;

    if (!challengeId || !userId) {
      res.status(400).json({
        success: false,
        error:
          "Parameters 'id' and 'userId' are required.",
      });
      return;
    }

    if (!isUuid(userId)) {
      res.status(400).json({
        success: false,
        error:
          "Parameter 'userId' must be a valid UUID.",
      });
      return;
    }

    const audit =
      await getTelemetryAudit(
        challengeId,
        userId,
      );

    res.status(200).json({
      success: true,
      data: audit,
      dbMode: "postgres",
    });
  } catch (error) {
    next(error);
  }
};