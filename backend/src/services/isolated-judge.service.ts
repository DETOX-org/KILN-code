import Redis from "ioredis";

export interface IsolatedJudgeTestCase {
    input: string;
    expectedOutput: string;
    visibility: "public" | "hidden";
}

export interface IsolatedJudgeRequest {
    language: string;
    code: string;
    tests: IsolatedJudgeTestCase[];
    attempt?: number;
}

export interface IsolatedJudgeResult {
    jobId: string;
    status: string;
    score?: number;
    runtimeMs?: number;
    memoryKb?: number;
    results?: Array<{
        id?: string;
        status?: string;
        passed?: boolean;
        runtimeMs?: number;
        memoryKb?: number;
        stdout?: string;
        actualOutput?: string;
        stderr?: string;
        error?: string;
    }>;
    error?: string;
}

const JUDGE_QUEUE_KEY = "judge:queue";

const redis = new Redis(
    process.env.REDIS_URL ??
    "redis://redis:6379",
);

function sleep(
    milliseconds: number,
): Promise<void> {
    return new Promise((resolve) =>
        setTimeout(
            resolve,
            milliseconds,
        ),
    );
}

function createJobId(): string {
    return [
        "session",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 10),
    ].join("-");
}

async function waitForJudgeResult(
    jobId: string,
    timeoutMs = 60_000,
): Promise<IsolatedJudgeResult> {
    const resultKey =
        `judge:result:${jobId}`;

    const startedAt =
        Date.now();

    while (
        Date.now() - startedAt <
        timeoutMs
    ) {
        const payload =
            await redis.get(
                resultKey,
            );

        if (payload) {
            return JSON.parse(
                payload,
            ) as IsolatedJudgeResult;
        }

        await sleep(250);
    }

    throw new Error(
        "Judge timed out while waiting for the isolated execution result.",
    );
}

export async function executeIsolatedJudge(
    request: IsolatedJudgeRequest,
): Promise<IsolatedJudgeResult> {
    if (
        !request.language ||
        typeof request.language !==
        "string"
    ) {
        throw new Error(
            "Judge language is required.",
        );
    }

    if (
        typeof request.code !==
        "string"
    ) {
        throw new Error(
            "Judge source code must be a string.",
        );
    }

    if (
        !Array.isArray(
            request.tests,
        ) ||
        request.tests.length === 0
    ) {
        throw new Error(
            "At least one test case is required.",
        );
    }

    const jobId =
        createJobId();

    const judgeJob = {
        jobId,

        language:
            request.language
                .trim()
                .toLowerCase(),

        code:
            request.code,

        tests:
            request.tests.map(
                (test) => ({
                    input:
                        test.input ?? "",

                    expectedOutput:
                        test.expectedOutput ??
                        "",

                    visibility:
                        test.visibility,
                }),
            ),

        attempt:
            request.attempt ?? 1,
    };

    await redis.rpush(
        JUDGE_QUEUE_KEY,
        JSON.stringify(
            judgeJob,
        ),
    );

    return waitForJudgeResult(
        jobId,
    );
}