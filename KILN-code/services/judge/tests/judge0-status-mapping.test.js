const test = require("node:test");
const assert = require("node:assert/strict");
const { Judge0Adapter, JudgeResultState } = require("../engines/judge0-adapter.js");

const adapter = new Judge0Adapter();

test("Judge0 Status 1: In Queue maps to JUDGE_ERROR with detail", () => {
  const result = adapter.normalizeStatus({ id: 1, description: "In Queue" });
  assert.equal(result.status, JudgeResultState.JUDGE_ERROR);
  assert.equal(result.internalErrorDetail, "In Queue (Unfinished)");
});

test("Judge0 Status 2: Processing maps to JUDGE_ERROR with detail", () => {
  const result = adapter.normalizeStatus({ id: 2, description: "Processing" });
  assert.equal(result.status, JudgeResultState.JUDGE_ERROR);
  assert.equal(result.internalErrorDetail, "Processing (Unfinished)");
});

test("Judge0 Status 3: Accepted maps to ACCEPTED", () => {
  const result = adapter.normalizeStatus({ id: 3, description: "Accepted" });
  assert.equal(result.status, JudgeResultState.ACCEPTED);
});

test("Judge0 Status 4: Wrong Answer maps to WRONG_ANSWER", () => {
  const result = adapter.normalizeStatus({ id: 4, description: "Wrong Answer" });
  assert.equal(result.status, JudgeResultState.WRONG_ANSWER);
  assert.equal(result.internalErrorDetail, "Wrong Answer");
});

test("Judge0 Status 5: Time Limit Exceeded maps to TIME_LIMIT_EXCEEDED", () => {
  const result = adapter.normalizeStatus({ id: 5, description: "Time Limit Exceeded" });
  assert.equal(result.status, JudgeResultState.TIME_LIMIT_EXCEEDED);
  assert.equal(result.internalErrorDetail, "Time Limit Exceeded");
});

test("Judge0 Status 6: Compilation Error maps to COMPILATION_ERROR", () => {
  const result = adapter.normalizeStatus(
    { id: 6, description: "Compilation Error" },
    "",
    "",
    "main.cpp: In function 'int main()': error: expected ';' before '}' token"
  );
  assert.equal(result.status, JudgeResultState.COMPILATION_ERROR);
  assert.equal(result.internalErrorDetail, "Compilation Error");
});

test("Judge0 Status 7: Runtime Error (SIGSEGV) maps to RUNTIME_ERROR with SIGSEGV detail", () => {
  const result = adapter.normalizeStatus(
    { id: 7, description: "Runtime Error (SIGSEGV)" },
    "Segmentation fault (core dumped)"
  );
  assert.equal(result.status, JudgeResultState.RUNTIME_ERROR);
  assert.equal(result.internalErrorDetail, "Runtime Error (SIGSEGV)");
});

test("Judge0 Status 8: Runtime Error (SIGXFSZ) maps to RUNTIME_ERROR with SIGXFSZ detail", () => {
  const result = adapter.normalizeStatus(
    { id: 8, description: "Runtime Error (SIGXFSZ)" },
    "File size limit exceeded"
  );
  assert.equal(result.status, JudgeResultState.RUNTIME_ERROR);
  assert.equal(result.internalErrorDetail, "Runtime Error (SIGXFSZ)");
});

test("Judge0 Status 9: Runtime Error (SIGFPE) maps to RUNTIME_ERROR with SIGFPE detail", () => {
  const result = adapter.normalizeStatus(
    { id: 9, description: "Runtime Error (SIGFPE)" },
    "Floating point exception"
  );
  assert.equal(result.status, JudgeResultState.RUNTIME_ERROR);
  assert.equal(result.internalErrorDetail, "Runtime Error (SIGFPE)");
});

test("Judge0 Status 10: Runtime Error (SIGABRT) maps to RUNTIME_ERROR with SIGABRT detail", () => {
  const result = adapter.normalizeStatus(
    { id: 10, description: "Runtime Error (SIGABRT)" },
    "Aborted (core dumped)"
  );
  assert.equal(result.status, JudgeResultState.RUNTIME_ERROR);
  assert.equal(result.internalErrorDetail, "Runtime Error (SIGABRT)");
});

test("Judge0 Status 11: Runtime Error (NZEC) maps to RUNTIME_ERROR with NZEC detail", () => {
  const result = adapter.normalizeStatus(
    { id: 11, description: "Runtime Error (NZEC)" },
    "Exception in thread \"main\" java.lang.ArithmeticException: / by zero",
    "",
    "",
    1
  );
  assert.equal(result.status, JudgeResultState.RUNTIME_ERROR);
  assert.equal(result.internalErrorDetail, "Runtime Error (NZEC)");
});

test("Judge0 Status 12: Runtime Error (Other) maps to RUNTIME_ERROR with Other detail", () => {
  const result = adapter.normalizeStatus(
    { id: 12, description: "Runtime Error (Other)" },
    "Process killed with unknown error"
  );
  assert.equal(result.status, JudgeResultState.RUNTIME_ERROR);
  assert.equal(result.internalErrorDetail, "Runtime Error (Other)");
});

test("Judge0 Status 13: Internal Error maps to JUDGE_ERROR", () => {
  const result = adapter.normalizeStatus({ id: 13, description: "Internal Error" });
  assert.equal(result.status, JudgeResultState.JUDGE_ERROR);
  assert.equal(result.internalErrorDetail, "Internal Error");
});

test("Judge0 Status 14: Exec Format Error maps to JUDGE_ERROR", () => {
  const result = adapter.normalizeStatus({ id: 14, description: "Exec Format Error" });
  assert.equal(result.status, JudgeResultState.JUDGE_ERROR);
  assert.equal(result.internalErrorDetail, "Exec Format Error");
});

test("OOM detection: NZEC with exit code 137 maps to MEMORY_LIMIT_EXCEEDED", () => {
  const result = adapter.normalizeStatus(
    { id: 11, description: "Runtime Error (NZEC)" },
    "Killed",
    "",
    "",
    137
  );
  assert.equal(result.status, JudgeResultState.MEMORY_LIMIT_EXCEEDED);
  assert.match(result.internalErrorDetail, /memory limit/i);
});

test("OOM detection: Python MemoryError maps to MEMORY_LIMIT_EXCEEDED", () => {
  const result = adapter.normalizeStatus(
    { id: 11, description: "Runtime Error (NZEC)" },
    "MemoryError",
    "",
    "",
    1
  );
  assert.equal(result.status, JudgeResultState.MEMORY_LIMIT_EXCEEDED);
});

test("OOM detection: C++ std::bad_alloc maps to MEMORY_LIMIT_EXCEEDED", () => {
  const result = adapter.normalizeStatus(
    { id: 10, description: "Runtime Error (SIGABRT)" },
    "terminate called after throwing an instance of 'std::bad_alloc'\nwhat():  std::bad_alloc"
  );
  assert.equal(result.status, JudgeResultState.MEMORY_LIMIT_EXCEEDED);
});

test("OOM detection: Java OutOfMemoryError maps to MEMORY_LIMIT_EXCEEDED", () => {
  const result = adapter.normalizeStatus(
    { id: 11, description: "Runtime Error (NZEC)" },
    "java.lang.OutOfMemoryError: Java heap space"
  );
  assert.equal(result.status, JudgeResultState.MEMORY_LIMIT_EXCEEDED);
});

test("Wall-clock timeout detection: process killed by wall time limit maps to TIME_LIMIT_EXCEEDED", () => {
  const result = adapter.normalizeStatus(
    { id: 11, description: "Runtime Error (NZEC)" },
    "Wall time limit exceeded"
  );
  assert.equal(result.status, JudgeResultState.TIME_LIMIT_EXCEEDED);
  assert.equal(result.internalErrorDetail, "Wall Time Limit Exceeded");
});

test("Unhandled status ID does not fall through silently", () => {
  const result = adapter.normalizeStatus({ id: 999, description: "Hypothetical Future Code" });
  assert.equal(result.status, JudgeResultState.JUDGE_ERROR);
  assert.match(result.internalErrorDetail, /Unhandled Judge0 Status ID: 999/);
});
