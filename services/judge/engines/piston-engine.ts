import crypto from "node:crypto";
import axios from "axios";

import type {
  EngineRequest,
  EngineResult,
  JudgeEngine,
} from "./engine.js";

import type { ExecutionMetadata } from "../../../shared/judge-result.js";

/* ============================================================
   TYPES
============================================================ */

type PistonRuntime = {
  language: string;
  version: string;
  compileMemoryLimit: number;
  runMemoryLimit: number;
};

/**
 * Exact shape returned by Piston's `run` object.
 *
 * Piston reports:
 * - cpu_time  -> CPU execution time in milliseconds
 * - wall_time -> wall-clock execution time in milliseconds
 * - memory    -> memory usage in bytes
 */
interface PistonRunResponse {
  signal?: string | null;
  stdout?: string;
  stderr?: string;
  code?: number | null;
  output?: string;
  memory?: number | null;
  message?: string | null;
  status?: string | null;
  cpu_time?: number | null;
  wall_time?: number | null;
}

/**
 * Piston compile stage.
 */
interface PistonCompileResponse {
  code?: number | null;
  stdout?: string;
  stderr?: string;
  output?: string;
}

/**
 * Complete Piston /execute response.
 */
interface PistonResponse {
  compile?: PistonCompileResponse | null;
  run?: PistonRunResponse | null;
}

type PistonJob = {
  id: string;
  request: EngineRequest;
};

/**
 * EngineResult in the existing codebase does not currently declare
 * runtimeMs/memoryKb, so keep the additional execution metrics in
 * a local extended result type.
 *
 * This avoids changing unrelated engine interfaces while still
 * allowing the metrics to travel through the Judge -> Redis -> API
 * pipeline.
 */
type PistonEngineResult = EngineResult & {
  runtimeMs: number;
  memoryKb: number;
};

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_MEMORY_LIMIT = 256 * 1024 * 1024;

const KOTLIN_COMPILE_MEMORY_LIMIT =
  1024 * 1024 * 1024;

const PISTON_ENGINE_VERSION =
  process.env.PISTON_ENGINE_VERSION ??
  "sha256:2f66b7456189c4d713aa986d98eccd0b6ee16d26c7ec5f21b30e942756fd127a";

const PISTON_WORKER_ID =
  process.env.JUDGE_WORKER_ID ??
  "piston-worker";

const PISTON_SANDBOX_CONFIG_VERSION =
  process.env.PISTON_SANDBOX_CONFIG_VERSION ??
  "1";

/* ============================================================
   SUPPORTED PISTON RUNTIMES
============================================================ */

const PISTON_RUNTIMES: Record<
  string,
  PistonRuntime
> = {
  python: {
    language: "python",
    version: "3.10.0",
    compileMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
    runMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
  },

  javascript: {
    language: "javascript",
    version: "18.15.0",
    compileMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
    runMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
  },

  typescript: {
    language: "typescript",
    version: "5.0.3",
    compileMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
    runMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
  },

  c: {
    language: "c",
    version: "10.2.0",
    compileMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
    runMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
  },

  embedded_c: {
    language: "c",
    version: "10.2.0",
    compileMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
    runMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
  },

  cpp: {
    language: "c++",
    version: "10.2.0",
    compileMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
    runMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
  },

  java: {
    language: "java",
    version: "15.0.2",
    compileMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
    runMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
  },

  go: {
    language: "go",
    version: "1.16.2",
    compileMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
    runMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
  },

  rust: {
    language: "rust",
    version: "1.68.2",
    compileMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
    runMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
  },

  csharp: {
    language: "csharp",
    version: "6.12.0",
    compileMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
    runMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
  },

  kotlin: {
    language: "kotlin",
    version: "1.8.20",
    compileMemoryLimit:
      KOTLIN_COMPILE_MEMORY_LIMIT,
    runMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
  },

  sql: {
    language: "sqlite3",
    version: "3.36.0",
    compileMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
    runMemoryLimit:
      DEFAULT_MEMORY_LIMIT,
  },
};

/* ============================================================
   PISTON ENGINE
============================================================ */

export class PistonEngine
  implements JudgeEngine {
  name = "piston";

  private readonly baseUrl =
    process.env.PISTON_URL ??
    "http://piston:2000/api/v2";

  private readonly jobs =
    new Map<string, PistonJob>();

  /* ==========================================================
     SUBMIT
  ========================================================== */

  async submit(
    request: EngineRequest,
  ): Promise<string> {
    const jobId =
      crypto.randomUUID();

    this.jobs.set(jobId, {
      id: jobId,
      request,
    });

    return jobId;
  }

  /* ==========================================================
     POLL STATUS
  ========================================================== */

  async pollStatus(
    jobId: string,
  ): Promise<EngineResult> {
    const job =
      this.jobs.get(jobId);

    if (!job) {
      return {
        status: "Judge Error",
        exitCode: null,
        stdout: "",
        stderr:
          `Unknown Piston job: ${jobId}`,

        runtimeMs: 0,
        memoryKb: 0,

        executedBy:
          this.getExecutionMetadata(),

        verificationMode:
          "NONE",
      } as EngineResult;
    }

    try {
      const result =
        await this.execute(
          job.request,
        );

      this.jobs.delete(jobId);

      return result;
    } catch (error) {
      this.jobs.delete(jobId);

      return {
        status: "Judge Error",
        exitCode: null,
        stdout: "",
        stderr:
          error instanceof Error
            ? error.message
            : String(error),

        runtimeMs: 0,
        memoryKb: 0,

        executedBy:
          this.getExecutionMetadata(
            job.request.language,
          ),

        verificationMode:
          "NONE",
      } as EngineResult;
    }
  }

  /* ==========================================================
     CANCEL
  ========================================================== */

  async cancel(
    jobId: string,
  ): Promise<void> {
    this.jobs.delete(jobId);
  }

  /* ==========================================================
     EXECUTE
  ========================================================== */

  async execute(
    request: EngineRequest,
  ): Promise<PistonEngineResult> {
    const runtime =
      this.getRuntime(
        request.language,
      );

    /* --------------------------------------------------------
       Unsupported language
    -------------------------------------------------------- */

    if (!runtime) {
      return {
        status: "Judge Error",
        exitCode: null,
        stdout: "",
        stderr:
          `Unsupported Piston language: ${request.language}`,

        runtimeMs: 0,
        memoryKb: 0,

        executedBy:
          this.getExecutionMetadata(
            request.language,
          ),

        verificationMode:
          "NONE",
      };
    }

    try {
      /* ------------------------------------------------------
         Call Piston
      ------------------------------------------------------ */

      const response =
        await axios.post<PistonResponse>(
          `${this.baseUrl}/execute`,

          {
            language:
              runtime.language,

            version:
              runtime.version,

            files: [
              {
                name: "main",
                content:
                  request.code,
              },
            ],

            stdin:
              request.input,

            compile_memory_limit:
              runtime.compileMemoryLimit,

            run_memory_limit:
              runtime.runMemoryLimit,
          },

          {
            timeout: 30000,
          },
        );

      /* ------------------------------------------------------
         Convert Piston status
      ------------------------------------------------------ */

      const mappedResult =
        this.mapResult(
          response.data,
        );

      /* ------------------------------------------------------
         Read actual Piston execution metrics
      ------------------------------------------------------ */

      const run =
        response.data?.run;

      /**
       * Piston:
       *
       * cpu_time = CPU time in milliseconds
       * wall_time = wall-clock time in milliseconds
       *
       * Prefer CPU time because that is the actual execution
       * measurement. Fall back to wall time if unavailable.
       */
      const runtimeMs =
        Number(
          run?.cpu_time ??
          run?.wall_time ??
          0,
        );

      /**
       * Piston memory is returned in bytes.
       * Database expects KB.
       */
      const memoryKb =
        Math.ceil(
          Number(
            run?.memory ?? 0,
          ) / 1024,
        );

      /* ------------------------------------------------------
         Return complete result
      ------------------------------------------------------ */

      return {
        ...mappedResult,

        runtimeMs,
        memoryKb,

        executedBy:
          this.getExecutionMetadata(
            request.language,
          ),
      };
    } catch (error) {
      return {
        status: "Judge Error",
        exitCode: null,
        stdout: "",
        stderr:
          error instanceof Error
            ? error.message
            : String(error),

        runtimeMs: 0,
        memoryKb: 0,

        executedBy:
          this.getExecutionMetadata(
            request.language,
          ),

        verificationMode:
          "NONE",
      };
    }
  }

  /* ==========================================================
     HEALTH CHECK
  ========================================================== */

  async healthcheck(): Promise<boolean> {
    try {
      await axios.get(
        `${this.baseUrl}/runtimes`,
        {
          timeout: 10000,
        },
      );

      return true;
    } catch {
      return false;
    }
  }

  /* ==========================================================
     RUNTIME LOOKUP
  ========================================================== */

  private getRuntime(
    language: string,
  ):
    | PistonRuntime
    | undefined {
    return PISTON_RUNTIMES[
      language
    ];
  }

  /* ==========================================================
     EXECUTION METADATA
  ========================================================== */

  private getExecutionMetadata(
    language?: string,
  ): ExecutionMetadata {
    const runtime =
      language
        ? this.getRuntime(
          language,
        )
        : undefined;

    return {
      engineId:
        "piston",

      engineVersion:
        PISTON_ENGINE_VERSION,

      runtime:
        runtime?.language ??
        language ??
        "unknown",

      runtimeVersion:
        runtime?.version ??
        "unknown",

      workerId:
        PISTON_WORKER_ID,

      sandboxConfigVersion:
        PISTON_SANDBOX_CONFIG_VERSION,
    };
  }

  /* ==========================================================
     MAP PISTON RESULT -> KILN RESULT
  ========================================================== */

  private mapResult(
    data: PistonResponse,
  ): Omit<
    EngineResult,
    "executedBy"
  > {
    /* --------------------------------------------------------
       Compilation error
    -------------------------------------------------------- */

    if (
      data.compile &&
      data.compile.code !== 0
    ) {
      return {
        status:
          "Compilation Error",

        exitCode:
          data.compile.code ??
          null,

        stdout:
          data.compile.stdout ??
          "",

        stderr:
          data.compile.stderr ??
          data.compile.output ??
          "",

        verificationMode:
          "NONE",
      };
    }

    /* --------------------------------------------------------
       No run result
    -------------------------------------------------------- */

    if (!data.run) {
      return {
        status:
          "Judge Error",

        exitCode:
          null,

        stdout:
          "",

        stderr:
          "Piston returned no execution result",

        verificationMode:
          "NONE",
      };
    }

    const run =
      data.run;

    const stderr =
      run.stderr ??
      run.output ??
      "";

    /* --------------------------------------------------------
       Time Limit Exceeded
    -------------------------------------------------------- */

    if (
      run.status === "TO" ||
      run.message
        ?.toLowerCase()
        .includes(
          "time limit exceeded",
        )
    ) {
      return {
        status:
          "Time Limit Exceeded",

        exitCode:
          run.code ??
          null,

        stdout:
          run.stdout ??
          "",

        stderr:
          run.stderr ??
          run.message ??
          "",

        verificationMode:
          "NONE",
      };
    }

    /* --------------------------------------------------------
       Memory Limit Exceeded
    -------------------------------------------------------- */

    if (
      run.status === "OL" ||
      run.message
        ?.toLowerCase()
        .includes(
          "memory limit exceeded",
        )
    ) {
      return {
        status:
          "Memory Limit Exceeded",

        exitCode:
          run.code ??
          null,

        stdout:
          run.stdout ??
          "",

        stderr:
          run.stderr ??
          run.message ??
          "",

        verificationMode:
          "NONE",
      };
    }

    /* --------------------------------------------------------
       Linux OOM / kill code
    -------------------------------------------------------- */

    if (
      run.code === 137
    ) {
      return {
        status:
          "Memory Limit Exceeded",

        exitCode:
          run.code,

        stdout:
          run.stdout ??
          "",

        stderr:
          run.stderr ??
          run.signal ??
          "",

        verificationMode:
          "NONE",
      };
    }

    /* --------------------------------------------------------
       Python syntax error
    -------------------------------------------------------- */

    if (
      run.code !== 0 &&
      run.stderr
        ?.includes(
          "SyntaxError",
        )
    ) {
      return {
        status:
          "Compilation Error",

        exitCode:
          run.code ??
          null,

        stdout:
          run.stdout ??
          "",

        stderr,

        verificationMode:
          "NONE",
      };
    }

    /* --------------------------------------------------------
       Process terminated by signal
    -------------------------------------------------------- */

    if (
      run.signal
    ) {
      return {
        status:
          "Runtime Error",

        exitCode:
          run.code ??
          null,

        stdout:
          run.stdout ??
          "",

        stderr:
          run.stderr ??
          run.signal,

        verificationMode:
          "NONE",
      };
    }

    /* --------------------------------------------------------
       Successful execution
    -------------------------------------------------------- */

    if (
      run.code === 0
    ) {
      return {
        status:
          "Accepted",

        exitCode:
          0,

        stdout:
          run.stdout ??
          "",

        stderr:
          run.stderr ??
          "",

        verificationMode:
          "NONE",
      };
    }

    /* --------------------------------------------------------
       Everything else -> Runtime Error
    -------------------------------------------------------- */

    return {
      status:
        "Runtime Error",

      exitCode:
        run.code ??
        null,

      stdout:
        run.stdout ??
        "",

      stderr,

      verificationMode:
        "NONE",
    };
  }
}

