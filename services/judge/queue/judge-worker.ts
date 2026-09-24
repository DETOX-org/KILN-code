import Redis from "ioredis";
import {
  dequeueJudgeJob,
  enqueueJudgeJob,
  acknowledgeJudgeJob,
  recoverProcessingJobs
} from "./redis-queue.js";
import { createJudgeEngine } from "../engines/index.js";

const judgeEngine = createJudgeEngine();

const redisUrl =
  process.env.REDIS_URL ?? "redis://redis:6379";

const redis = new Redis(redisUrl);

const MAX_ATTEMPTS = 3;
const PROCESSING_TTL_SECONDS = 300;
const RESULT_TTL_SECONDS = 3600;

const MAX_CODE_SIZE = 256 * 1024;
const MAX_INPUT_SIZE = 256 * 1024;
const MAX_EXPECTED_OUTPUT_SIZE = 256 * 1024;
const MAX_TEST_CASES = 100;

const SUPPORTED_LANGUAGES = new Set([
  "python",
  "c",
  "cpp",
  "java",
  "javascript",
  "typescript",
  "go",
  "rust",
  "csharp",
  "kotlin",
  "sql"
]);

function byteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}

function validateJob(job: {
  language: string;
  code: string;
  tests: {
    input: string;
    expectedOutput: string;
    visibility?: "public" | "hidden";
  }[];
}): string | null {
  if (!SUPPORTED_LANGUAGES.has(job.language)) {
    return "Unsupported language";
  }

  if (typeof job.code !== "string") {
    return "Code must be a string";
  }

  if (byteLength(job.code) > MAX_CODE_SIZE) {
    return "Code exceeds the maximum allowed size";
  }

  if (!Array.isArray(job.tests) || job.tests.length === 0) {
    return "At least one test case is required";
  }

  if (job.tests.length > MAX_TEST_CASES) {
    return `Maximum of ${MAX_TEST_CASES} test cases allowed`;
  }

  for (const test of job.tests) {
    if (
      typeof test.input !== "string" ||
      typeof test.expectedOutput !== "string"
    ) {
      return "Test input and expected output must be strings";
    }

    if (byteLength(test.input) > MAX_INPUT_SIZE) {
      return "Test input exceeds the maximum allowed size";
    }

    if (
      byteLength(test.expectedOutput) >
      MAX_EXPECTED_OUTPUT_SIZE
    ) {
      return "Expected output exceeds the maximum allowed size";
    }

    if (
      test.visibility !== undefined &&
      test.visibility !== "public" &&
      test.visibility !== "hidden"
    ) {
      return "Invalid test visibility";
    }
  }

  return null;
}

async function startWorker(): Promise<void> {
  console.log("Judge worker started");

  await recoverProcessingJobs();

  while (true) {
    let jobId: string | null = null;
    let processingKey: string | null = null;

    try {
      const job = await dequeueJudgeJob();

      jobId = job.jobId;

      const resultKey = `judge:result:${job.jobId}`;
      processingKey = `judge:processing:${job.jobId}`;

      const existingResult = await redis.exists(resultKey);

      if (existingResult) {
        console.log(
          `Skipping duplicate judge job: ${job.jobId}`
        );

        await acknowledgeJudgeJob(job.jobId);

        continue;
      }

      const lockAcquired = await redis.set(
        processingKey,
        "1",
        "EX",
        PROCESSING_TTL_SECONDS,
        "NX"
      );

      if (lockAcquired !== "OK") {
        console.log(
          `Skipping duplicate judge job: ${job.jobId}`
        );

        await acknowledgeJudgeJob(job.jobId);

        continue;
      }

      try {
        const validationError = validateJob(job);

        if (validationError) {
          const invalidResult = {
            jobId: job.jobId,
            status: "Judge Error",
            results: [
              {
                status: "Judge Error",
                exitCode: null,
                stdout: "",
                stderr: validationError,
                visibility: "public"
              }
            ],
            attempt: job.attempt ?? 0
          };

          await redis.set(
            resultKey,
            JSON.stringify(invalidResult),
            "EX",
            RESULT_TTL_SECONDS
          );

          await acknowledgeJudgeJob(job.jobId);

          console.log(
            `Rejected invalid judge job: ${job.jobId}`
          );

          continue;
        }

        const attempt = job.attempt ?? 0;

        console.log(
          `Processing judge job: ${job.jobId} (attempt ${attempt + 1}/${MAX_ATTEMPTS})`
        );

        const results = [];

        for (const test of job.tests) {
          const engineJobId = await judgeEngine.submit({
            language: job.language,
            code: job.code,
            input: test.input
          });

          const result =
            await judgeEngine.pollStatus(engineJobId);

          const visibility =
            test.visibility ?? "public";

          if (result.status === "Judge Error") {
            results.push({
              ...result,
              expectedOutput:
                visibility === "public"
                  ? test.expectedOutput
                  : undefined,
              visibility
            });

            break;
          }

          if (result.status !== "Accepted") {
            results.push({
              ...result,
              expectedOutput:
                visibility === "public"
                  ? test.expectedOutput
                  : undefined,
              visibility
            });

            break;
          }

          const actualOutput = result.stdout
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .trimEnd();

          const expectedOutput = test.expectedOutput
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .trimEnd();

          if (actualOutput !== expectedOutput) {
            results.push({
              ...result,
              status: "Wrong Answer" as const,
              expectedOutput:
                visibility === "public"
                  ? test.expectedOutput
                  : undefined,
              visibility
            });

            break;
          }

          results.push({
            ...result,
            expectedOutput:
              visibility === "public"
                ? test.expectedOutput
                : undefined,
            visibility
          });
        }

        const finalStatus =
          results.length === job.tests.length &&
          results.every(
            (result) => result.status === "Accepted"
          )
            ? "Accepted"
            : results[results.length - 1]?.status ??
              "Judge Error";

        if (
          finalStatus === "Judge Error" &&
          attempt + 1 < MAX_ATTEMPTS
        ) {
          await acknowledgeJudgeJob(job.jobId);

          await enqueueJudgeJob({
            ...job,
            attempt: attempt + 1
          });

          console.log(
            `Retrying judge job ${job.jobId} (${attempt + 2}/${MAX_ATTEMPTS})`
          );

          continue;
        }

        const finalResult = {
          jobId: job.jobId,
          status: finalStatus,
          results,
          attempt: attempt + 1
        };

        await redis.set(
          resultKey,
          JSON.stringify(finalResult),
          "EX",
          RESULT_TTL_SECONDS
        );

        await acknowledgeJudgeJob(job.jobId);

        console.log(
          `Judge job ${job.jobId} completed with ${results.length} result(s)`
        );
      } finally {
        await redis.del(processingKey);
      }
    } catch (error) {
      console.error(
        `Judge job ${jobId ?? "unknown"} failed:`,
        error instanceof Error
          ? error.message
          : String(error)
      );
    }
  }
}

startWorker().catch((error) => {
  console.error(
    "Judge worker failed:",
    error instanceof Error
      ? error.message
      : String(error)
  );

  process.exit(1);
});