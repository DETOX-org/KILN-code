const test = require("node:test");
const assert = require("node:assert/strict");

const BASE_URL =
  process.env.JUDGE_URL ?? "http://localhost:3001";

async function execute(payload) {
  const response = await fetch(`${BASE_URL}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return response.json();
}

test("Accepted", async () => {
  const result = await execute({
    language: "python",
    code: "print(5)",
    tests: [
      {
        input: "",
        expectedOutput: "5",
        visibility: "public"
      }
    ]
  });

  assert.equal(result.status, "Accepted");
  assert.equal(result.testCase, 1);
  assert.equal(result.visibility, "public");
});

test("Wrong Answer", async () => {
  const result = await execute({
    language: "python",
    code: "print(4)",
    tests: [
      {
        input: "",
        expectedOutput: "5",
        visibility: "public"
      }
    ]
  });

  assert.equal(result.status, "Wrong Answer");
});

test("Compilation Error", async () => {
  const result = await execute({
    language: "python",
    code: "print(",
    tests: [
      {
        input: "",
        expectedOutput: "",
        visibility: "public"
      }
    ]
  });

  assert.equal(result.status, "Compilation Error");
});

test("Runtime Error", async () => {
  const result = await execute({
    language: "python",
    code: "raise Exception('test error')",
    tests: [
      {
        input: "",
        expectedOutput: "",
        visibility: "public"
      }
    ]
  });

  assert.equal(result.status, "Runtime Error");
});

test("Time Limit Exceeded", async () => {
  const result = await execute({
    language: "python",
    code: "while True: pass",
    tests: [
      {
        input: "",
        expectedOutput: "",
        visibility: "public"
      }
    ]
  });

  assert.equal(result.status, "Time Limit Exceeded");
});

test("Memory Limit Exceeded", async () => {
  const result = await execute({
    language: "python",
    code: "a='x'*600000000",
    tests: [
      {
        input: "",
        expectedOutput: "",
        visibility: "public"
      }
    ]
  });

  assert.equal(result.status, "Memory Limit Exceeded");
});

test("Public and hidden tests", async () => {
  const result = await execute({
    language: "python",
    code: "print('hello')",
    tests: [
      {
        input: "",
        expectedOutput: "hello",
        visibility: "public"
      },
      {
        input: "",
        expectedOutput: "hello",
        visibility: "hidden"
      }
    ]
  });

  assert.equal(result.status, "Accepted");
  assert.equal(result.testCase, 2);
  assert.equal(result.visibility, "hidden");
});

test("Multiple tests stop on wrong answer", async () => {
  const result = await execute({
    language: "python",
    code: "print('wrong')",
    tests: [
      {
        input: "",
        expectedOutput: "wrong",
        visibility: "public"
      },
      {
        input: "",
        expectedOutput: "correct",
        visibility: "public"
      }
    ]
  });

  assert.equal(result.status, "Wrong Answer");
  assert.equal(result.testCase, 2);
});

test("Unsupported language", async () => {
  const result = await execute({
    language: "brainfuck",
    code: "test",
    tests: [
      {
        input: "",
        expectedOutput: "",
        visibility: "public"
      }
    ]
  });

  assert.equal(result.status, "Judge Error");
});

test("Empty test list rejected", async () => {
  const result = await execute({
    language: "python",
    code: "print(1)",
    tests: []
  });

  assert.equal(result.status, "Judge Error");
});

test("Invalid visibility rejected", async () => {
  const result = await execute({
    language: "python",
    code: "print(1)",
    tests: [
      {
        input: "",
        expectedOutput: "1",
        visibility: "invalid"
      }
    ]
  });

  assert.equal(result.status, "Judge Error");
});