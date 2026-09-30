import http from "node:http";
import {
  createJudgeEngine,
  checkJudgeEngineHealth
} from "../engines/index.js";
import { PistonEngine } from "../engines/piston-engine.js";
import type {
  JudgeResponse,
  TestVisibility
} from "../../../shared/judge-result.js";
import type { JudgeEngine, EngineResult } from "../engines/engine.js";

const PORT = 3001;

const MAX_REQUEST_SIZE = 1 * 1024 * 1024;
const MAX_CODE_SIZE = 256 * 1024;
const MAX_INPUT_SIZE = 256 * 1024;
const MAX_EXPECTED_OUTPUT_SIZE = 256 * 1024;
const MAX_TEST_CASES = 100;

type Language =
  | "python"
  | "c"
  | "cpp"
  | "java"
  | "javascript"
  | "typescript"
  | "go"
  | "rust"
  | "csharp"
  | "kotlin"
  | "sql";

type TestCase = {
  input: string;
  expectedOutput: string;
  visibility?: TestVisibility;
};

type ExecuteRequest = {
  language: Language;
  code: string;
  tests?: TestCase[];
};

function normalizeOutput(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();
}

function sendJson(
  res: http.ServerResponse,
  statusCode: number,
  body: unknown
): void {
  res.writeHead(statusCode, {
    "Content-Type": "application/json"
  });

  res.end(JSON.stringify(body));
}

function byteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}

// Piston is deliberately not part of engines/index.ts's routing table
// (that file is Judge0 + DMOJ only). It's wired here, same as in
// judge-worker.ts, purely as the failover path for this HTTP entry
// point — so both execution paths (queue worker and this server)
// share identical failover behavior.
const pistonFailover = new PistonEngine();

// Tracks whether Judge0/DMOJ passed their startup health check.
// This replaces the old single-instance `judgeEngine` variable,
// which can no longer exist as one shared instance now that
// createJudgeEngine() requires a per-request language argument.
let primariesHealthy = false;
let pistonHealthy = false;

async function runTestOnEngine(
  engine: JudgeEngine,
  request: { language: string; code: string },
  test: { input: string; expectedOutput: string }
): Promise<EngineResult> {
  const engineJobId = await engine.submit({
    language: request.language,
    code: request.code,
    input: test.input,
    expectedOutput: test.expectedOutput
  });

  return engine.pollStatus(engineJobId);
}

async function runTestWithFailover(
  request: { language: string; code: string },
  test: { input: string; expectedOutput: string }
): Promise<{ result: EngineResult; engineName: string }> {
  const primaryEngine = createJudgeEngine(request.language);

  try {
    const result = await runTestOnEngine(
      primaryEngine,
      request,
      test
    );

    if (result.status !== "Judge Error") {
      return { result, engineName: primaryEngine.name };
    }

    console.error(
      `Primary engine returned Judge Error for language "${request.language}", falling back to Piston`
    );
  } catch (error) {
    console.error(
      `Primary engine threw for language "${request.language}", falling back to Piston:`,
      error instanceof Error ? error.message : String(error)
    );
  }

  const fallbackResult = await runTestOnEngine(
    pistonFailover,
    request,
    test
  );

  return { result: fallbackResult, engineName: pistonFailover.name };
}

const server = http.createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/execute") {
    sendJson(res, 404, {
      error: "Not Found"
    });

    return;
  }

  let body = "";
  let bodySize = 0;
  let requestTooLarge = false;

  req.on("data", (chunk: Buffer) => {
    bodySize += chunk.length;

    if (bodySize > MAX_REQUEST_SIZE) {
      requestTooLarge = true;
      req.destroy();
      return;
    }

    body += chunk.toString();
  });

  req.on("end", async () => {
    if (requestTooLarge) {
      sendJson(res, 413, {
        status: "Judge Error",
        error: "Request payload exceeds the maximum allowed size"
      });

      return;
    }

    let request: ExecuteRequest;

    try {
      request = JSON.parse(body);
    } catch {
      sendJson(res, 400, {
        status: "Judge Error",
        error: "Invalid JSON",
        verificationMode: "NONE"
      });

      return;
    }

    if (
      ![
        "python",
        "c",
        "cpp",
        "java",
        "javascript",
        "typescript",
        "go",
        "rust",
        "csharp",
        "kotlin",
        "sql"
      ].includes(request.language)
    ) {
      sendJson(res, 400, {
        status: "Judge Error",
        error: "Unsupported language"
      });

      return;
    }

    if (typeof request.code !== "string") {
      sendJson(res, 400, {
        status: "Judge Error",
        error: "Code must be a string"
      });

      return;
    }

    if (byteLength(request.code) > MAX_CODE_SIZE) {
      sendJson(res, 413, {
        status: "Judge Error",
        error: "Code exceeds the maximum allowed size"
      });

      return;
    }

    const tests = request.tests ?? [
      {
        input: "",
        expectedOutput: "",
        visibility: "public" as const
      }
    ];

    if (!Array.isArray(tests) || tests.length === 0) {
      sendJson(res, 400, {
        status: "Judge Error",
        error: "At least one test case is required"
      });

      return;
    }

    if (tests.length > MAX_TEST_CASES) {
      sendJson(res, 400, {
        status: "Judge Error",
        error: `Maximum of ${MAX_TEST_CASES} test cases allowed`
      });

      return;
    }

    for (const test of tests) {
      if (
        typeof test.input !== "string" ||
        typeof test.expectedOutput !== "string"
      ) {
        sendJson(res, 400, {
          status: "Judge Error",
          error: "Test input and expected output must be strings"
        });

        return;
      }

      if (byteLength(test.input) > MAX_INPUT_SIZE) {
        sendJson(res, 413, {
          status: "Judge Error",
          error: "Test input exceeds the maximum allowed size"
        });

        return;
      }

      if (
        byteLength(test.expectedOutput) >
        MAX_EXPECTED_OUTPUT_SIZE
      ) {
        sendJson(res, 413, {
          status: "Judge Error",
          error: "Expected output exceeds the maximum allowed size"
        });

        return;
      }

      if (
        test.visibility !== undefined &&
        test.visibility !== "public" &&
        test.visibility !== "hidden"
      ) {
        sendJson(res, 400, {
          status: "Judge Error",
          error: "Invalid test visibility"
        });

        return;
      }
    }

    if (!primariesHealthy && !pistonHealthy) {
      sendJson(res, 503, {
        status: "Judge Error",
        error: "Judge engine is not initialized",
        verificationMode: "NONE"
      });

      return;
    }

    let testIndex = 0;

    const sendJudgeResponse = (response: JudgeResponse) => {
      sendJson(res, 200, response);
    };

    const runTest = async () => {
      const test = tests[testIndex];
      const visibility = test.visibility ?? "public";

      try {
        const { result } = await runTestWithFailover(
          request,
          test
        );

        if (result.status !== "Accepted") {
          sendJudgeResponse({
            status: result.status,
            testCase: testIndex + 1,
            exitCode: result.exitCode,
            stdout: result.stdout,
            stderr: result.stderr,
            visibility,
            executedBy: result.executedBy,
            verificationMode: result.verificationMode
          });

          return;
        }

        if (
          normalizeOutput(result.stdout) !==
          normalizeOutput(test.expectedOutput)
        ) {
          sendJudgeResponse({
            status: "Wrong Answer",
            testCase: testIndex + 1,
            exitCode: result.exitCode,
            stdout: result.stdout,
            stderr: result.stderr,
            visibility,
            executedBy: result.executedBy,
            verificationMode: result.verificationMode
          });

          return;
        }

        testIndex++;

        if (testIndex < tests.length) {
          await runTest();
          return;
        }

        sendJudgeResponse({
          status: "Accepted",
          testCase: tests.length,
          exitCode: result.exitCode,
          stdout: result.stdout,
          stderr: result.stderr,
          visibility,
          executedBy: result.executedBy,
          verificationMode: result.verificationMode
        });
      } catch (error) {
        sendJudgeResponse({
          status: "Judge Error",
          testCase: testIndex + 1,
          exitCode: null,
          stdout: "",
          stderr:
            error instanceof Error
              ? error.message
              : String(error),
          visibility,
          executedBy: {
            engineId: "unknown",
            engineVersion: "unknown",
            runtime: request.language,
            runtimeVersion: "unknown"
          },
          verificationMode: "NONE"
        });
      }
    };

    await runTest();
  });
});

async function startServer(): Promise<void> {
  primariesHealthy = await checkJudgeEngineHealth();
  pistonHealthy = await pistonFailover.healthcheck();

  console.log(
    `Judge engine health — Judge0/DMOJ: ${primariesHealthy ? "healthy" : "unhealthy"}, Piston: ${pistonHealthy ? "healthy" : "unhealthy"}`
  );

  if (!primariesHealthy && !pistonHealthy) {
    throw new Error("No healthy judge engine available");
  }

  server.listen(PORT, () => {
    console.log(`Judge service running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error(
    "Judge service failed to start:",
    error instanceof Error
      ? error.message
      : String(error)
  );

  process.exit(1);
});