import http from "node:http";
import { randomUUID } from "node:crypto";

import { DmojBridge } from "./dmoj-bridge.js";
import { mapDmojSubmissionResult } from "./dmoj-result.js";
import { createDmojProblem, removeDmojProblem } from "./dmoj-problem-store.js";

const PORT = Number(
  process.env.DMOJ_ADAPTER_PORT ?? 3002
);

const LANGUAGE_MAP: Record<string, string> = {
  go: "GO",
  rust: "RUST",
  kotlin: "KOTLIN",
  csharp: "MONOCS",
  embedded_c: "C"
};

const bridge = new DmojBridge();

const jobProblems = new Map<string, string>();

function sendJson(
  res: http.ServerResponse,
  status: number,
  body: unknown
): void {
  res.writeHead(status, {
    "Content-Type": "application/json"
  });

  res.end(JSON.stringify(body));
}

async function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  if (
    req.method === "GET" &&
    req.url === "/health"
  ) {
    sendJson(res, 200, bridge.getHealth());
    return;
  }

  if (
    req.method === "POST" &&
    req.url === "/jobs"
  ) {
    let body = "";

    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });

    await new Promise<void>((resolve) => {
      req.on("end", () => resolve());
    });

    try {
      const request = JSON.parse(body) as {
        language: string;
        code: string;
        input?: string;
        expectedOutput?: string;
        timeLimit?: number;
        memoryLimit?: number;
        shortCircuit?: boolean;
        meta?: Record<string, unknown>;
      };

      const dmojLanguage = LANGUAGE_MAP[request.language];

      if (!dmojLanguage) {
        throw new Error(
          `DMOJ does not support language: ${request.language}`
        );
      }

      const problemId = `adhoc-${randomUUID()}`;
      const timeLimit = request.timeLimit ?? 2;
      const memoryLimit = request.memoryLimit ?? 262144;
      const shortCircuit = request.shortCircuit ?? true;

      await createDmojProblem({
        problemId,
        timeLimit,
        memoryLimit,
        shortCircuit,
        initYml:
          "test_cases:\n- {in: input.txt, out: output.txt, points: 100}\n",
        files: {
          "input.txt": request.input ?? "",
          "output.txt": request.expectedOutput ?? ""
        }
      });

      const jobId = await bridge.submit({
        problemId,
        language: dmojLanguage,
        source: request.code,
        timeLimit,
        memoryLimit,
        shortCircuit,
        meta: request.meta
      });

      jobProblems.set(jobId, problemId);

      sendJson(res, 202, {
        jobId
      });
    } catch (error) {
      sendJson(res, 500, {
        error:
          error instanceof Error
            ? error.message
            : String(error)
      });
    }

    return;
  }

  if (
    req.method === "GET" &&
    req.url?.startsWith("/jobs/")
  ) {
    const jobId = decodeURIComponent(
      req.url.slice("/jobs/".length)
    );

    try {
      const state = await bridge.poll(jobId);

      if (state.finished) {
        const problemId = jobProblems.get(jobId);

        if (problemId) {
          jobProblems.delete(jobId);
          void removeDmojProblem(problemId).catch(() => {
            // Best-effort cleanup.
          });
        }
      }

      sendJson(res, 200, {
        finished: state.finished,
        result: state.finished
          ? mapDmojSubmissionResult(state)
          : undefined
      });
    } catch (error) {
      sendJson(res, 404, {
        error:
          error instanceof Error
            ? error.message
            : String(error)
      });
    }

    return;
  }

  sendJson(res, 404, {
    error: "Not Found"
  });
}

const server = http.createServer(
  (req, res) => {
    void handleRequest(req, res).catch(
      (error) => {
        sendJson(res, 500, {
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
    );
  }
);

async function start(): Promise<void> {
  await bridge.start();

  server.listen(PORT, () => {
    console.log(
      `DMOJ adapter listening on port ${PORT}`
    );
  });
}

start().catch((error) => {
  console.error(
    "DMOJ adapter failed to start:",
    error instanceof Error
      ? error.message
      : String(error)
  );

  process.exit(1);
});
