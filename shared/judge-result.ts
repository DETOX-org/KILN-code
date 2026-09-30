export enum JudgeResultState {
  ACCEPTED = "Accepted",
  WRONG_ANSWER = "Wrong Answer",
  COMPILATION_ERROR = "Compilation Error",
  RUNTIME_ERROR = "Runtime Error",
  TIME_LIMIT_EXCEEDED = "Time Limit Exceeded",
  MEMORY_LIMIT_EXCEEDED = "Memory Limit Exceeded",
  JUDGE_ERROR = "Judge Error"
}

export type JudgeStatus =
  | "Accepted"
  | "Wrong Answer"
  | "Compilation Error"
  | "Runtime Error"
  | "Time Limit Exceeded"
  | "Memory Limit Exceeded"
  | "Judge Error";

export type TestVisibility =
  | "public"
  | "hidden";

export type ExecutionMode =
  | "run"
  | "submit";

export type VerificationMode =
  | "NONE"
  | "DUAL_RUN";

export interface ExecutionMetadata {
  engineId: string;
  engineVersion: string;
  runtime: string;
  runtimeVersion: string;
  workerId?: string;
  sandboxConfigVersion?: string;
}

export interface JobLimits {
  cpuTimeLimitMs?: number;
  wallTimeLimitMs?: number;
  memoryLimitKb?: number;
}

export interface ExecutionJob {
  jobId?: string;
  language: string;
  code: string;
  input: string;
  expectedOutput?: string;
  mode?: ExecutionMode;
  visibility?: TestVisibility;
  limits?: JobLimits;
}

export interface JudgeResult {
  status: JudgeStatus | JudgeResultState;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  internalErrorDetail?: string;
  timeMs?: number;
  memoryKb?: number;
  executedBy: ExecutionMetadata;
  verificationMode: VerificationMode;
}

export interface ExecutionResult extends JudgeResult {
  token?: string;
}

export interface JudgeResponse extends JudgeResult {
  testCase: number;
  visibility: TestVisibility;
}