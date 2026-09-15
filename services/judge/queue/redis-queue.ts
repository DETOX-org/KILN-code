import Redis from "ioredis";

export type JudgeJob = {
  jobId: string;
  language: string;
  code: string;
  tests: {
    input: string;
    expectedOutput: string;
    visibility?: "public" | "hidden";
  }[];
  attempt?: number;
};

const redisUrl =
  process.env.REDIS_URL ?? "redis://redis:6379";

const redis = new Redis(redisUrl);

const QUEUE_KEY = "judge:queue";
const PROCESSING_QUEUE_KEY = "judge:processing";

export async function enqueueJudgeJob(
  job: JudgeJob
): Promise<void> {
  const normalizedJob: JudgeJob = {
    ...job,
    attempt: job.attempt ?? 0
  };

  await redis.rpush(
    QUEUE_KEY,
    JSON.stringify(normalizedJob)
  );
}

export async function dequeueJudgeJob(): Promise<JudgeJob> {
  const result = await redis.brpoplpush(
    QUEUE_KEY,
    PROCESSING_QUEUE_KEY,
    0
  );

  if (!result) {
    throw new Error("Redis queue returned no job");
  }

  return JSON.parse(result) as JudgeJob;
}

export async function acknowledgeJudgeJob(
  jobId: string
): Promise<void> {
  const jobs = await redis.lrange(
    PROCESSING_QUEUE_KEY,
    0,
    -1
  );

  for (const payload of jobs) {
    const job = JSON.parse(payload) as JudgeJob;

    if (job.jobId === jobId) {
      await redis.lrem(
        PROCESSING_QUEUE_KEY,
        1,
        payload
      );

      return;
    }
  }
}

export async function recoverProcessingJobs(): Promise<void> {
  while (true) {
    const payload = await redis.rpop(
      PROCESSING_QUEUE_KEY
    );

    if (!payload) {
      break;
    }

    await redis.lpush(
      QUEUE_KEY,
      payload
    );
  }
}

export async function closeQueue(): Promise<void> {
  await redis.quit();
}