import {
  createSession,
  findAllSessions,
  findSessionByCode,
} from "../repositories/session.repository.js";

import type { TestCaseInput } from "../services/compiler.service.js";

export interface SessionRules {
  fullscreenEnforced: boolean;
  maxStrikes: number;
  blockExternalPaste: boolean;
  autoSaveIntervalSec: number;
}

export interface SessionProblem {
  id: string;
  slug: string;
  title: string;
  statement: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  timeLimitMs: number;
  memoryLimitKb: number;
  testCases: TestCaseInput[];
  starterTemplates?: Record<string, string>;
}

export interface FinalSubmissionAudit {
  id: string;
  sessionId: string;
  userId: string;
  username: string;
  sourceCode: string;
  language: string;
  verdict: string;
  score: number;
  runtimeMs: number;
  memoryKb: number;
  strikes: number;
  telemetryEvents: any[];
  snapshotsCount: number;
  submittedAt: string;
  terminationReason?: string;
  results?: any[];
}

export interface ChallengeSession {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  points: number;
  status: "scheduled" | "live" | "closed" | "archived";
  rules: SessionRules;
  problem: SessionProblem;
  createdAt: string;
  createdBy: string;
  participantsCount: number;
  submissions: FinalSubmissionAudit[];
}

/*
 * Compatibility adapter.
 *
 * Session data itself is no longer stored here.
 * All session reads/writes go through the PostgreSQL repository.
 */
export const sessionStore = {
  getSession: findSessionByCode,
  getAllSessions: findAllSessions,
  createSession,
};