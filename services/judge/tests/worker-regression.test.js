const test = require("node:test");
const assert = require("node:assert/strict");
const Redis = require("ioredis");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const redis = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379"
);

const REPO_ROOT = path.resolve(__dirname, "../..");

const QUEUE_KEY = "judge:queue";
const PROCESSING_QUEUE_KEY = "judge:processing";

const MAX_CODE_SIZE = 256 * 1024;
const MAX_INPUT_SIZE = 256 * 1024;
const MAX_EXPECTED_OUTPUT_SIZE = 256 * 1024;
const MAX_TEST_CASES = 100;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPiston(timeout = 30000) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(
        "http://localhost:2001/api/v2/runtimes"
      );

      if (response.ok) {
        return;
      }
    } catch {}

    await sleep(500);
  }

  throw new Error("Piston did not become ready");
}

async function waitForResult(jobId, timeout = 30000) {
  const resultKey = `judge:result:${jobId}`;
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const result = await redis.get(resultKey);

    if (result) {
      return JSON.parse(result);
    }

    await sleep(100);
  }

  throw new Error(`Timed out waiting for result: ${jobId}`);
}

async function cleanupResult(jobId) {
  await redis.del(`judge:result:${jobId}`);
}

async function enqueueJob(job) {
  await redis.rpush(
    QUEUE_KEY,
    JSON.stringify(job)
  );
}

async function waitForProcessingQueueToClear(
  timeout = 10000
) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const length = await redis.llen(
      PROCESSING_QUEUE_KEY
    );

    if (length === 0) {
      return;
    }

    await sleep(100);
  }

  throw new Error(
    "Processing queue did not clear within timeout"
  );
}

test("Worker rejects oversized code injected directly into Redis", async () => {
  const jobId = `worker-validation-${Date.now()}`;

  await enqueueJob({
    jobId,
    language: "python",
    code: "x".repeat(MAX_CODE_SIZE + 1),
    tests: [
      {
        input: "",
        expectedOutput: "",
        visibility: "public"
      }
    ],
    attempt: 0
  });

  const result = await waitForResult(jobId);

  assert.equal(result.status, "Judge Error");
  assert.match(
    result.results[0].stderr,
    /Code exceeds the maximum allowed size/
  );

  await cleanupResult(jobId);
});

test("Worker rejects oversized input injected directly into Redis", async () => {
  const jobId = `worker-input-validation-${Date.now()}`;

  await enqueueJob({
    jobId,
    language: "python",
    code: "print(1)",
    tests: [
      {
        input: "x".repeat(MAX_INPUT_SIZE + 1),
        expectedOutput: "1",
        visibility: "public"
      }
    ],
    attempt: 0
  });

  const result = await waitForResult(jobId);

  assert.equal(result.status, "Judge Error");
  assert.match(
    result.results[0].stderr,
    /Test input exceeds the maximum allowed size/
  );

  await cleanupResult(jobId);
});

test("Worker rejects oversized expected output injected directly into Redis", async () => {
  const jobId = `worker-output-validation-${Date.now()}`;

  await enqueueJob({
    jobId,
    language: "python",
    code: "print(1)",
    tests: [
      {
        input: "",
        expectedOutput: "x".repeat(
          MAX_EXPECTED_OUTPUT_SIZE + 1
        ),
        visibility: "public"
      }
    ],
    attempt: 0
  });

  const result = await waitForResult(jobId);

  assert.equal(result.status, "Judge Error");
  assert.match(
    result.results[0].stderr,
    /Expected output exceeds the maximum allowed size/
  );

  await cleanupResult(jobId);
});

test("Worker rejects more than 100 test cases injected directly into Redis", async () => {
  const jobId = `worker-test-count-${Date.now()}`;

  const tests = Array.from(
    { length: MAX_TEST_CASES + 1 },
    () => ({
      input: "",
      expectedOutput: "1",
      visibility: "public"
    })
  );

  await enqueueJob({
    jobId,
    language: "python",
    code: "print(1)",
    tests,
    attempt: 0
  });

  const result = await waitForResult(jobId);

  assert.equal(result.status, "Judge Error");
  assert.match(
    result.results[0].stderr,
    /Maximum of 100 test cases allowed/
  );

  await cleanupResult(jobId);
});

test("Worker rejects invalid visibility injected directly into Redis", async () => {
  const jobId = `worker-visibility-${Date.now()}`;

  await enqueueJob({
    jobId,
    language: "python",
    code: "print(1)",
    tests: [
      {
        input: "",
        expectedOutput: "1",
        visibility: "invalid"
      }
    ],
    attempt: 0
  });

  const result = await waitForResult(jobId);

  assert.equal(result.status, "Judge Error");
  assert.match(
    result.results[0].stderr,
    /Invalid test visibility/
  );

  await cleanupResult(jobId);
});

test("Worker retries Judge Error up to 3 attempts", async () => {
  const jobId = `worker-retry-${Date.now()}`;

  execFileSync(
    "docker",
    ["compose", "stop", "piston"],
    {
      cwd: REPO_ROOT,
      stdio: "inherit"
    }
  );

  try {
    await enqueueJob({
      jobId,
      language: "python",
      code: "print(1)",
      tests: [
        {
          input: "",
          expectedOutput: "1",
          visibility: "public"
        }
      ],
      attempt: 0
    });

    const result = await waitForResult(jobId, 30000);

    assert.equal(result.status, "Judge Error");
    assert.equal(result.attempt, 3);
  } finally {
    execFileSync(
      "docker",
      ["compose", "start", "piston"],
      {
        cwd: REPO_ROOT,
        stdio: "inherit"
      }
    );

    await waitForPiston();
  }

  await cleanupResult(jobId);
});

test("Worker does not retry Wrong Answer", async () => {
  const jobId = `worker-no-retry-${Date.now()}`;

  await enqueueJob({
    jobId,
    language: "python",
    code: "print(4)",
    tests: [
      {
        input: "",
        expectedOutput: "5",
        visibility: "public"
      }
    ],
    attempt: 0
  });

  const result = await waitForResult(jobId);

  assert.equal(result.status, "Wrong Answer");
  assert.equal(result.attempt, 1);

  await waitForProcessingQueueToClear();

  await cleanupResult(jobId);
});

test("Worker recovers processing job after restart and clears processing queue", async () => {
  const jobId = `worker-recovery-${Date.now()}`;

  const job = {
    jobId,
    language: "python",
    code: "print(7)",
    tests: [
      {
        input: "",
        expectedOutput: "7",
        visibility: "public"
      }
    ],
    attempt: 0
  };

  await redis.rpush(
    PROCESSING_QUEUE_KEY,
    JSON.stringify(job)
  );

  execFileSync(
    "docker",
    ["compose", "restart", "judge"],
    {
      cwd: REPO_ROOT,
      stdio: "inherit"
    }
  );

  const result = await waitForResult(jobId, 30000);

  assert.equal(result.status, "Accepted");

  await waitForProcessingQueueToClear();

  const processingLength = await redis.llen(
    PROCESSING_QUEUE_KEY
  );

  assert.equal(processingLength, 0);

  await cleanupResult(jobId);
});

test.after(async () => {
  await redis.quit();
});