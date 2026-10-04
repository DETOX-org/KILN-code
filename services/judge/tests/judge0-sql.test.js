const test = require("node:test");
const assert = require("node:assert/strict");
const { Judge0Adapter, JudgeResultState } = require("../engines/judge0-adapter.js");

function createMockJudge0SqlClient() {
  const store = new Map();
  let counter = 1;

  return {
    lastSubmittedBody: null,
    post: async (endpoint, body) => {
      const token = `sql-token-${counter++}`;
      assert.equal(body.language_id, 82, "Judge0 Language ID for SQL must be 82");
      const decodedSource = Buffer.from(body.source_code, "base64").toString("utf8");

      store.set(token, {
        token,
        language_id: body.language_id,
        status: { id: 3, description: "Accepted" },
        stdout: Buffer.from("1|Alice|Developer\n2|Bob|Architect\n").toString("base64"),
        stderr: null,
        compile_output: null,
        message: null,
        exit_code: 0,
        time: "0.01",
        memory: 1200
      });

      return { data: { token }, status: 201 };
    },
    get: async (endpoint) => {
      const token = endpoint.split("?")[0].replace("/submissions/", "");
      return { data: store.get(token), status: 200 };
    }
  };
}

test("SQL Engine Support: Judge0 adapter supports SQL directly as its execution engine", () => {
  const adapter = new Judge0Adapter();
  assert.equal(adapter.name, "judge0");
  const config = adapter.getRuntimeConfig("sql");
  assert.ok(config, "SQL runtime config must exist in Judge0 adapter");
  assert.equal(config.language, "sql");
});

test("SQL Manifest & Language ID: maps to Judge0 Language ID 82 (SQLite 3.27.2)", () => {
  const adapter = new Judge0Adapter();
  const config = adapter.getRuntimeConfig("sql");
  assert.ok(config, "SQL config must exist in Judge0 manifest");
  assert.equal(config.judge0LanguageId, 82);
  assert.equal(config.name, "SQL (SQLite 3.27.2)");
});

test("SQL Submission: Judge0Adapter creates job with language_id 82 and executes successfully", async () => {
  const mockClient = createMockJudge0SqlClient();
  const adapter = new Judge0Adapter(undefined, mockClient);

  const sqlQuery = `
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, role TEXT);
INSERT INTO users VALUES (1, 'Alice', 'Developer');
INSERT INTO users VALUES (2, 'Bob', 'Architect');
SELECT * FROM users;
`;

  const jobId = await adapter.submit({
    language: "sql",
    code: sqlQuery,
    mode: "run",
    visibility: "public"
  });

  const result = await adapter.pollStatus(jobId);

  assert.equal(result.status, JudgeResultState.ACCEPTED);
  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout, "1|Alice|Developer\n2|Bob|Architect\n");
  assert.equal(result.executedBy.engineId, "judge0");
  assert.equal(result.executedBy.runtimeVersion, "3.27.2");
});

test("SQL Output Handling: evaluates expectedOutput correctly against SQLite results", async () => {
  const mockClient = createMockJudge0SqlClient();
  const adapter = new Judge0Adapter(undefined, mockClient);

  // Matching expected output -> ACCEPTED
  const jobIdMatching = await adapter.submit({
    language: "sql",
    code: "SELECT * FROM users;",
    expectedOutput: "1|Alice|Developer\n2|Bob|Architect",
    mode: "submit",
    visibility: "public"
  });

  const matchingResult = await adapter.pollStatus(jobIdMatching);
  assert.equal(matchingResult.status, JudgeResultState.ACCEPTED);

  // Mismatched expected output -> WRONG_ANSWER
  const jobIdMismatched = await adapter.submit({
    language: "sql",
    code: "SELECT * FROM users;",
    expectedOutput: "Different Expected Output",
    mode: "submit",
    visibility: "public"
  });

  const mismatchedResult = await adapter.pollStatus(jobIdMismatched);
  assert.equal(mismatchedResult.status, JudgeResultState.WRONG_ANSWER);
});
