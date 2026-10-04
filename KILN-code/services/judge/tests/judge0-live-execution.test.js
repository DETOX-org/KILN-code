const test = require("node:test");
const assert = require("node:assert/strict");
const { Judge0Adapter, JudgeResultState } = require("../engines/judge0-adapter.js");

async function isJudge0Available() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch("http://localhost:2358/about", {
      signal: controller.signal
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

// 1. C
test("Judge0 Real Live Execution: C (GCC 10.2.0)", async (t) => {
  const available = await isJudge0Available();
  if (!available) {
    t.skip("Judge0 CE service is not running on http://localhost:2358. Live verification BLOCKED (Docker not running on host).");
    return;
  }

  const adapter = new Judge0Adapter("http://localhost:2358");
  const cCode = `#include <stdio.h>\nint main() { printf("Hello from Judge0 C\\n"); return 0; }`;

  const token = await adapter.submit({
    language: "c",
    code: cCode,
    mode: "run",
    visibility: "public"
  });

  const result = await adapter.pollStatus(token);
  assert.equal(result.status, JudgeResultState.ACCEPTED);
  assert.equal(result.stdout.trim(), "Hello from Judge0 C");
  assert.equal(result.executedBy.engineId, "judge0");
  assert.equal(result.executedBy.runtimeVersion, "10.2.0");
});

// 2. C++
test("Judge0 Real Live Execution: C++ (GCC 10.2.0)", async (t) => {
  const available = await isJudge0Available();
  if (!available) {
    t.skip("Judge0 CE service is not running on http://localhost:2358. Live verification BLOCKED (Docker not running on host).");
    return;
  }

  const adapter = new Judge0Adapter("http://localhost:2358");
  const cppCode = `#include <iostream>\nint main() { std::cout << "Hello from Judge0 C++" << std::endl; return 0; }`;

  const token = await adapter.submit({
    language: "cpp",
    code: cppCode,
    mode: "run",
    visibility: "public"
  });

  const result = await adapter.pollStatus(token);
  assert.equal(result.status, JudgeResultState.ACCEPTED);
  assert.equal(result.stdout.trim(), "Hello from Judge0 C++");
  assert.equal(result.executedBy.engineId, "judge0");
  assert.equal(result.executedBy.runtimeVersion, "10.2.0");
});

// 3. Java
test("Judge0 Real Live Execution: Java (OpenJDK 15.0.2)", async (t) => {
  const available = await isJudge0Available();
  if (!available) {
    t.skip("Judge0 CE service is not running on http://localhost:2358. Live verification BLOCKED (Docker not running on host).");
    return;
  }

  const adapter = new Judge0Adapter("http://localhost:2358");
  const javaCode = `public class Main { public static void main(String[] args) { System.out.println("Hello from Judge0 Java"); } }`;

  const token = await adapter.submit({
    language: "java",
    code: javaCode,
    mode: "run",
    visibility: "public"
  });

  const result = await adapter.pollStatus(token);
  assert.equal(result.status, JudgeResultState.ACCEPTED);
  assert.equal(result.stdout.trim(), "Hello from Judge0 Java");
  assert.equal(result.executedBy.engineId, "judge0");
  assert.equal(result.executedBy.runtimeVersion, "15.0.2");
});

// 4. Python
test("Judge0 Real Live Execution: Python (3.10.0)", async (t) => {
  const available = await isJudge0Available();
  if (!available) {
    t.skip("Judge0 CE service is not running on http://localhost:2358. Live verification BLOCKED (Docker not running on host).");
    return;
  }

  const adapter = new Judge0Adapter("http://localhost:2358");
  const pyCode = `print("Hello from Judge0 Python")`;

  const token = await adapter.submit({
    language: "python",
    code: pyCode,
    mode: "run",
    visibility: "public"
  });

  const result = await adapter.pollStatus(token);
  assert.equal(result.status, JudgeResultState.ACCEPTED);
  assert.equal(result.stdout.trim(), "Hello from Judge0 Python");
  assert.equal(result.executedBy.engineId, "judge0");
  assert.equal(result.executedBy.runtimeVersion, "3.10.0");
});

// 5. JavaScript
test("Judge0 Real Live Execution: JavaScript (Node.js 18.15.0)", async (t) => {
  const available = await isJudge0Available();
  if (!available) {
    t.skip("Judge0 CE service is not running on http://localhost:2358. Live verification BLOCKED (Docker not running on host).");
    return;
  }

  const adapter = new Judge0Adapter("http://localhost:2358");
  const jsCode = `console.log(6 * 7);`;

  const token = await adapter.submit({
    language: "javascript",
    code: jsCode,
    mode: "run",
    visibility: "public"
  });

  const result = await adapter.pollStatus(token);
  assert.equal(result.status, JudgeResultState.ACCEPTED);
  assert.equal(result.stdout.trim(), "42");
  assert.equal(result.executedBy.engineId, "judge0");
});

// 6. TypeScript
test("Judge0 Real Live Execution: TypeScript (5.0.3)", async (t) => {
  const available = await isJudge0Available();
  if (!available) {
    t.skip("Judge0 CE service is not running on http://localhost:2358. Live verification BLOCKED (Docker not running on host).");
    return;
  }

  const adapter = new Judge0Adapter("http://localhost:2358");
  const tsCode = `
const greeting: string = "Hello KILN from Judge0 TS";
console.log(greeting);
`;

  const token = await adapter.submit({
    language: "typescript",
    code: tsCode,
    mode: "run",
    visibility: "public"
  });

  const result = await adapter.pollStatus(token);
  assert.equal(result.status, JudgeResultState.ACCEPTED);
  assert.equal(result.stdout.trim(), "Hello KILN from Judge0 TS");
  assert.equal(result.executedBy.engineId, "judge0");
});

// 7. SQL
test("Judge0 Real Live Execution: SQL through REAL Judge0 CE (SQLite 3.27.2, Language ID 82)", async (t) => {
  const available = await isJudge0Available();
  if (!available) {
    t.skip("Judge0 CE service is not running on http://localhost:2358. Live SQL verification BLOCKED (Docker not running on host).");
    return;
  }

  const adapter = new Judge0Adapter("http://localhost:2358");
  const sqlQuery = `
CREATE TABLE contestants (id INTEGER PRIMARY KEY, name TEXT, score INTEGER);
INSERT INTO contestants VALUES (1, 'Alice', 100);
INSERT INTO contestants VALUES (2, 'Bob', 95);
SELECT name, score FROM contestants WHERE score >= 100;
`;

  const token = await adapter.submit({
    language: "sql",
    code: sqlQuery,
    mode: "run",
    visibility: "public"
  });

  const result = await adapter.pollStatus(token);
  assert.equal(result.status, JudgeResultState.ACCEPTED);
  assert.equal(result.stdout.trim(), "Alice|100");
  assert.equal(result.executedBy.engineId, "judge0");
  assert.equal(result.executedBy.runtimeVersion, "3.27.2");
});
