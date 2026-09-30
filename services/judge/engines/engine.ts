import type {
  ExecutionMetadata,
  VerificationMode,
  JudgeResultState,
  JudgeStatus,
  ExecutionJob
} from "../../../shared/judge-result.js";

export type {
  ExecutionJob,
  JobLimits,
  ExecutionMode,
  JudgeResultState,
  JudgeStatus
} from "../../../shared/judge-result.js";

export interface EngineRequest {
  language: string;
  code: string;
  input: string;
  expectedOutput?: string;
  mode?: "run" | "submit";
  visibility?: "public" | "hidden";
  limits?: {
    cpuTimeLimitMs?: number;
    wallTimeLimitMs?: number;
    memoryLimitKb?: number;
  };
}

export interface EngineResult {
  status:
    | "Accepted"
    | "Wrong Answer"
    | "Compilation Error"
    | "Runtime Error"
    | "Time Limit Exceeded"
    | "Memory Limit Exceeded"
    | "Judge Error"
    | JudgeResultState;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  internalErrorDetail?: string;
  timeMs?: number;
  memoryKb?: number;
  executedBy: ExecutionMetadata;
  verificationMode: VerificationMode;
}

export interface JudgeEngine {
  name: string;
  submit(request: EngineRequest | ExecutionJob): Promise<string>;
  pollStatus(jobId: string): Promise<EngineResult>;
  cancel(jobId: string): Promise<void>;
  healthcheck(): Promise<boolean>;
}