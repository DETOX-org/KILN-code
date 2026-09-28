const test = require("node:test");
const assert = require("node:assert/strict");
const { Judge0Adapter, JudgeResultState } = require("../engines/judge0-adapter.js");

function createMockClientWithCustomResults(submissionsMap) {
  let counter = 1;
  const store = new Map();

  return {
    post: async (endpoint, body) => {
      const token = `token-${counter++}`;
      store.set(token, body);
      return { data: { token }, status: 201 };
    },
    get: async (endpoint) => {
      const url = endpoint.split("?")[0];
      const token = url.replace("/submissions/", "");
      const submittedBody = store.get(token);

      const customResponse = submissionsMap(submittedBody);
      return { data: { token, ...customResponse }, status: 200 };
    }
  };
}

test("Run-mode returns full stdout and stderr for public test cases", async () => {
  const mockClient = createMockClientWithCustomResults((body) => ({
    status: { id: 3, description: "Accepted" },
    stdout: Buffer.from("Public Output: 42\nDetailed logs").toString("base64"),
    stderr: Buffer.from("Debug log: public test completed").toString("base64"),
    compile_output: null,
    message: null,
    exit_code: 0,
    time: "0.010",
    memory: 2048
  }));

  const adapter = new Judge0Adapter("http://mock-judge0:2358", mockClient);

  const job = {
    jobId: "job-run-public-1",
    language: "python",
    code: "print('Public Output: 42')",
    input: "42",
    expectedOutput: "Public Output: 42\nDetailed logs",
    mode: "run",
    visibility: "public"
  };

  const token = await adapter.submit(job);
  const result = await adapter.pollStatus(token);

  assert.equal(result.status, JudgeResultState.ACCEPTED);
  assert.equal(result.stdout, "Public Output: 42\nDetailed logs", "Run mode must return full stdout");
  assert.equal(result.stderr, "Debug log: public test completed", "Run mode must return full stderr");
});

test("Submit-mode strictly strips stdout and stderr for passing hidden tests", async () => {
  const mockClient = createMockClientWithCustomResults((body) => ({
    status: { id: 3, description: "Accepted" },
    stdout: Buffer.from("TOP_SECRET_HIDDEN_ANSWER_12345").toString("base64"),
    stderr: Buffer.from("INTERNAL_HIDDEN_TRACE_INFO").toString("base64"),
    compile_output: null,
    message: null,
    exit_code: 0,
    time: "0.015",
    memory: 4096
  }));

  const adapter = new Judge0Adapter("http://mock-judge0:2358", mockClient);

  const job = {
    jobId: "job-submit-hidden-passing",
    language: "python",
    code: "print('TOP_SECRET_HIDDEN_ANSWER_12345')",
    input: "hidden_secret_input_XYZ",
    expectedOutput: "TOP_SECRET_HIDDEN_ANSWER_12345",
    mode: "submit",
    visibility: "hidden"
  };

  const token = await adapter.submit(job);
  const result = await adapter.pollStatus(token);

  assert.equal(result.status, JudgeResultState.ACCEPTED);
  // Privacy assertion: Passing hidden tests MUST have stdout and stderr stripped
  assert.equal(result.stdout, "", "stdout of passing hidden test MUST be stripped at adapter boundary");
  assert.equal(result.stderr, "", "stderr of passing hidden test MUST be stripped at adapter boundary");
});

test("Submit-mode on failing hidden test strips stdout and returns only sanitized diagnostic error", async () => {
  const mockClient = createMockClientWithCustomResults((body) => ({
    status: { id: 4, description: "Wrong Answer" },
    stdout: Buffer.from("SENSITIVE_WRONG_CALCULATION_DATA").toString("base64"),
    stderr: Buffer.from("Sensitive stack trace pointing to hidden directory /hidden/cases").toString("base64"),
    compile_output: null,
    message: null,
    exit_code: 0,
    time: "0.018",
    memory: 3000
  }));

  const adapter = new Judge0Adapter("http://mock-judge0:2358", mockClient);

  const job = {
    jobId: "job-submit-hidden-failing",
    language: "python",
    code: "print('bad calculation')",
    input: "hidden_secret_input_XYZ",
    expectedOutput: "SECRET_EXPECTED_RESULT",
    mode: "submit",
    visibility: "hidden"
  };

  const token = await adapter.submit(job);
  const result = await adapter.pollStatus(token);

  assert.equal(result.status, JudgeResultState.WRONG_ANSWER);
  // stdout must NEVER be returned for hidden tests, even when failing
  assert.equal(result.stdout, "", "stdout of failing hidden test MUST be stripped");
  // stderr must be sanitized diagnostic, never leaking private output or traces
  assert.ok(!result.stderr.includes("SENSITIVE_WRONG_CALCULATION_DATA"), "Private output must not leak in stderr");
  assert.ok(!result.stderr.includes("/hidden/cases"), "Private path trace must not leak in stderr");
  assert.match(result.stderr, /Execution failed/, "Sanitized diagnostic must be provided");
});

test("Submit-mode on hidden test with runtime crash strips stdout and sanitizes error", async () => {
  const mockClient = createMockClientWithCustomResults((body) => ({
    status: { id: 7, description: "Runtime Error (SIGSEGV)" },
    stdout: Buffer.from("partially printed hidden data").toString("base64"),
    stderr: Buffer.from("Segmentation fault at address 0xdeadbeef while reading /var/hidden_tests/secret.in").toString("base64"),
    compile_output: null,
    message: null,
    exit_code: 139,
    exit_signal: 11,
    time: "0.005",
    memory: 1024
  }));

  const adapter = new Judge0Adapter("http://mock-judge0:2358", mockClient);

  const job = {
    jobId: "job-submit-hidden-crash",
    language: "cpp",
    code: "int main(){ *(int*)0 = 0; }",
    input: "secret",
    mode: "submit",
    visibility: "hidden"
  };

  const token = await adapter.submit(job);
  const result = await adapter.pollStatus(token);

  assert.equal(result.status, JudgeResultState.RUNTIME_ERROR);
  assert.equal(result.stdout, "", "Crash on hidden test must not leak partially printed stdout");
  assert.ok(!result.stderr.includes("/var/hidden_tests/secret.in"), "Private test path must not leak in stderr");
  assert.equal(result.stderr, "Execution failed: Runtime Error (SIGSEGV)");
});
