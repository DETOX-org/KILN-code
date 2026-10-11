import axios from "axios";

// The judge engines (Judge0/DMOJ/Piston) live in the sibling `services/judge`
// workspace, not inside the backend's own container — the backend talks to
// them over HTTP, the same way it would talk to any other external service.
// In docker-compose this resolves to the `judge` service on the compose
// network; in production it should point at wherever that service is
// deployed (see render.yaml / JUDGE_SERVICE_URL).
const JUDGE_SERVICE_URL =
  process.env.JUDGE_SERVICE_URL || "http://judge:3001";

const REQUEST_TIMEOUT_MS = 60_000;

export interface JudgeClientTestCase {
  input: string;
  expectedOutput: string;
  visibility?: "public" | "hidden";
}

export interface JudgeClientResult {
  testCase: number;
  status: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timeMs?: number;
  memoryKb?: number;
  executedBy?: unknown;
  verificationMode?: string;
  visibility: "public" | "hidden";
}

export interface JudgeBatchResponse {
  results: JudgeClientResult[];
}

/**
 * Runs an entire test suite against the judge service in one request and
 * gets back a result for every test case (the service does not stop at
 * the first failure), so callers can compute partial credit.
 *
 * `engine: "piston"` forces every test onto Piston specifically, bypassing
 * the normal primary-engine-with-failover routing — used for independent
 * dual-run verification, where the point is to use a genuinely different
 * engine than whatever produced the primary verdict.
 */
export async function executeBatch(params: {
  language: string;
  code: string;
  tests: JudgeClientTestCase[];
  engine?: "auto" | "piston";
}): Promise<JudgeBatchResponse> {
  try {
    const { data } = await axios.post<JudgeBatchResponse>(
      `${JUDGE_SERVICE_URL}/execute-batch`,
      {
        language: params.language,
        code: params.code,
        tests: params.tests,
        engine: params.engine ?? "auto"
      },
      { timeout: REQUEST_TIMEOUT_MS }
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const detail =
        error.response?.data &&
        typeof error.response.data === "object" &&
        "error" in error.response.data
          ? (error.response.data as { error: string }).error
          : error.message;

      throw new Error(`Judge service request failed: ${detail}`);
    }

    throw error;
  }
}
