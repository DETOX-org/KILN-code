import http from "node:http";

import { DmojBridge } from "./dmoj-bridge.js";
import { mapDmojSubmissionResult } from "./dmoj-result.js";

const PORT = Number(
  process.env.DMOJ_ADAPTER_PORT ?? 3002
);

const bridge = new DmojBridge();

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
        problemId: string;
        language: string;
        source: string;
        timeLimit?: number;
        memoryLimit?: number;
        shortCircuit?: boolean;
        meta?: Record<string, unknown>;
      };

      const jobId = await bridge.submit({
        problemId: request.problemId,
        language: request.language,
        source: request.source,
        timeLimit: request.timeLimit,
        memoryLimit: request.memoryLimit,
        shortCircuit: request.shortCircuit,
        meta: request.meta
      });

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