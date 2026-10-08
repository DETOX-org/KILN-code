import axios from "axios";

import type {
  EngineRequest,
  EngineResult,
  JudgeEngine
} from "./engine.js";

const POLL_INTERVAL_MS = 100;
const POLL_TIMEOUT_MS = 120000;

type AdapterSubmitResponse = {
  jobId: string;
};

type AdapterPollResponse = {
  finished: boolean;
  result?: EngineResult;
};

export class DmojEngine implements JudgeEngine {
  name = "dmoj";

  private readonly baseUrl =
    process.env.DMOJ_ADAPTER_URL ??
    "http://judge:3002";

  async submit(
    request: EngineRequest
  ): Promise<string> {
    const response =
      await axios.post<AdapterSubmitResponse>(
        `${this.baseUrl}/jobs`,
        {
          language: request.language,
          code: request.code,
          input: request.input,
          expectedOutput:
            request.expectedOutput ?? ""
        },
        {
          timeout: 10000
        }
      );

    return response.data.jobId;
  }

  async pollStatus(
    jobId: string
  ): Promise<EngineResult> {
    const deadline =
      Date.now() + POLL_TIMEOUT_MS;

    while (Date.now() < deadline) {
      try {
        const response =
          await axios.get<AdapterPollResponse>(
            `${this.baseUrl}/jobs/${encodeURIComponent(jobId)}`,
            {
              timeout: 10000
            }
          );

        if (
          response.data.finished &&
          response.data.result
        ) {
          return response.data.result;
        }
      } catch (error) {
        return {
          status: "Judge Error",
          exitCode: null,
          stdout: "",
          stderr:
            error instanceof Error
              ? error.message
              : String(error),
          executedBy: {
            engineId: "dmoj",
            engineVersion:
              process.env.DMOJ_ENGINE_VERSION ??
              "5ef74c5d6cad9efb2e86a5bb8ff2c90aaa6e435c",
            runtime: "dmoj",
            runtimeVersion: "unknown",
            workerId:
              process.env.DMOJ_JUDGE_NAME
          },
          verificationMode: "NONE"
        };
      }

      await new Promise((resolve) =>
        setTimeout(resolve, POLL_INTERVAL_MS)
      );
    }

    return {
      status: "Judge Error",
      exitCode: null,
      stdout: "",
      stderr: `DMOJ job timed out: ${jobId}`,
      executedBy: {
        engineId: "dmoj",
        engineVersion:
          process.env.DMOJ_ENGINE_VERSION ??
          "5ef74c5d6cad9efb2e86a5bb8ff2c90aaa6e435c",
        runtime: "dmoj",
        runtimeVersion: "unknown",
        workerId:
          process.env.DMOJ_JUDGE_NAME
      },
      verificationMode: "NONE"
    };
  }

  async cancel(jobId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/jobs/${encodeURIComponent(jobId)}/cancel`,
        {},
        {
          timeout: 10000
        }
      );
    } catch {
      // Cancellation is best-effort.
    }
  }

  async healthcheck(): Promise<boolean> {
    try {
      await axios.get(
        `${this.baseUrl}/health`,
        {
          timeout: 3000
        }
      );

      return true;
    } catch {
      return false;
    }
  }
}
