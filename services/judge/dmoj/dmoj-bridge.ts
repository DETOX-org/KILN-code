import { randomUUID } from "node:crypto";
import net, { type Socket } from "node:net";

import {
  createDmojPacketReader,
  sendDmojPacket
} from "./dmoj-protocol.js";

import type {
  DmojCaseResult,
  DmojHandshakePacket,
  DmojSubmissionRequestPacket
} from "./dmoj-types.js";

import type {
  DmojMappedSubmissionState
} from "./dmoj-result.js";

const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_PORT = 9999;
const SUPPORTED_PROBLEM_WAIT_MS = 5000;
const JUDGE_TIME_LIMIT = 5;
const JUDGE_MEMORY_LIMIT = 262144;

export interface DmojBridgeSubmission {
  problemId: string;
  language: string;
  source: string;
  timeLimit?: number;
  memoryLimit?: number;
  shortCircuit?: boolean;
  meta?: Record<string, unknown>;
}

export interface DmojBridgeHealth {
  connected: boolean;
  judgeId: string | null;
  executorCount: number;
  problemCount: number;
}

export class DmojBridge {
  private readonly host =
    process.env.DMOJ_BRIDGE_HOST ?? DEFAULT_HOST;

  private readonly port = Number(
    process.env.DMOJ_BRIDGE_PORT ?? DEFAULT_PORT
  );

  private readonly judgeName =
    process.env.DMOJ_JUDGE_NAME ??
    "kiln-dmoj-judge";

  private readonly judgeKey =
    process.env.DMOJ_JUDGE_KEY ??
    "kiln-dmoj-key";

  private readonly server = net.createServer(
    (socket) => {
      void this.handleConnection(socket);
    }
  );

  private socket: Socket | null = null;
  private handshakeComplete = false;
  private pingInterval: NodeJS.Timeout | null = null;
  private judgeId: string | null = null;
  private executors: Record<string, unknown> = {};
  private supportedProblems = new Set<string>();

  private readonly submissions = new Map<
    number,
    DmojMappedSubmissionState
  >();

  private readonly waiters = new Map<
    string,
    {
      submissionId: number;
      resolve: (
        state: DmojMappedSubmissionState
      ) => void;
      reject: (error: Error) => void;
    }
  >();

  private nextSubmissionId = 1;

  async start(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => {
        this.server.off("listening", onListening);
        reject(error);
      };

      const onListening = () => {
        this.server.off("error", onError);
        resolve();
      };

      this.server.once("error", onError);
      this.server.once("listening", onListening);

      this.server.listen(this.port, this.host);
    });

    console.log(
      `DMOJ bridge listening on ${this.host}:${this.port}`
    );
  }

  async close(): Promise<void> {
    this.failAll(
      new Error("DMOJ bridge shutting down")
    );

    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }

    if (!this.server.listening) {
      return;
    }

    await new Promise<void>((resolve) => {
      this.server.close(() => resolve());
    });
  }

  healthcheck(): boolean {
    return (
      this.socket !== null &&
      this.handshakeComplete
    );
  }

  getHealth(): DmojBridgeHealth {
    return {
      connected: this.healthcheck(),
      judgeId: this.judgeId,
      executorCount: Object.keys(
        this.executors
      ).length,
      problemCount: this.supportedProblems.size
    };
  }

  async submit(
    submission: DmojBridgeSubmission
  ): Promise<string> {
    if (!this.healthcheck() || !this.socket) {
      throw new Error(
        "DMOJ judge is not connected"
      );
    }

    const submissionId = this.nextSubmissionId++;
    const jobId = randomUUID();

    const state: DmojMappedSubmissionState = {
      jobId,
      submissionId,
      problemId: submission.problemId,
      language: submission.language,
      status: "pending",
      compileMessage: "",
      compileError: "",
      internalError: "",
      cases: [],
      finished: false
    };

    this.submissions.set(
      submissionId,
      state
    );

    await this.waitForSupportedProblem(
      submission.problemId
    );

    const packet: DmojSubmissionRequestPacket = {
      name: "submission-request",
      "submission-id": submissionId,
      "problem-id": submission.problemId,
      language: submission.language,
      source: submission.source,
      "time-limit":
        submission.timeLimit ?? JUDGE_TIME_LIMIT,
      "memory-limit":
        submission.memoryLimit ??
        JUDGE_MEMORY_LIMIT,
      "short-circuit":
        submission.shortCircuit ?? true,
      meta: submission.meta ?? {}
    };

    try {
      await sendDmojPacket(
        this.socket,
        packet as unknown as Record<
          string,
          unknown
        >
      );
    } catch (error) {
      this.submissions.delete(submissionId);

      throw error instanceof Error
        ? error
        : new Error(String(error));
    }

    return jobId;
  }

  async poll(
    jobId: string
  ): Promise<DmojMappedSubmissionState> {
    const state = [...this.submissions.values()]
      .find((item) => item.jobId === jobId);

    if (!state) {
      throw new Error(
        `Unknown DMOJ job: ${jobId}`
      );
    }

    if (state.finished) {
      return state;
    }

    return new Promise<DmojMappedSubmissionState>(
      (resolve, reject) => {
        this.waiters.set(jobId, {
          submissionId: state.submissionId,
          resolve,
          reject
        });
      }
    );
  }

  async waitForSupportedProblem(
    problemId: string
  ): Promise<void> {
    if (this.supportedProblems.has(problemId)) {
      return;
    }

    const deadline =
      Date.now() + SUPPORTED_PROBLEM_WAIT_MS;

    while (
      Date.now() < deadline
    ) {
      if (
        this.supportedProblems.has(problemId)
      ) {
        return;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 100)
      );
    }

    throw new Error(
      `DMOJ judge did not report problem "${problemId}" as supported`
    );
  }

  private async handleConnection(
    socket: Socket
  ): Promise<void> {
    if (this.socket) {
      socket.destroy();
      return;
    }

    this.socket = socket;
    this.handshakeComplete = false;
    this.judgeId = null;
    this.executors = {};
    this.supportedProblems.clear();

    socket.setNoDelay(true);

    createDmojPacketReader(
      socket,
      (packet) => {
        void this.handlePacket(packet);
      },
      (error) => {
        this.handleConnectionFailure(error);
      }
    );

    socket.once("close", () => {
      if (this.socket === socket) {
        this.handleConnectionFailure(
          new Error(
            "DMOJ judge connection closed"
          )
        );
      }
    });
  }

  private async handlePacket(
    packet: Record<string, unknown>
  ): Promise<void> {
    const name = packet.name;

    if (!this.handshakeComplete) {
      await this.handleHandshake(packet);
      return;
    }

    if (
      name === "supported-problems"
    ) {
      const problems = Array.isArray(
        packet.problems
      )
        ? packet.problems
        : [];

      this.supportedProblems = new Set(
        problems
          .filter(
            (item): item is [string, number] =>
              Array.isArray(item) &&
              typeof item[0] === "string"
          )
          .map((item) => item[0])
      );

      return;
    }

    const submissionId =
      typeof packet["submission-id"] ===
      "number"
        ? packet["submission-id"]
        : null;

    if (submissionId === null) {
      return;
    }

    const state =
      this.submissions.get(submissionId);

    if (!state) {
      return;
    }

    switch (name) {
      case "submission-acknowledged":
        return;

      case "ping":
        await sendDmojPacket(this.socket!, { name: "pong" });
        return;

      case "compile-message":
        state.status = "compiling";
        state.compileMessage =
          typeof packet.log === "string"
            ? packet.log
            : "";
        return;

      case "grading-begin":
        state.status = "running";
        return;

      case "test-case-status":
        state.cases.push(
          ...this.parseCases(packet.cases)
        );
        return;

      case "compile-error":
        state.status = "failed";
        state.compileError =
          typeof packet.log === "string"
            ? packet.log
            : "Compilation failed";
        this.finish(state);
        return;

      case "internal-error":
        state.status = "failed";
        state.internalError =
          typeof packet.message === "string"
            ? packet.message
            : "DMOJ internal error";
        this.finish(state);
        return;

      case "submission-terminated":
        state.status = "terminated";
        state.internalError =
          "Submission terminated by judge";
        this.finish(state);
        return;

      case "grading-end":
        state.status = "completed";
        this.finish(state);
        return;

      default:
        return;
    }
  }

  private async handleHandshake(
    packet: Record<string, unknown>
  ): Promise<void> {
    if (packet.name !== "handshake") {
      throw new Error(
        "Expected DMOJ handshake"
      );
    }

    const handshake =
      packet as unknown as DmojHandshakePacket;

    if (
      handshake.id !== this.judgeName ||
      handshake.key !== this.judgeKey
    ) {
      await sendDmojPacket(
        this.socket!,
        { name: "handshake-failed" }
      );

      this.socket?.destroy();

      throw new Error(
        "DMOJ judge authentication failed"
      );
    }

    this.judgeId = handshake.id;
    this.executors =
      handshake.executors ?? {};

    this.supportedProblems = new Set(
      (handshake.problems ?? []).map(
        ([problemId]) => problemId
      )
    );

    await sendDmojPacket(
      this.socket!,
      { name: "handshake-success" }
    );

    this.handshakeComplete = true;

    console.log(
      `DMOJ judge connected: ${this.judgeId} (${Object.keys(this.executors).length} executors, ${this.supportedProblems.size} problems)`
    );
    this.pingInterval = setInterval(() => {
      if (this.socket) {
        void sendDmojPacket(this.socket, {
          name: "ping",
          when: Date.now() / 1000
        });
      }
    }, 30000);
  }

  private parseCases(
    value: unknown
  ): DmojCaseResult[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (item): item is DmojCaseResult =>
        typeof item === "object" &&
        item !== null &&
        typeof (
          item as Record<string, unknown>
        ).position === "number" &&
        typeof (
          item as Record<string, unknown>
        ).status === "number"
    );
  }

  private finish(
    state: DmojMappedSubmissionState
  ): void {
    state.finished = true;

    const waiter = this.waiters.get(
      state.jobId
    );

    if (!waiter) {
      if (this.pingInterval) {
       clearInterval(this.pingInterval);
       this.pingInterval = null;
      }
      return;
    }

    this.waiters.delete(state.jobId);
    waiter.resolve(state);
  }

  private handleConnectionFailure(
    error: Error
  ): void {
    if (this.socket) {
      this.socket.destroy();
    }

    this.socket = null;
    this.handshakeComplete = false;
    this.judgeId = null;

    this.failAll(error);
  }

  private failAll(error: Error): void {
    for (const state of this.submissions.values()) {
      if (!state.finished) {
        state.status = "failed";
        state.internalError =
          error.message;
        state.finished = true;
      }
    }

    for (const waiter of this.waiters.values()) {
      waiter.reject(error);
    }

    this.waiters.clear();
  }
}


