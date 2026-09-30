import fs from "node:fs";
import path from "node:path";
import { TestCaseInput } from "../services/compiler.service.js";

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
  id: string; // e.g. KILN-8392
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

// Seed initial default session KILN-1001 for out-of-the-box instant entry
const DEFAULT_SESSION: ChallengeSession = {
  id: "KILN-1001",
  title: "SEASON 01 // KILN TRIAL ARRAY CONFLICT",
  description: "Official Daily Synchronous Challenge — Proctored Algorithmic Arena",
  durationMinutes: 45,
  points: 100,
  status: "live",
  rules: {
    fullscreenEnforced: true,
    maxStrikes: 3,
    blockExternalPaste: true,
    autoSaveIntervalSec: 10
  },
  problem: {
    id: "prob-two-sum",
    slug: "two-sum",
    title: "1. Two Sum",
    statement: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.`,
    difficulty: "easy",
    points: 100,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    testCases: [
      { id: "tc-001", input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isSample: true, points: 33 },
      { id: "tc-002", input: "3\n3 2 4\n6", expectedOutput: "1 2", isSample: true, points: 33 },
      { id: "tc-003", input: "2\n3 3\n6", expectedOutput: "0 1", isSample: false, points: 34 }
    ]
  },
  createdAt: new Date().toISOString(),
  createdBy: "ADMIN_CORE",
  participantsCount: 4,
  submissions: [
    {
      id: "sub-seed-01",
      sessionId: "KILN-1001",
      userId: "CODER_CYBER_BLADE",
      username: "CYBER_BLADE",
      sourceCode: "# Solved optimal hashmap",
      language: "python",
      verdict: "Accepted",
      score: 100,
      runtimeMs: 38,
      memoryKb: 13800,
      strikes: 0,
      telemetryEvents: [],
      snapshotsCount: 12,
      submittedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

export class SessionStore {
  private sessions: Map<string, ChallengeSession> = new Map();

  constructor() {
    this.sessions.set(DEFAULT_SESSION.id, DEFAULT_SESSION);
  }

  public generateSessionId(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const fullId = `KILN-${code}`;
    if (this.sessions.has(fullId)) {
      return this.generateSessionId();
    }
    return fullId;
  }

  public createSession(data: {
    title: string;
    description?: string;
    durationMinutes?: number;
    points?: number;
    rules?: Partial<SessionRules>;
    problem: {
      title: string;
      slug?: string;
      statement: string;
      difficulty?: "easy" | "medium" | "hard";
      points?: number;
      timeLimitMs?: number;
      memoryLimitKb?: number;
      testCases: TestCaseInput[];
      starterTemplates?: Record<string, string>;
    };
    createdBy?: string;
  }): ChallengeSession {
    const sessionId = this.generateSessionId();
    const slug = data.problem.slug || data.problem.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const newSession: ChallengeSession = {
      id: sessionId,
      title: data.title || `ARENA MATCH // ${slug.toUpperCase()}`,
      description: data.description || "Synchronous Time-Bound Competitive Coding Session",
      durationMinutes: data.durationMinutes || 45,
      points: data.points || data.problem.points || 100,
      status: "live",
      rules: {
        fullscreenEnforced: data.rules?.fullscreenEnforced ?? true,
        maxStrikes: data.rules?.maxStrikes ?? 3,
        blockExternalPaste: data.rules?.blockExternalPaste ?? true,
        autoSaveIntervalSec: data.rules?.autoSaveIntervalSec ?? 10
      },
      problem: {
        id: `prob-${Date.now()}`,
        slug,
        title: data.problem.title,
        statement: data.problem.statement,
        difficulty: data.problem.difficulty || "easy",
        points: data.problem.points || 100,
        timeLimitMs: data.problem.timeLimitMs || 2000,
        memoryLimitKb: data.problem.memoryLimitKb || 262144,
        testCases: data.problem.testCases || [],
        starterTemplates: data.problem.starterTemplates
      },
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || "ADMIN",
      participantsCount: 0,
      submissions: []
    };

    this.sessions.set(sessionId, newSession);
    return newSession;
  }

  public getSession(id: string): ChallengeSession | undefined {
    return this.sessions.get(id.toUpperCase().trim());
  }

  public getAllSessions(): ChallengeSession[] {
    return Array.from(this.sessions.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public recordSubmissionAudit(sessionId: string, audit: FinalSubmissionAudit): FinalSubmissionAudit {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.submissions.unshift(audit);
    session.participantsCount = new Set(session.submissions.map(s => s.userId)).size;
    return audit;
  }

  /**
   * Get room-specific leaderboard for a session
   * Aggregates best submission per user, sorted by score desc, penalty asc
   */
  public getLeaderboard(sessionId: string): {
    rank: number;
    userId: string;
    username: string;
    score: number;
    verdict: string;
    runtimeMs: number;
    memoryKb: number;
    strikes: number;
    submittedAt: string;
    language: string;
  }[] {
    const session = this.getSession(sessionId);
    if (!session) return [];

    // Aggregate best submission per user
    const userBest = new Map<string, FinalSubmissionAudit>();
    for (const sub of session.submissions) {
      const existing = userBest.get(sub.userId);
      if (!existing || sub.score > existing.score) {
        userBest.set(sub.userId, sub);
      }
    }

    // Sort by score desc, then runtime asc
    const sorted = Array.from(userBest.values())
      .sort((a, b) => b.score - a.score || a.runtimeMs - b.runtimeMs);

    return sorted.map((sub, idx) => ({
      rank: idx + 1,
      userId: sub.userId,
      username: sub.username,
      score: sub.score,
      verdict: sub.verdict,
      runtimeMs: sub.runtimeMs,
      memoryKb: sub.memoryKb,
      strikes: sub.strikes,
      submittedAt: sub.submittedAt,
      language: sub.language
    }));
  }

  /**
   * Get all sessions created by a specific admin
   */
  public getSessionsByAdmin(adminId: string): ChallengeSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.createdBy === adminId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get room metadata for public viewing (without hidden test cases)
   */
  public getRoomPublicView(sessionId: string): {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    points: number;
    status: string;
    rules: SessionRules;
    problem: { title: string; statement: string; difficulty: string; points: number };
    createdAt: string;
    createdBy: string;
    participantsCount: number;
    leaderboard: ReturnType<SessionStore["getLeaderboard"]>;
  } | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    return {
      id: session.id,
      title: session.title,
      description: session.description,
      durationMinutes: session.durationMinutes,
      points: session.points,
      status: session.status,
      rules: session.rules,
      problem: {
        title: session.problem.title,
        statement: session.problem.statement,
        difficulty: session.problem.difficulty,
        points: session.problem.points
      },
      createdAt: session.createdAt,
      createdBy: session.createdBy,
      participantsCount: session.participantsCount,
      leaderboard: this.getLeaderboard(sessionId)
    };
  }
}

export const sessionStore = new SessionStore();

