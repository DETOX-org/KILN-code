const fs = require("node:fs");
const path = require("node:path");

const JudgeResultState = {
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  COMPILATION_ERROR: "Compilation Error",
  RUNTIME_ERROR: "Runtime Error",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
  MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
  JUDGE_ERROR: "Judge Error"
};

const DEFAULT_POLL_INTERVAL_MS = 200;
const DEFAULT_POLL_TIMEOUT_MS = 30000;

function loadManifest() {
  try {
    const manifestPath = path.resolve(__dirname, "../runtimes/judge0/manifest.json");
    if (fs.existsSync(manifestPath)) {
      return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    }
  } catch { }

  return {
    engine: "judge0-ce",
    engineVersion: "1.13.1",
    isolateVersion: "1.10.1",
    manifestVersion: "1.0.0",
    runtimes: {
      c: {
        language: "c",
        name: "C (GCC 10.2.0)",
        judge0LanguageId: 51,
        pinnedVersion: "10.2.0",
        defaultLimits: { cpuTimeLimitMs: 2000, wallTimeLimitMs: 4000, memoryLimitKb: 262144 }
      },
      cpp: {
        language: "cpp",
        name: "C++ (GCC 10.2.0)",
        judge0LanguageId: 52,
        pinnedVersion: "10.2.0",
        defaultLimits: { cpuTimeLimitMs: 2000, wallTimeLimitMs: 4000, memoryLimitKb: 262144 }
      },
      java: {
        language: "java",
        name: "Java (OpenJDK 15.0.2)",
        judge0LanguageId: 91,
        pinnedVersion: "15.0.2",
        defaultLimits: { cpuTimeLimitMs: 3000, wallTimeLimitMs: 6000, memoryLimitKb: 524288 }
      },
      python: {
        language: "python",
        name: "Python (3.10.0)",
        judge0LanguageId: 92,
        pinnedVersion: "3.10.0",
        defaultLimits: { cpuTimeLimitMs: 3000, wallTimeLimitMs: 6000, memoryLimitKb: 262144 }
      },
      javascript: {
        language: "javascript",
        name: "JavaScript (Node.js 18.15.0)",
        judge0LanguageId: 93,
        pinnedVersion: "18.15.0",
        defaultLimits: { cpuTimeLimitMs: 2000, wallTimeLimitMs: 4000, memoryLimitKb: 262144 }
      },
      typescript: {
        language: "typescript",
        name: "TypeScript (5.0.3)",
        judge0LanguageId: 94,
        pinnedVersion: "5.0.3",
        defaultLimits: { cpuTimeLimitMs: 3000, wallTimeLimitMs: 6000, memoryLimitKb: 524288 }
      },
      sql: {
        language: "sql",
        name: "SQL (SQLite 3.27.2)",
        judge0LanguageId: 82,
        pinnedVersion: "3.27.2",
        defaultLimits: { cpuTimeLimitMs: 2000, wallTimeLimitMs: 4000, memoryLimitKb: 262144 }
      }
    }
  };
}

class Judge0Adapter {
  constructor(baseUrl, customClient) {
    this.name = "judge0";
    this.baseUrl = (
      baseUrl ??
      process.env.JUDGE0_URL ??
      "http://localhost:2358"
    ).replace(/\/$/, "");

    this.customClient = customClient;
    this.jobs = new Map();
    this.manifest = loadManifest();
  }

  async _post(endpoint, body) {
    if (this.customClient?.post) {
      const res = await this.customClient.post(endpoint, body);
      return res.data;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Judge0 POST error ${res.status}: ${text}`);
      }

      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async _get(endpoint) {
    if (this.customClient?.get) {
      const res = await this.customClient.get(endpoint);
      return res.data;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Judge0 GET error ${res.status}: ${text}`);
      }

      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async submit(request) {
    const job = this.normalizeJob(request);
    const runtimeConfig = this.getRuntimeConfig(job.language);

    if (!runtimeConfig) {
      throw new Error(`Unsupported Judge0 language: ${job.language}`);
    }

    const cpuTimeLimitSec =
      job.limits?.cpuTimeLimitMs !== undefined
        ? job.limits.cpuTimeLimitMs / 1000
        : runtimeConfig.defaultLimits.cpuTimeLimitMs / 1000;

    const wallTimeLimitSec =
      job.limits?.wallTimeLimitMs !== undefined
        ? job.limits.wallTimeLimitMs / 1000
        : runtimeConfig.defaultLimits.wallTimeLimitMs / 1000;

    const memoryLimitKb =
      job.limits?.memoryLimitKb ??
      runtimeConfig.defaultLimits.memoryLimitKb;

    const payload = {
      language_id: runtimeConfig.judge0LanguageId,
      source_code: Buffer.from(job.code, "utf8").toString("base64"),
      stdin: job.input
        ? Buffer.from(job.input, "utf8").toString("base64")
        : "",
      expected_output: job.expectedOutput
        ? Buffer.from(job.expectedOutput, "utf8").toString("base64")
        : undefined,
      cpu_time_limit: cpuTimeLimitSec,
      wall_time_limit: wallTimeLimitSec,
      memory_limit: memoryLimitKb
    };

    const data = await this._post(
      "/submissions?base64_encoded=true&wait=false",
      payload
    );

    const token = data.token;

    this.jobs.set(token, {
      token,
      language: job.language,
      code: job.code,
      input: job.input,
      expectedOutput: job.expectedOutput,
      mode: job.mode ?? "submit",
      visibility: job.visibility ?? "public",
      limits: job.limits
    });

    return token;
  }

  async poll(token) {
    const data = await this._get(
      `/submissions/${token}?base64_encoded=true`
    );

    return this.decodeBase64RawResult(data);
  }

  async pollStatus(token, timeoutMs = DEFAULT_POLL_TIMEOUT_MS) {
    const deadline = Date.now() + timeoutMs;
    const context = this.jobs.get(token);

    while (Date.now() < deadline) {
      const raw = await this.poll(token);

      if (raw.status.id === 1 || raw.status.id === 2) {
        await new Promise((resolve) =>
          setTimeout(resolve, DEFAULT_POLL_INTERVAL_MS)
        );
        continue;
      }

      this.jobs.delete(token);
      return this.transformToEngineResult(raw, context);
    }

    this.jobs.delete(token);
    return {
      status: JudgeResultState.JUDGE_ERROR,
      exitCode: null,
      stdout: "",
      stderr: "Judge0 polling timed out before submission completed",
      internalErrorDetail: "Polling Timeout",
      executedBy: this.getExecutionMetadata(context?.language),
      verificationMode: "NONE"
    };
  }

  async cancel(token) {
    this.jobs.delete(token);
  }

  async healthcheck() {
    try {
      await this._get("/system_info");
      return true;
    } catch {
      try {
        await this._get("/about");
        return true;
      } catch {
        return false;
      }
    }
  }

  normalizeStatus(
    status,
    stderr = "",
    message = "",
    compileOutput = "",
    exitCode = null,
    exitSignal = null
  ) {
    const combinedErrorText = `${stderr} ${message} ${compileOutput}`.toLowerCase();

    const isOOM =
      exitCode === 137 ||
      exitSignal === 9 ||
      combinedErrorText.includes("out of memory") ||
      combinedErrorText.includes("memory limit exceeded") ||
      combinedErrorText.includes("memoryerror") ||
      combinedErrorText.includes("outofmemoryerror") ||
      combinedErrorText.includes("std::bad_alloc") ||
      combinedErrorText.includes("javascript heap out of memory") ||
      combinedErrorText.includes("fatal error: runtime: out of memory");

    const isWallTimeExceeded =
      combinedErrorText.includes("wall time limit exceeded") ||
      combinedErrorText.includes("wall clock time limit exceeded");

    if (isWallTimeExceeded) {
      return {
        status: JudgeResultState.TIME_LIMIT_EXCEEDED,
        internalErrorDetail: "Wall Time Limit Exceeded"
      };
    }

    if (isOOM) {
      return {
        status: JudgeResultState.MEMORY_LIMIT_EXCEEDED,
        internalErrorDetail: "Process terminated due to memory limit"
      };
    }

    switch (status.id) {
      case 1:
        return {
          status: JudgeResultState.JUDGE_ERROR,
          internalErrorDetail: "In Queue (Unfinished)"
        };
      case 2:
        return {
          status: JudgeResultState.JUDGE_ERROR,
          internalErrorDetail: "Processing (Unfinished)"
        };
      case 3:
        return {
          status: JudgeResultState.ACCEPTED
        };
      case 4:
        return {
          status: JudgeResultState.WRONG_ANSWER,
          internalErrorDetail: status.description
        };
      case 5:
        return {
          status: JudgeResultState.TIME_LIMIT_EXCEEDED,
          internalErrorDetail: status.description
        };
      case 6:
        return {
          status: JudgeResultState.COMPILATION_ERROR,
          internalErrorDetail: status.description
        };
      case 7:
        return {
          status: JudgeResultState.RUNTIME_ERROR,
          internalErrorDetail: "Runtime Error (SIGSEGV)"
        };
      case 8:
        return {
          status: JudgeResultState.RUNTIME_ERROR,
          internalErrorDetail: "Runtime Error (SIGXFSZ)"
        };
      case 9:
        return {
          status: JudgeResultState.RUNTIME_ERROR,
          internalErrorDetail: "Runtime Error (SIGFPE)"
        };
      case 10:
        return {
          status: JudgeResultState.RUNTIME_ERROR,
          internalErrorDetail: "Runtime Error (SIGABRT)"
        };
      case 11:
        return {
          status: JudgeResultState.RUNTIME_ERROR,
          internalErrorDetail: "Runtime Error (NZEC)"
        };
      case 12:
        return {
          status: JudgeResultState.RUNTIME_ERROR,
          internalErrorDetail: "Runtime Error (Other)"
        };
      case 13:
        return {
          status: JudgeResultState.JUDGE_ERROR,
          internalErrorDetail: "Internal Error"
        };
      case 14:
        return {
          status: JudgeResultState.JUDGE_ERROR,
          internalErrorDetail: "Exec Format Error"
        };
      default:
        return {
          status: JudgeResultState.JUDGE_ERROR,
          internalErrorDetail: `Unhandled Judge0 Status ID: ${status.id} (${status.description})`
        };
    }
  }

  enforceVisibilityPolicy(result, mode, visibility) {
    if (mode === "run" || visibility === "public") {
      return result;
    }

    if (result.status === JudgeResultState.ACCEPTED) {
      return {
        ...result,
        stdout: "",
        stderr: ""
      };
    }

    return {
      ...result,
      stdout: "",
      stderr: result.internalErrorDetail
        ? `Execution failed: ${result.internalErrorDetail}`
        : "Execution failed on hidden test case"
    };
  }

  transformToEngineResult(raw, context) {
    const rawStdout = raw.stdout ?? "";
    const rawStderr = raw.stderr ?? raw.compile_output ?? raw.message ?? "";
    const rawMessage = raw.message ?? "";
    const rawCompile = raw.compile_output ?? "";

    const { status, internalErrorDetail } = this.normalizeStatus(
      raw.status,
      rawStderr,
      rawMessage,
      rawCompile,
      raw.exit_code,
      raw.exit_signal
    );

    let finalStatus = status;

    if (
      finalStatus === JudgeResultState.ACCEPTED &&
      context?.expectedOutput !== undefined
    ) {
      const normalizedActual = rawStdout.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();
      const normalizedExpected = context.expectedOutput.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();

      if (normalizedActual !== normalizedExpected) {
        finalStatus = JudgeResultState.WRONG_ANSWER;
      }
    }

    const timeMs = raw.time ? Math.round(parseFloat(raw.time) * 1000) : undefined;
    const memoryKb = raw.memory ?? undefined;

    const baseResult = {
      status: finalStatus,
      exitCode: raw.exit_code,
      stdout: rawStdout,
      stderr: rawStderr,
      internalErrorDetail,
      timeMs,
      memoryKb,
      executedBy: this.getExecutionMetadata(context?.language),
      verificationMode: "NONE"
    };

    const mode = context?.mode ?? "submit";
    const visibility = context?.visibility ?? "public";

    return this.enforceVisibilityPolicy(baseResult, mode, visibility);
  }

  decodeBase64RawResult(raw) {
    return {
      ...raw,
      stdout: raw.stdout ? Buffer.from(raw.stdout, "base64").toString("utf8") : "",
      stderr: raw.stderr ? Buffer.from(raw.stderr, "base64").toString("utf8") : "",
      compile_output: raw.compile_output
        ? Buffer.from(raw.compile_output, "base64").toString("utf8")
        : "",
      message: raw.message ? Buffer.from(raw.message, "base64").toString("utf8") : ""
    };
  }

  normalizeJob(request) {
    return {
      language: request.language,
      code: request.code,
      input: request.input,
      expectedOutput: request.expectedOutput,
      mode: request.mode ?? "submit",
      visibility: request.visibility ?? "public",
      limits: request.limits
    };
  }

  getRuntimeConfig(language) {
    return this.manifest.runtimes[language.toLowerCase()];
  }

  getExecutionMetadata(language) {
    const config = language ? this.getRuntimeConfig(language) : undefined;

    return {
      engineId: "judge0",
      engineVersion: this.manifest.engineVersion,
      runtime: config?.name ?? language ?? "unknown",
      runtimeVersion: config?.pinnedVersion ?? "unknown",
      workerId: process.env.JUDGE0_WORKER_ID ?? "judge0-worker",
      sandboxConfigVersion: this.manifest.manifestVersion
    };
  }
}

module.exports = {
  Judge0Adapter,
  JudgeResultState
};
