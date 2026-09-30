export type DmojPacket = Record<string, unknown>;

export interface DmojHandshakePacket {
  name: "handshake";
  problems: [string, number][];
  executors: Record<string, unknown>;
  id: string;
  key: string;
}

export interface DmojSubmissionRequestPacket {
  name: "submission-request";
  "submission-id": number;
  "problem-id": string;
  language: string;
  source: string;
  "time-limit": number;
  "memory-limit": number;
  "short-circuit": boolean;
  meta: Record<string, unknown>;
}

export interface DmojCaseResult {
  position: number;
  status: number;
  time: number;
  points: number;
  "total-points": number;
  memory: number;
  output: string;
  "extended-feedback": string;
  feedback: string;
  "voluntary-context-switches": number;
  "involuntary-context-switches": number;
  "runtime-version": string;
}

export interface DmojTestCaseStatusPacket {
  name: "test-case-status";
  "submission-id": number;
  cases: DmojCaseResult[];
}

export interface DmojGradingBeginPacket {
  name: "grading-begin";
  "submission-id": number;
  pretested: boolean | null;
}

export interface DmojGradingEndPacket {
  name: "grading-end";
  "submission-id": number;
}

export interface DmojCompileErrorPacket {
  name: "compile-error";
  "submission-id": number;
  log: string;
}

export interface DmojCompileMessagePacket {
  name: "compile-message";
  "submission-id": number;
  log: string;
}

export interface DmojInternalErrorPacket {
  name: "internal-error";
  "submission-id": number;
  message: string;
}

export interface DmojSubmissionAcknowledgedPacket {
  name: "submission-acknowledged";
  "submission-id": number;
}

export interface DmojBatchBeginPacket {
  name: "batch-begin";
  "submission-id": number;
}

export interface DmojBatchEndPacket {
  name: "batch-end";
  "submission-id": number;
}

export interface DmojSubmissionTerminatedPacket {
  name: "submission-terminated";
  "submission-id": number;
}

export interface DmojProblemDefinition {
  problemId: string;
  timeLimit: number;
  memoryLimit: number;
  shortCircuit: boolean;
  initYml: string;
  files: Record<string, string | Buffer>;
}

export interface DmojSubmissionState {
  jobId: string;
  submissionId: number;
  problemId: string;
  status:
    | "pending"
    | "compiling"
    | "running"
    | "completed"
    | "failed"
    | "terminated";
  compileMessage: string;
  compileError: string;
  internalError: string;
  cases: DmojCaseResult[];
  finished: boolean;
}
