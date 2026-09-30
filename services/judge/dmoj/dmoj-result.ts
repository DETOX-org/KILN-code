import type {
  ExecutionMetadata,
  VerificationMode
} from "../../../shared/judge-result.js";

import type {
  DmojCaseResult,
  DmojSubmissionState
} from "./dmoj-types.js";

export interface DmojSubtaskResult {
  subtask: number;
  points: number;
  totalPoints: number;
  status: "Accepted" | "Wrong Answer";
}

export interface DmojMappedSubmissionState
  extends DmojSubmissionState {
  checkerMessage?: string;
  subtaskResults?: DmojSubtaskResult[];
}

export interface DmojEngineResult {
  status:
    | "Accepted"
    | "Wrong Answer"
    | "Compilation Error"
    | "Runtime Error"
    | "Time Limit Exceeded"
    | "Memory Limit Exceeded"
    | "Judge Error";
  exitCode: null;
  stdout: string;
  stderr: string;
  executedBy: ExecutionMetadata;
  verificationMode: VerificationMode;
  subtaskResults?: DmojSubtaskResult[];
  checkerMessage?: string;
}

const DMOJ_WA = 1 << 0;
const DMOJ_RTE = 1 << 1;
const DMOJ_TLE = 1 << 2;
const DMOJ_MLE = 1 << 3;
const DMOJ_IR = 1 << 4;
const DMOJ_OLE = 1 << 6;
const DMOJ_IE = 1 << 30;

function hasFlag(status: number, flag: number): boolean {
  return (status & flag) !== 0;
}

function mapCaseStatus(status: number): DmojEngineResult["status"] {
  if (hasFlag(status, DMOJ_IE) || hasFlag(status, DMOJ_IR)) {
    return "Judge Error";
  }

  if (hasFlag(status, DMOJ_TLE)) {
    return "Time Limit Exceeded";
  }

  if (hasFlag(status, DMOJ_MLE)) {
    return "Memory Limit Exceeded";
  }

  if (hasFlag(status, DMOJ_RTE) || hasFlag(status, DMOJ_OLE)) {
    return "Runtime Error";
  }

  if (hasFlag(status, DMOJ_WA)) {
    return "Wrong Answer";
  }

  return "Accepted";
}

function mapOverallStatus(
  state: DmojMappedSubmissionState
): DmojEngineResult["status"] {
  if (state.compileError) {
    return "Compilation Error";
  }

  if (state.internalError) {
    return "Judge Error";
  }

  if (state.status === "terminated") {
    return "Judge Error";
  }

  let worst: DmojEngineResult["status"] = "Accepted";

  const priority: Record<DmojEngineResult["status"], number> = {
    Accepted: 0,
    "Wrong Answer": 1,
    "Runtime Error": 2,
    "Memory Limit Exceeded": 3,
    "Time Limit Exceeded": 4,
    "Compilation Error": 5,
    "Judge Error": 6
  };

  for (const result of state.cases) {
    const mapped = mapCaseStatus(result.status);

    if (priority[mapped] > priority[worst]) {
      worst = mapped;
    }
  }

  return worst;
}

function selectOutput(cases: DmojCaseResult[]): string {
  const interesting = [...cases]
    .reverse()
    .find((item) => item.output.length > 0);

  return interesting?.output ?? "";
}

function selectRuntimeVersion(cases: DmojCaseResult[]): string {
  return (
    [...cases]
      .reverse()
      .find((item) => item["runtime-version"].length > 0)?.[
      "runtime-version"
    ] ?? ""
  );
}

export function mapDmojSubmissionResult(
  state: DmojMappedSubmissionState
): DmojEngineResult {
  const runtimeVersion = selectRuntimeVersion(state.cases);

  const executedBy: ExecutionMetadata = {
    engineId: "dmoj",
    engineVersion:
      process.env.DMOJ_ENGINE_VERSION ??
      "5ef74c5d6cad9efb2e86a5bb8ff2c90aaa6e435c",
    runtime: "dmoj",
    runtimeVersion,
    workerId: process.env.DMOJ_JUDGE_NAME,
    sandboxConfigVersion:
      process.env.DMOJ_SANDBOX_CONFIG_VERSION
  };

  const checkerMessage =
    state.checkerMessage ??
    [...state.cases]
      .reverse()
      .map(
        (item) =>
          item["extended-feedback"] || item.feedback
      )
      .find(Boolean);

  return {
    status: mapOverallStatus(state),
    exitCode: null,
    stdout: selectOutput(state.cases),
    stderr:
      state.compileError ||
      state.internalError ||
      checkerMessage ||
      "",
    executedBy,
    verificationMode: "NONE",
    subtaskResults: state.subtaskResults,
    checkerMessage
  };
}
