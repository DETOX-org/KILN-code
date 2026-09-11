export type JudgeStatus =
  | "Accepted"
  | "Compilation Error"
  | "Runtime Error"
  | "Time Limit Exceeded"
  | "Wrong Answer"
  | "Memory Limit Exceeded"
  | "Judge Error";

export function formatResult(
  exitCode: number,
  stdout: string,
  stderr: string,
  expectedOutput?: string
) {
  if (exitCode === 124) {
    return {
      status: "Time Limit Exceeded" as JudgeStatus,
      stdout,
      stderr
    };
  }

  if (exitCode !== 0) {
    return {
      status: "Runtime Error" as JudgeStatus,
      stdout,
      stderr
    };
  }

  if (
    expectedOutput !== undefined &&
    stdout.trim().replace(/\r\n/g, "\n") !==
      expectedOutput.trim().replace(/\r\n/g, "\n")
  ) {
    return {
      status: "Wrong Answer" as JudgeStatus,
      stdout,
      stderr
    };
  }

  return {
    status: "Accepted" as JudgeStatus,
    stdout,
    stderr
  };
}
