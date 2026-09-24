export type IntegrityEventType =
  | "FULLSCREEN_ENTER"
  | "FULLSCREEN_EXIT"
  | "WINDOW_BLUR"
  | "TAB_SWITCH"
  | "DEVTOOLS_OPEN_ATTEMPT"
  | "EXTERNAL_PASTE_BLOCKED"
  | "INTERNAL_PASTE_ALLOWED"
  | "BURST_TYPING_FLAGGED"
  | "ESCAPE_KEY_PRESSED";

export type ParticipantSessionStatus =
  | "ACTIVE"
  | "STRIKE_WARNING"
  | "SUBMITTED"
  | "TERMINATED"
  | "DISQUALIFIED";

export interface IntegrityEvent {
  id: string;
  challengeId: string;
  userId: string;
  eventType: IntegrityEventType;
  details?: Record<string, any>;
  timestamp: string;
}

export interface CodeSnapshot {
  id: string;
  challengeId: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  timestamp: string;
}

export interface ParticipantSession {
  userId: string;
  challengeId: string;
  status: ParticipantSessionStatus;
  strikes: number;
  maxStrikes: number;
  enteredAt: string;
  lastActiveAt: string;
  latestSnapshot?: CodeSnapshot;
  terminatedAt?: string;
  terminationReason?: string;
}

export interface TelemetryEventInput {
  userId: string;
  eventType: IntegrityEventType;
  details?: Record<string, any>;
}

export interface AutoSaveInput {
  userId: string;
  problemId: string;
  code: string;
  language: string;
}

export interface TerminateSessionInput {
  userId: string;
  reason: string;
  action: "SUBMIT_AND_EXIT" | "ABANDON_AND_TERMINATE";
  code?: string;
  language?: string;
}
