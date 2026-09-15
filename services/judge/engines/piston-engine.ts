import crypto from "node:crypto";
import axios from "axios";
import type {
  EngineRequest,
  EngineResult,
  JudgeEngine
} from "./engine.js";
import type { ExecutionMetadata } from "../../../shared/judge-result.js";

type PistonRuntime = {
  language: string;
  version: string;
  compileMemoryLimit: number;
  runMemoryLimit: number;
};

type PistonStage = {
  code?: number;
  signal?: string | null;
  stdout?: string;
  stderr?: string;
  output?: string;
  message?: string;
  status?: string;
};

type PistonResponse = {
  compile?: PistonStage;
  run?: PistonStage;
};

type PistonJob = {
  id: string;
  request: EngineRequest;
};

const DEFAULT_MEMORY_LIMIT = 256 * 1024 * 1024;
const KOTLIN_COMPILE_MEMORY_LIMIT = 1024 * 1024 * 1024;

const PISTON_ENGINE_VERSION =
  process.env.PISTON_ENGINE_VERSION ??
  "sha256:2f66b7456189c4d713aa986d98eccd0b6ee16d26c7ec5f21b30e942756fd127a";

const PISTON_WORKER_ID =
  process.env.JUDGE_WORKER_ID ?? "piston-worker";

const PISTON_SANDBOX_CONFIG_VERSION =
  process.env.PISTON_SANDBOX_CONFIG_VERSION ?? "1";

const PISTON_RUNTIMES: Record<string, PistonRuntime> = {
  python: {
    language: "python",
    version: "3.10.0",
    compileMemoryLimit: DEFAULT_MEMORY_LIMIT,
    runMemoryLimit: DEFAULT_MEMORY_LIMIT
  },
  javascript: {
    language: "javascript",
    version: "18.15.0",
    compileMemoryLimit: DEFAULT_MEMORY_LIMIT,
    runMemoryLimit: DEFAULT_MEMORY_LIMIT
  },
  typescript: {
    language: "typescript",
    version: "5.0.3",
    compileMemoryLimit: DEFAULT_MEMORY_LIMIT,
    runMemoryLimit: DEFAULT_MEMORY_LIMIT
  },
  c: {
    language: "c",
    version: "10.2.0",
    compileMemoryLimit: DEFAULT_MEMORY_LIMIT,
    runMemoryLimit: DEFAULT_MEMORY_LIMIT
  },
  cpp: {
    language: "c++",
    version: "10.2.0",
    compileMemoryLimit: DEFAULT_MEMORY_LIMIT,
    runMemoryLimit: DEFAULT_MEMORY_LIMIT
  },
  java: {
    language: "java",
    version: "15.0.2",
    compileMemoryLimit: DEFAULT_MEMORY_LIMIT,
    runMemoryLimit: DEFAULT_MEMORY_LIMIT
  },
  go: {
    language: "go",
    version: "1.16.2",
    compileMemoryLimit: DEFAULT_MEMORY_LIMIT,
    runMemoryLimit: DEFAULT_MEMORY_LIMIT
  },
  rust: {
    language: "rust",
    version: "1.68.2",
    compileMemoryLimit: DEFAULT_MEMORY_LIMIT,
    runMemoryLimit: DEFAULT_MEMORY_LIMIT
  },
  csharp: {
    language: "csharp",
    version: "6.12.0",
    compileMemoryLimit: DEFAULT_MEMORY_LIMIT,
    runMemoryLimit: DEFAULT_MEMORY_LIMIT
  },
  kotlin: {
    language: "kotlin",
    version: "1.8.20",
    compileMemoryLimit: KOTLIN_COMPILE_MEMORY_LIMIT,
    runMemoryLimit: DEFAULT_MEMORY_LIMIT
  },
  sql: {
    language: "sqlite3",
    version: "3.36.0",
    compileMemoryLimit: DEFAULT_MEMORY_LIMIT,
    runMemoryLimit: DEFAULT_MEMORY_LIMIT
  }
};

export class PistonEngine implements JudgeEngine {
  name = "piston";

  private readonly baseUrl =
    process.env.PISTON_URL ?? "http://piston:2000/api/v2";

  private readonly jobs = new Map<string, PistonJob>();

  async submit(request: EngineRequest): Promise<string> {
    const jobId = crypto.randomUUID();

    this.jobs.set(jobId, {
      id: jobId,
      request
    });

    return jobId;
  }

  async pollStatus(jobId: string): Promise<EngineResult> {
    const job = this.jobs.get(jobId);

    if (!job) {
      return {
        status: "Judge Error",
        exitCode: null,
        stdout: "",
        stderr: `Unknown Piston job: ${jobId}`,
        executedBy: this.getExecutionMetadata(),
        verificationMode: "NONE"
      };
    }

    try {
      const result = await this.execute(job.request);

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
        executedBy: this.getExecutionMetadata(
          job.request.language
        ),
        verificationMode: "NONE"
      };
    }
  }

  async cancel(jobId: string): Promise<void> {
    this.jobs.delete(jobId);
  }

  async execute(request: EngineRequest): Promise<EngineResult> {
    const runtime = this.getRuntime(request.language);

    if (!runtime) {
      return {
        status: "Judge Error",
        exitCode: null,
        stdout: "",
        stderr: `Unsupported Piston language: ${request.language}`,
        executedBy: this.getExecutionMetadata(
          request.language
        ),
        verificationMode: "NONE"
      };
    }

    try {
      const response = await axios.post<PistonResponse>(
        `${this.baseUrl}/execute`,
        {
          language: runtime.language,
          version: runtime.version,
          files: [
            {
              name: "main",
              content: request.code
            }
          ],
          stdin: request.input,
          compile_memory_limit:
            runtime.compileMemoryLimit,
          run_memory_limit:
            runtime.runMemoryLimit
        },
        {
          timeout: 30000
        }
      );

      return {
        ...this.mapResult(response.data),
        executedBy: this.getExecutionMetadata(
          request.language
        )
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
        executedBy: this.getExecutionMetadata(
          request.language
        ),
        verificationMode: "NONE"
      };
    }
  }

  async healthcheck(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/runtimes`, {
        timeout: 10000
      });

      return true;
    } catch {
      return false;
    }
  }

  private getRuntime(
    language: string
  ): PistonRuntime | undefined {
    return PISTON_RUNTIMES[language];
  }

  private getExecutionMetadata(
    language?: string
  ): ExecutionMetadata {
    const runtime = language
      ? this.getRuntime(language)
      : undefined;

    return {
      engineId: "piston",
      engineVersion: PISTON_ENGINE_VERSION,
      runtime: runtime?.language ?? language ?? "unknown",
      runtimeVersion: runtime?.version ?? "unknown",
      workerId: PISTON_WORKER_ID,
      sandboxConfigVersion:
        PISTON_SANDBOX_CONFIG_VERSION
    };
  }

  private mapResult(
    data: PistonResponse
  ): Omit<EngineResult, "executedBy"> {
    if (data.compile && data.compile.code !== 0) {
      return {
        status: "Compilation Error",
        exitCode: data.compile.code ?? null,
        stdout: data.compile.stdout ?? "",
        stderr:
          data.compile.stderr ??
          data.compile.output ??
          "",
        verificationMode: "NONE"
      };
    }

    if (!data.run) {
      return {
        status: "Judge Error",
        exitCode: null,
        stdout: "",
        stderr: "Piston returned no execution result",
        verificationMode: "NONE"
      };
    }

    const run = data.run;
    const stderr = run.stderr ?? run.output ?? "";

    if (
      run.status === "TO" ||
      run.message
        ?.toLowerCase()
        .includes("time limit exceeded")
    ) {
      return {
        status: "Time Limit Exceeded",
        exitCode: run.code ?? null,
        stdout: run.stdout ?? "",
        stderr:
          run.stderr ??
          run.message ??
          "",
        verificationMode: "NONE"
      };
    }

    if (
      run.status === "OL" ||
      run.message
        ?.toLowerCase()
        .includes("memory limit exceeded")
    ) {
      return {
        status: "Memory Limit Exceeded",
        exitCode: run.code ?? null,
        stdout: run.stdout ?? "",
        stderr:
          run.stderr ??
          run.message ??
          "",
        verificationMode: "NONE"
      };
    }

    if (run.code === 137) {
      return {
        status: "Memory Limit Exceeded",
        exitCode: run.code,
        stdout: run.stdout ?? "",
        stderr:
          run.stderr ??
          run.signal ??
          "",
        verificationMode: "NONE"
      };
    }

    if (
      run.code !== 0 &&
      run.stderr?.includes("SyntaxError")
    ) {
      return {
        status: "Compilation Error",
        exitCode: run.code ?? null,
        stdout: run.stdout ?? "",
        stderr,
        verificationMode: "NONE"
      };
    }

    if (run.signal) {
      return {
        status: "Runtime Error",
        exitCode: run.code ?? null,
        stdout: run.stdout ?? "",
        stderr:
          run.stderr ??
          run.signal,
        verificationMode: "NONE"
      };
    }

    if (run.code === 0) {
      return {
        status: "Accepted",
        exitCode: 0,
        stdout: run.stdout ?? "",
        stderr: run.stderr ?? "",
        verificationMode: "NONE"
      };
    }

    return {
      status: "Runtime Error",
      exitCode: run.code ?? null,
      stdout: run.stdout ?? "",
      stderr,
      verificationMode: "NONE"
    };
  }
}