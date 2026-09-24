import {
  IntegrityEvent,
  ParticipantSession,
  CodeSnapshot,
  TelemetryEventInput,
  AutoSaveInput,
  TerminateSessionInput
} from "../types/telemetry.types.js";

export class TelemetryStore {
  private sessions = new Map<string, ParticipantSession>();
  private events: IntegrityEvent[] = [];
  private snapshots = new Map<string, CodeSnapshot[]>();

  private getSessionKey(challengeId: string, userId: string): string {
    return `${challengeId}:${userId}`;
  }

  private getSnapshotKey(challengeId: string, userId: string, problemId: string): string {
    return `${challengeId}:${userId}:${problemId}`;
  }

  public getOrCreateSession(challengeId: string, userId: string): ParticipantSession {
    const key = this.getSessionKey(challengeId, userId);
    let session = this.sessions.get(key);

    if (!session) {
      const now = new Date().toISOString();
      session = {
        userId,
        challengeId,
        status: "ACTIVE",
        strikes: 0,
        maxStrikes: 3,
        enteredAt: now,
        lastActiveAt: now
      };
      this.sessions.set(key, session);
    }

    return session;
  }

  public recordEvent(challengeId: string, input: TelemetryEventInput): {
    event: IntegrityEvent;
    session: ParticipantSession;
    strikeAdded: boolean;
  } {
    const session = this.getOrCreateSession(challengeId, input.userId);
    const now = new Date().toISOString();

    const eventId = `evt-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const event: IntegrityEvent = {
      id: eventId,
      challengeId,
      userId: input.userId,
      eventType: input.eventType,
      details: input.details || {},
      timestamp: now
    };

    this.events.push(event);
    session.lastActiveAt = now;

    // Check if this event causes a security strike
    const STRIKE_EVENTS = new Set([
      "FULLSCREEN_EXIT",
      "WINDOW_BLUR",
      "TAB_SWITCH",
      "EXTERNAL_PASTE_BLOCKED",
      "BURST_TYPING_FLAGGED"
    ]);

    let strikeAdded = false;
    const isSessionLive =
      session.status === "ACTIVE" || session.status === "STRIKE_WARNING";

    if (STRIKE_EVENTS.has(input.eventType) && isSessionLive) {
      session.strikes += 1;
      strikeAdded = true;

      if (session.strikes >= session.maxStrikes) {
        session.status = "TERMINATED";
        session.terminatedAt = now;
        session.terminationReason = `Exceeded maximum anti-cheat violation strikes (${session.strikes}/${session.maxStrikes})`;
      } else {
        session.status = "STRIKE_WARNING";
      }
    }

    return { event, session, strikeAdded };
  }

  public saveSnapshot(challengeId: string, input: AutoSaveInput): {
    snapshot: CodeSnapshot;
    totalSnapshots: number;
  } {
    const session = this.getOrCreateSession(challengeId, input.userId);
    const now = new Date().toISOString();

    const snapshotId = `snap-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const snapshot: CodeSnapshot = {
      id: snapshotId,
      challengeId,
      userId: input.userId,
      problemId: input.problemId,
      code: input.code,
      language: input.language,
      timestamp: now
    };

    const key = this.getSnapshotKey(challengeId, input.userId, input.problemId);
    let list = this.snapshots.get(key);
    if (!list) {
      list = [];
      this.snapshots.set(key, list);
    }
    list.push(snapshot);

    session.lastActiveAt = now;
    session.latestSnapshot = snapshot;

    return { snapshot, totalSnapshots: list.length };
  }

  public terminateSession(challengeId: string, input: TerminateSessionInput): ParticipantSession {
    const session = this.getOrCreateSession(challengeId, input.userId);
    const now = new Date().toISOString();

    session.status = input.action === "SUBMIT_AND_EXIT" ? "SUBMITTED" : "TERMINATED";
    session.terminatedAt = now;
    session.terminationReason = input.reason || "User initiated termination";

    if (input.code && input.language) {
      session.latestSnapshot = {
        id: `snap-final-${Date.now()}`,
        challengeId,
        userId: input.userId,
        problemId: "final",
        code: input.code,
        language: input.language,
        timestamp: now
      };
    }

    return session;
  }

  public getAuditHistory(challengeId: string, userId: string): {
    session: ParticipantSession;
    events: IntegrityEvent[];
    snapshots: CodeSnapshot[];
  } {
    const session = this.getOrCreateSession(challengeId, userId);
    const events = this.events.filter(
      (e) => e.challengeId === challengeId && e.userId === userId
    );

    const userSnapshots: CodeSnapshot[] = [];
    for (const [key, snaps] of this.snapshots.entries()) {
      if (key.startsWith(`${challengeId}:${userId}:`)) {
        userSnapshots.push(...snaps);
      }
    }

    return { session, events, snapshots: userSnapshots };
  }
}

export const telemetryStore = new TelemetryStore();
