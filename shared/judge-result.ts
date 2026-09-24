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

export interface JudgeResult {
  status: JudgeStatus;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  executedBy: ExecutionMetadata;
  verificationMode: VerificationMode;
}

export interface JudgeResponse extends JudgeResult {
  testCase: number;
  visibility: TestVisibility;
}