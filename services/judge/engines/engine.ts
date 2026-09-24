import type {
  ExecutionMetadata,
  VerificationMode
} from "../../../shared/judge-result.js";

export interface EngineRequest {
  language: string;
  code: string;
  input: string;
}

export interface EngineResult {
  status:
    | "Accepted"
    | "Wrong Answer"
    | "Compilation Error"
    | "Runtime Error"
    | "Time Limit Exceeded"
    | "Memory Limit Exceeded"
    | "Judge Error";
  exitCode: number | null;
  stdout: string;
  stderr: string;
  executedBy: ExecutionMetadata;
  verificationMode: VerificationMode;
}

export interface JudgeEngine {
  name: string;

  submit(request: EngineRequest): Promise<string>;

  pollStatus(jobId: string): Promise<EngineResult>;

  cancel(jobId: string): Promise<void>;

  healthcheck(): Promise<boolean>;
}