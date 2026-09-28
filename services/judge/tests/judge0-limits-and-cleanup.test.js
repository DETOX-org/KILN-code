const test = require("node:test");
const assert = require("node:assert/strict");
const { Judge0Adapter, JudgeResultState } = require("../engines/judge0-adapter.js");

function createSandboxTestClient() {
  const store = new Map();
  const activeBoxes = new Set();
  let counter = 1;

  const client = {
    post: async (endpoint, body) => {
      const token = `token-${counter++}`;
      const boxId = counter % 1000;
      activeBoxes.add(boxId);

      // Determine response based on simulated code behavior
      const sourceCode = Buffer.from(body.source_code, "base64").toString("utf8");

      let status = { id: 3, description: "Accepted" };
      let stdout = Buffer.from("42\n").toString("base64");
      let stderr = null;
      let exitCode = 0;
      let exitSignal = null;
      let message = null;

      if (sourceCode.includes("INFINITE_LOOP")) {
        // Exceeded wall-time or cpu-time
        status = { id: 5, description: "Time Limit Exceeded" };
        stdout = null;
        message = Buffer.from("Wall time limit exceeded").toString("base64");
      } else if (sourceCode.includes("EXCESSIVE_MEMORY")) {
        // Exceeded memory limit
        status = { id: 11, description: "Runtime Error (NZEC)" };
        stdout = null;
        stderr = Buffer.from("terminate called after throwing an instance of 'std::bad_alloc'\nwhat(): std::bad_alloc").toString("base64");
        exitCode = 137;
        exitSignal = 9;
      } else {
        const printMatch = sourceCode.match(/print\((['"]?)(.*?)\1\)/);
        if (printMatch) {
          stdout = Buffer.from(`${printMatch[2]}\n`).toString("base64");
        }
      }

      store.set(token, {
        token,
        boxId,
        status,
        stdout,
        stderr,
        compile_output: null,
        message,
        exit_code: exitCode,
        exit_signal: exitSignal,
        time: "0.050",
        memory: body.memory_limit
      });

      return { data: { token }, status: 201 };
    },

    get: async (endpoint) => {
      const url = endpoint.split("?")[0];
      const token = url.replace("/submissions/", "");
      const record = store.get(token);

      if (!record) {
        throw new Error(`Record not found: ${token}`);
      }

      // Simulate isolate sandbox cleanup after execution
      activeBoxes.delete(record.boxId);

      return { data: record, status: 200 };
    }
  };

  return { client, store, activeBoxes };
}

test("Deliberate infinite loop returns TIME_LIMIT_EXCEEDED", async () => {
  const { client } = createSandboxTestClient();
  const adapter = new Judge0Adapter("http://mock-judge0:2358", client);

  const job = {
    jobId: "job-infinite-loop",
    language: "python",
    code: "while True: pass # INFINITE_LOOP",
    input: "",
    limits: {
      cpuTimeLimitMs: 1000,
      wallTimeLimitMs: 2000,
      memoryLimitKb: 65536
    }
  };

  const token = await adapter.submit(job);
  const result = await adapter.pollStatus(token);

  assert.equal(result.status, JudgeResultState.TIME_LIMIT_EXCEEDED);
});

test("Deliberate memory bomb returns MEMORY_LIMIT_EXCEEDED", async () => {
  const { client } = createSandboxTestClient();
  const adapter = new Judge0Adapter("http://mock-judge0:2358", client);

  const job = {
    jobId: "job-oom",
    language: "cpp",
    code: "#include <vector>\nint main(){ std::vector<int> v(1000000000); } // EXCESSIVE_MEMORY",
    input: "",
    limits: {
      cpuTimeLimitMs: 2000,
      wallTimeLimitMs: 4000,
      memoryLimitKb: 32768
    }
  };

  const token = await adapter.submit(job);
  const result = await adapter.pollStatus(token);

  assert.equal(result.status, JudgeResultState.MEMORY_LIMIT_EXCEEDED);
});

test("Deliberate normal run returns ACCEPTED", async () => {
  const { client } = createSandboxTestClient();
  const adapter = new Judge0Adapter("http://mock-judge0:2358", client);

  const job = {
    jobId: "job-normal",
    language: "python",
    code: "print('42')",
    input: "",
    expectedOutput: "42"
  };

  const token = await adapter.submit(job);
  const result = await adapter.pollStatus(token);

  assert.equal(result.status, JudgeResultState.ACCEPTED);
});

test("Sandbox cleanup: batch of 100 submissions leaves zero orphaned sandbox boxes or memory leaks", async () => {
  const { client, activeBoxes } = createSandboxTestClient();
  const adapter = new Judge0Adapter("http://mock-judge0:2358", client);

  const BATCH_SIZE = 100;
  for (let i = 0; i < BATCH_SIZE; i++) {
    const job = {
      jobId: `batch-job-${i}`,
      language: "python",
      code: `print('${i}')`,
      input: "",
      expectedOutput: `${i}`
    };

    const token = await adapter.submit(job);
    const result = await adapter.pollStatus(token);
    assert.equal(result.status, JudgeResultState.ACCEPTED);
  }

  // Confirm zero active/orphaned isolate boxes remain
  assert.equal(activeBoxes.size, 0, "All isolate sandbox boxes must be torn down after execution");
  assert.equal(adapter.jobs.size, 0, "Internal adapter job tracker must be completely clean with zero leaks");
});
