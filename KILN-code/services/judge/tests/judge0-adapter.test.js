const test = require("node:test");
const assert = require("node:assert/strict");
const { Judge0Adapter, JudgeResultState } = require("../engines/judge0-adapter.js");

// Mock HTTP client that simulates Judge0 CE REST API responses
function createMockJudge0Client() {
  const store = new Map();
  let tokenCounter = 1;

  const mockClient = {
    post: async (endpoint, body) => {
      if (endpoint.startsWith("/submissions")) {
        const token = `mock-token-${tokenCounter++}`;

        // Verify request was correctly translated
        assert.ok(body.language_id, "language_id must be provided");
        assert.ok(body.source_code, "source_code must be provided in base64");

        const sourceCode = Buffer.from(body.source_code, "base64").toString("utf8");
        const stdin = body.stdin ? Buffer.from(body.stdin, "base64").toString("utf8") : "";

        store.set(token, {
          token,
          language_id: body.language_id,
          source_code: body.source_code,
          cpu_time_limit: body.cpu_time_limit,
          wall_time_limit: body.wall_time_limit,
          memory_limit: body.memory_limit,
          status: { id: 3, description: "Accepted" },
          stdout: Buffer.from(`Output: ${stdin || "hello"}`).toString("base64"),
          stderr: null,
          compile_output: null,
          message: null,
          exit_code: 0,
          exit_signal: null,
          time: "0.012",
          memory: 1024
        });

        return { data: { token }, status: 201 };
      }
      throw new Error(`Unhandled POST endpoint: ${endpoint}`);
    },

    get: async (endpoint) => {
      if (endpoint.startsWith("/submissions/")) {
        const url = endpoint.split("?")[0];
        const token = url.replace("/submissions/", "");
        const record = store.get(token);

        if (!record) {
          throw new Error(`Submission not found: ${token}`);
        }

        return { data: record, status: 200 };
      }

      if (endpoint === "/system_info") {
        return { data: { version: "1.13.1" }, status: 200 };
      }

      throw new Error(`Unhandled GET endpoint: ${endpoint}`);
    }
  };

  return { mockClient, store };
}

const MVP_LANGUAGES = [
  { language: "c", code: "#include <stdio.h>\nint main(){printf(\"hello\");return 0;}", expectedId: 51 },
  { language: "cpp", code: "#include <iostream>\nint main(){std::cout<<\"hello\";return 0;}", expectedId: 52 },
  { language: "java", code: "public class Main{public static void main(String[] args){System.out.print(\"hello\");}}", expectedId: 91 },
  { language: "python", code: "print('hello', end='')", expectedId: 92 },
  { language: "javascript", code: "process.stdout.write('hello');", expectedId: 93 },
  { language: "typescript", code: "process.stdout.write('hello');", expectedId: 94 }
];

for (const { language, code, expectedId } of MVP_LANGUAGES) {
  test(`Adapter submit() and poll() works for ${language} without external services`, async () => {
    const { mockClient, store } = createMockJudge0Client();
    const adapter = new Judge0Adapter("http://mock-judge0:2358", mockClient);

    const job = {
      jobId: `job-${language}-1`,
      language,
      code,
      input: "test-input",
      expectedOutput: "Output: test-input",
      mode: "run",
      limits: {
        cpuTimeLimitMs: 1500,
        wallTimeLimitMs: 3000,
        memoryLimitKb: 131072
      }
    };

    // 1. Call submit(job: ExecutionJob) -> token
    const token = await adapter.submit(job);
    assert.ok(token, "Token must be returned by submit()");
    assert.ok(store.has(token), "Token must exist in Judge0 mock storage");

    const submissionPayload = store.get(token);
    assert.equal(submissionPayload.language_id, expectedId, `Language ID must be ${expectedId} for ${language}`);
    assert.equal(submissionPayload.cpu_time_limit, 1.5, "cpu_time_limit must be converted to seconds (1.5s)");
    assert.equal(submissionPayload.wall_time_limit, 3.0, "wall_time_limit must be converted to seconds (3.0s)");
    assert.equal(submissionPayload.memory_limit, 131072, "memory_limit must match in KB");

    // 2. Call poll(token) -> rawResult
    const rawResult = await adapter.poll(token);
    assert.ok(rawResult, "Raw result must be returned by poll()");
    assert.equal(rawResult.token, token);
    assert.equal(rawResult.status.id, 3);
    assert.equal(rawResult.status.description, "Accepted");
    assert.equal(rawResult.stdout, "Output: test-input", "stdout must be base64 decoded");
    assert.equal(rawResult.exit_code, 0);

    // 3. Call pollStatus(token) -> EngineResult
    const engineResult = await adapter.pollStatus(token);
    assert.equal(engineResult.status, JudgeResultState.ACCEPTED);
    assert.equal(engineResult.stdout, "Output: test-input");
    assert.equal(engineResult.executedBy.engineId, "judge0");
  });
}

test("Adapter submit() rejects unsupported language", async () => {
  const { mockClient } = createMockJudge0Client();
  const adapter = new Judge0Adapter("http://mock-judge0:2358", mockClient);

  await assert.rejects(
    async () => {
      await adapter.submit({
        language: "unsupported_lang_xyz",
        code: "test",
        input: ""
      });
    },
    /Unsupported Judge0 language/
  );
});

test("Adapter healthcheck returns true when system_info is 200", async () => {
  const { mockClient } = createMockJudge0Client();
  const adapter = new Judge0Adapter("http://mock-judge0:2358", mockClient);

  const healthy = await adapter.healthcheck();
  assert.equal(healthy, true);
});
