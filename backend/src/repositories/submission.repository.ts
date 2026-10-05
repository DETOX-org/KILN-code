import {
    and,
    desc,
    eq,
    or,
    count,
} from "drizzle-orm";

import { db } from "../db/index.js";

import {
    submissions,
    submissionResults,
    users,
    problems,
    challenges,
    testCases,
    participantSessions,
    integrityEvents,
    codeSnapshots,
} from "../db/schema.js";

import type {
    Submission,
    JudgeStatus,
} from "../types/domain.js";

// ============================================================================
// DATABASE STATUS TYPES
// ============================================================================

type DbSubmissionStatus =
    | "queued"
    | "running"
    | "accepted"
    | "wrong_answer"
    | "compilation_error"
    | "runtime_error"
    | "time_limit_exceeded"
    | "memory_limit_exceeded"
    | "system_error";

type DbResultVerdict =
    | "accepted"
    | "wrong_answer"
    | "compilation_error"
    | "runtime_error"
    | "time_limit_exceeded"
    | "memory_limit_exceeded"
    | "system_error";

// ============================================================================
// LANGUAGE MAPS
// ============================================================================

const LANGUAGE_NAMES: Record<string, string> = {
    python: "Python",
    cpp: "C++",
    "c++": "C++",
    c: "C",
    java: "Java",
    javascript: "JavaScript",
    typescript: "TypeScript",
    rust: "Rust",
    go: "Go",
};

const LANGUAGE_IDS: Record<string, number> = {
    python: 1,
    cpp: 2,
    "c++": 2,
    c: 3,
    java: 4,
    javascript: 5,
    typescript: 6,
    rust: 7,
    go: 8,
};

// ============================================================================
// HELPERS
// ============================================================================

function isUuid(value: string): boolean {
    // PostgreSQL accepts UUIDs whose version/variant bits are not limited
    // to the RFC 4122 v1-v5 forms. The seeded KILN records use UUID-shaped
    // values with a zero version field, so validate UUID shape only.
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value,
    );
}

function normalizeLanguage(language: string): string {
    return language
        .trim()
        .toLowerCase();
}

function languageName(language: string): string {
    const normalized =
        normalizeLanguage(language);

    return (
        LANGUAGE_NAMES[normalized] ??
        language
    );
}

function languageId(language: string): number {
    const normalized =
        normalizeLanguage(language);

    return (
        LANGUAGE_IDS[normalized] ??
        0
    );
}

function mapVerificationEngineToDomain(
    engine: string | null | undefined,
): Submission["verification_engine"] {
    if (!engine) {
        return null;
    }

    switch (engine.trim().toLowerCase()) {
        case "judge0":
            return "judge0";

        case "piston":
            return "piston";

        case "isolated_worker":
            return "isolated_worker";

        default:
            return null;
    }
}

// ============================================================================
// EVALUATION STATUS -> DATABASE STATUS
// ============================================================================

function mapEvaluationStatusToDb(
    status: string,
): DbSubmissionStatus {
    switch (
    status
        .trim()
        .toLowerCase()
    ) {
        case "queued":
        case "pending":
            return "queued";

        case "running":
        case "judging":
            return "running";

        case "accepted":
            return "accepted";

        case "wrong answer":
        case "wrong_answer":
            return "wrong_answer";

        case "compilation error":
        case "compilation_error":
            return "compilation_error";

        case "runtime error":
        case "runtime_error":
            return "runtime_error";

        case "time limit exceeded":
        case "time_limit_exceeded":
            return "time_limit_exceeded";

        case "memory limit exceeded":
        case "memory_limit_exceeded":
            return "memory_limit_exceeded";

        case "system error":
        case "system_error":
        case "judge error":
        case "judge_error":
            return "system_error";

        default:
            return "system_error";
    }
}

// ============================================================================
// DATABASE STATUS -> DOMAIN STATUS
// ============================================================================

function mapDbStatusToDomain(
    status: string,
): JudgeStatus {
    switch (status) {
        case "queued":
            return "pending";

        case "running":
            return "judging";

        case "accepted":
            return "accepted";

        case "wrong_answer":
            return "wrong_answer";

        case "compilation_error":
            return "compilation_error";

        case "runtime_error":
            return "runtime_error";

        case "time_limit_exceeded":
            return "time_limit_exceeded";

        case "memory_limit_exceeded":
            return "memory_limit_exceeded";

        case "system_error":
        default:
            return "judge_error";
    }
}

// ============================================================================
// RESULT VERDICT -> DATABASE VERDICT
// ============================================================================

function mapResultVerdictToDb(
    verdict: string,
    passed?: boolean,
): DbResultVerdict {
    if (passed === true) {
        return "accepted";
    }

    switch (
    verdict
        .trim()
        .toLowerCase()
    ) {
        case "accepted":
            return "accepted";

        case "wrong answer":
        case "wrong_answer":
            return "wrong_answer";

        case "compilation error":
        case "compilation_error":
            return "compilation_error";

        case "runtime error":
        case "runtime_error":
            return "runtime_error";

        case "time limit exceeded":
        case "time_limit_exceeded":
            return "time_limit_exceeded";

        case "memory limit exceeded":
        case "memory_limit_exceeded":
            return "memory_limit_exceeded";

        case "system error":
        case "system_error":
            return "system_error";

        default:
            return "system_error";
    }
}

// ============================================================================
// DATABASE VERDICT -> DOMAIN STATUS
// ============================================================================

function mapResultVerdictToDomain(
    verdict: string,
): JudgeStatus {
    switch (verdict) {
        case "accepted":
            return "accepted";

        case "wrong_answer":
            return "wrong_answer";

        case "compilation_error":
            return "compilation_error";

        case "runtime_error":
            return "runtime_error";

        case "time_limit_exceeded":
            return "time_limit_exceeded";

        case "memory_limit_exceeded":
            return "memory_limit_exceeded";

        case "system_error":
        default:
            return "judge_error";
    }
}

// ============================================================================
// RESOLVE USER
// ============================================================================

async function resolveUser(
    userId: string | undefined,
    username: string | undefined,
): Promise<{
    id: string;
    username: string;
    displayName: string;
}> {
    // ------------------------------------------------------------
    // Resolve by UUID
    // ------------------------------------------------------------

    if (
        userId &&
        isUuid(userId)
    ) {
        const existing =
            await db
                .select({
                    id: users.id,
                    username: users.username,
                    displayName:
                        users.displayName,
                })
                .from(users)
                .where(
                    eq(
                        users.id,
                        userId,
                    ),
                )
                .limit(1);

        if (existing[0]) {
            return existing[0];
        }
    }

    // ------------------------------------------------------------
    // Resolve by username
    // ------------------------------------------------------------

    if (
        username &&
        username.trim()
    ) {
        const existing =
            await db
                .select({
                    id: users.id,
                    username: users.username,
                    displayName:
                        users.displayName,
                })
                .from(users)
                .where(
                    eq(
                        users.username,
                        username.trim(),
                    ),
                )
                .limit(1);

        if (existing[0]) {
            return existing[0];
        }
    }

    throw new Error(
        "A valid existing user is required for a submission. Join the challenge first.",
    );
}

// ============================================================================
// RESOLVE PROBLEM
// ============================================================================

async function resolveProblem(
    problemIdOrSlug: string,
) {
    const value =
        problemIdOrSlug.trim();

    if (!value) {
        return undefined;
    }

    // Try UUID first
    if (isUuid(value)) {
        const rows =
            await db
                .select()
                .from(problems)
                .where(
                    eq(
                        problems.id,
                        value,
                    ),
                )
                .limit(1);

        if (rows[0]) {
            return rows[0];
        }
    }

    // Then slug
    const rows =
        await db
            .select()
            .from(problems)
            .where(
                eq(
                    problems.slug,
                    value,
                ),
            )
            .limit(1);

    return rows[0];
}

// ============================================================================
// RESOLVE CHALLENGE
// ============================================================================

async function resolveChallenge(
    contestId?: string | null,
) {
    // Your submissions table requires challengeId.
    // Default to the existing persistent challenge.
    const requested =
        contestId &&
            contestId.trim()
            ? contestId.trim()
            : "KILN-1001";

    // UUID
    if (isUuid(requested)) {
        const rows =
            await db
                .select()
                .from(challenges)
                .where(
                    eq(
                        challenges.id,
                        requested,
                    ),
                )
                .limit(1);

        return rows[0];
    }

    // Challenge code
    const rows =
        await db
            .select()
            .from(challenges)
            .where(
                eq(
                    challenges.code,
                    requested.toUpperCase(),
                ),
            )
            .limit(1);

    return rows[0];
}

// ============================================================================
// ATTEMPT NUMBER
// ============================================================================

async function getAttemptNumber(
    userId: string,
    problemId: string,
    challengeId: string,
): Promise<number> {
    const rows =
        await db
            .select({
                count: count(),
            })
            .from(submissions)
            .where(
                and(
                    eq(
                        submissions.userId,
                        userId,
                    ),
                    eq(
                        submissions.problemId,
                        problemId,
                    ),
                    eq(
                        submissions.challengeId,
                        challengeId,
                    ),
                ),
            );

    return (
        Number(
            rows[0]?.count ?? 0,
        ) + 1
    );
}

// ============================================================================
// BUILD DOMAIN SUBMISSION
// ============================================================================

function buildDomainSubmission(
    row: {
        submission:
        typeof submissions.$inferSelect;

        username: string;

        displayName: string;

        problemTitle: string;

        problemSlug: string;

        challengeCode:
        string | null;
    },
    results:
        Array<
            typeof submissionResults.$inferSelect
        >,
): Submission {
    const submission =
        row.submission;

    const subtaskResults =
        results.map(
            (
                result,
                index,
            ) => {
                const resultStatus =
                    mapResultVerdictToDomain(
                        result.verdict,
                    );

                return {
                    subtask_id:
                        result.testCaseId,

                    order_index:
                        index + 1,

                    title:
                        `Test Case #${index + 1}`,

                    status:
                        resultStatus,

                    score:
                        resultStatus ===
                            "accepted"
                            ? 100
                            : 0,

                    max_score: 100,

                    runtime_ms:
                        result.executionTimeMs ??
                        undefined,

                    memory_kb:
                        result.memoryUsedKb ??
                        undefined,

                    details: {
                        tests_passed:
                            resultStatus ===
                                "accepted"
                                ? 1
                                : 0,

                        total_tests: 1,

                        failed_test:
                            resultStatus ===
                                "accepted"
                                ? undefined
                                : 1,

                        diagnostic:
                            result.stderr ||
                            undefined,
                    },
                };
            },
        );

    // IMPORTANT:
    // Your actual DB schema uses `status`.
    const domainStatus =
        mapDbStatusToDomain(
            submission.status,
        );

    return {
        id:
            submission.id,

        user_id:
            submission.userId,

        username:
            row.username,

        problem_id:
            submission.problemId,

        problem_title:
            row.problemTitle,

        contest_id:
            row.challengeCode,

        language_id:
            languageId(
                submission.language,
            ),

        language_name:
            languageName(
                submission.language,
            ),

        source_code:
            submission.sourceCode,

        status:
            domainStatus,

        runtime_ms:
            submission.executionTimeMs ??
            undefined,

        memory_kb:
            submission.memoryUsedKb ??
            undefined,

        score:
            submission.score ??
            0,

        grading_type:
            "standard_diff",

        execution_engine:
            "isolated_worker",

        verification_engine:
            mapVerificationEngineToDomain(
                submission.verificationEngine,
            ),

        discrepancy_flag:
            submission.discrepancyFlag,

        is_verified:
            !submission.discrepancyFlag &&
            (
                submission.verifiedAt !== null ||
                domainStatus === "accepted"
            ),

        discrepancy_details:
            (
                submission.discrepancyDetails ??
                null
            ) as Submission[
            "discrepancy_details"
            ],

        verification_notes:
            submission.verificationNotes ??
            null,

        verified_at:
            submission.verifiedAt
                ? submission.verifiedAt.toISOString()
                : null,

        submitted_at:
            submission.submittedAt.toISOString(),

        subtask_results:
            subtaskResults,
    };
}
// ============================================================================
// LOAD SINGLE SUBMISSION
// ============================================================================

async function loadSubmission(
    submissionId: string,
): Promise<
    Submission | undefined
> {
    if (
        !isUuid(
            submissionId,
        )
    ) {
        return undefined;
    }

    const rows =
        await db
            .select({
                submission:
                    submissions,

                username:
                    users.username,

                displayName:
                    users.displayName,

                problemTitle:
                    problems.title,

                problemSlug:
                    problems.slug,

                challengeCode:
                    challenges.code,
            })
            .from(submissions)
            .innerJoin(
                users,
                eq(
                    submissions.userId,
                    users.id,
                ),
            )
            .innerJoin(
                problems,
                eq(
                    submissions.problemId,
                    problems.id,
                ),
            )
            .leftJoin(
                challenges,
                eq(
                    submissions.challengeId,
                    challenges.id,
                ),
            )
            .where(
                eq(
                    submissions.id,
                    submissionId,
                ),
            )
            .limit(1);

    const row =
        rows[0];

    if (!row) {
        return undefined;
    }

    const results =
        await db
            .select()
            .from(
                submissionResults,
            )
            .where(
                eq(
                    submissionResults.submissionId,
                    submissionId,
                ),
            );

    return buildDomainSubmission(
        row,
        results,
    );
}

// ============================================================================
// CREATE SUBMISSION
// ============================================================================

export async function createSubmission(
    input: {
        userId?: string;

        username?: string;

        problemIdOrSlug: string;

        language: string;

        sourceCode: string;

        contestId?: string | null;

        status: string;

        score: number;

        runtimeMs: number;

        memoryKb: number;

        results: Array<{
            id: string;

            verdict: string;

            runtimeMs: number;

            memoryKb: number;

            stdout?: string;

            stderr?: string;

            passed?: boolean;
        }>;
    },
): Promise<Submission> {
    // ------------------------------------------------------------
    // Resolve user
    // ------------------------------------------------------------

    const user =
        await resolveUser(
            input.userId,
            input.username,
        );

    // ------------------------------------------------------------
    // Resolve problem
    // ------------------------------------------------------------

    const problem =
        await resolveProblem(
            input.problemIdOrSlug,
        );

    if (!problem) {
        throw new Error(
            `Problem '${input.problemIdOrSlug}' not found.`,
        );
    }

    // ------------------------------------------------------------
    // Resolve challenge
    // ------------------------------------------------------------

    const challenge =
        await resolveChallenge(
            input.contestId,
        );

    if (!challenge) {
        throw new Error(
            `Challenge '${input.contestId ?? "KILN-1001"}' not found.`,
        );
    }

    // ------------------------------------------------------------
    // Status
    // ------------------------------------------------------------

    const dbStatus =
        mapEvaluationStatusToDb(
            input.status,
        );;

    // ------------------------------------------------------------
    // Attempt number
    // ------------------------------------------------------------

    const attemptNumber =
        await getAttemptNumber(
            user.id,
            problem.id,
            challenge.id,
        );

    const submittedAt =
        new Date();

    const judgedAt =
        new Date();

    // ------------------------------------------------------------
    // ATOMIC DATABASE WRITE
    // ------------------------------------------------------------

    const inserted =
        await db.transaction(
            async (tx) => {
                // ------------------------------------------------
                // Insert submission
                // ------------------------------------------------

                const rows =
                    await tx
                        .insert(
                            submissions,
                        )
                        .values([
                            {
                                challengeId:
                                    challenge.id,

                                userId:
                                    user.id,

                                problemId:
                                    problem.id,

                                language:
                                    normalizeLanguage(
                                        input.language,
                                    ),

                                sourceCode:
                                    input.sourceCode,

                                // IMPORTANT:
                                // Actual schema field is `status`.
                                status:
                                    dbStatus,

                                score:
                                    Math.max(
                                        0,
                                        Math.round(
                                            input.score,
                                        ),
                                    ),

                                executionTimeMs:
                                    Math.max(
                                        0,
                                        Math.round(
                                            input.runtimeMs,
                                        ),
                                    ),

                                memoryUsedKb:
                                    Math.max(
                                        0,
                                        Math.round(
                                            input.memoryKb,
                                        ),
                                    ),

                                attemptNumber,

                                submittedAt,

                                judgedAt,
                            },
                        ])
                        .returning();

                const submission =
                    rows[0];

                if (!submission) {
                    throw new Error(
                        "Failed to create submission record.",
                    );
                }

                // ------------------------------------------------
                // Insert test-case results
                // ------------------------------------------------

                const validResults =
                    input.results.filter(
                        (result) =>
                            isUuid(
                                result.id,
                            ),
                    );

                if (
                    validResults.length >
                    0
                ) {
                    await tx
                        .insert(
                            submissionResults,
                        )
                        .values(
                            validResults.map(
                                (
                                    result,
                                ) => ({
                                    submissionId:
                                        submission.id,

                                    testCaseId:
                                        result.id,

                                    verdict:
                                        mapResultVerdictToDb(
                                            result.verdict,
                                            result.passed,
                                        ),

                                    executionTimeMs:
                                        Math.max(
                                            0,
                                            Math.round(
                                                result.runtimeMs ??
                                                0,
                                            ),
                                        ),

                                    memoryUsedKb:
                                        Math.max(
                                            0,
                                            Math.round(
                                                result.memoryKb ??
                                                0,
                                            ),
                                        ),

                                    stdout:
                                        result.stdout ??
                                        "",

                                    stderr:
                                        result.stderr ??
                                        "",
                                }),
                            ),
                        )
                        .onConflictDoNothing();
                }

                return submission;
            },
        );

    // ------------------------------------------------------------
    // Reload with joins/results
    // ------------------------------------------------------------

    const loaded =
        await loadSubmission(
            inserted.id,
        );

    if (!loaded) {
        throw new Error(
            "Submission was created but could not be loaded.",
        );
    }

    return loaded;
}

// ============================================================================
// LIST ALL SUBMISSIONS
// ============================================================================

export async function findAllSubmissions(): Promise<
    Submission[]
> {
    const rows =
        await db
            .select({
                submission:
                    submissions,

                username:
                    users.username,

                displayName:
                    users.displayName,

                problemTitle:
                    problems.title,

                problemSlug:
                    problems.slug,

                challengeCode:
                    challenges.code,
            })
            .from(submissions)
            .innerJoin(
                users,
                eq(
                    submissions.userId,
                    users.id,
                ),
            )
            .innerJoin(
                problems,
                eq(
                    submissions.problemId,
                    problems.id,
                ),
            )
            .leftJoin(
                challenges,
                eq(
                    submissions.challengeId,
                    challenges.id,
                ),
            )
            .orderBy(
                desc(
                    submissions.submittedAt,
                ),
            );

    const result =
        await Promise.all(
            rows.map(
                async (
                    row,
                ) => {
                    const testResults =
                        await db
                            .select()
                            .from(
                                submissionResults,
                            )
                            .where(
                                eq(
                                    submissionResults.submissionId,
                                    row.submission.id,
                                ),
                            );

                    return buildDomainSubmission(
                        row,
                        testResults,
                    );
                },
            ),
        );

    return result;
}

// ============================================================================
// GET ONE SUBMISSION
// ============================================================================

// ============================================================================
// FINALIZE QUEUED SUBMISSION
// ============================================================================

export async function finalizeSubmission(
    submissionId: string,
    input: {
        status: string;
        score: number;
        runtimeMs: number;
        memoryKb: number;
        results: Array<{
            id: string;
            verdict: string;
            runtimeMs?: number;
            memoryKb?: number;
            stdout?: string;
            stderr?: string;
        }>;
    },
): Promise<Submission> {
    if (!isUuid(submissionId)) {
        throw new Error(
            "Invalid submission ID.",
        );
    }

    const dbStatus =
        mapEvaluationStatusToDb(
            input.status,
        );

    await db.transaction(
        async (tx) => {
            await tx
                .update(submissions)
                .set({
                    status: dbStatus,
                    score: Math.max(
                        0,
                        Math.round(
                            input.score,
                        ),
                    ),
                    executionTimeMs:
                        Math.max(
                            0,
                            Math.round(
                                input.runtimeMs,
                            ),
                        ),
                    memoryUsedKb:
                        Math.max(
                            0,
                            Math.round(
                                input.memoryKb,
                            ),
                        ),
                    judgedAt:
                        new Date(),
                })
                .where(
                    eq(
                        submissions.id,
                        submissionId,
                    ),
                );

            const validResults =
                input.results.filter(
                    (result) =>
                        isUuid(result.id),
                );

            if (
                validResults.length > 0
            ) {
                await tx
                    .insert(
                        submissionResults,
                    )
                    .values(
                        validResults.map(
                            (result) => ({
                                submissionId,
                                testCaseId:
                                    result.id,
                                verdict:
                                    mapEvaluationStatusToDb(
                                        result.verdict,
                                    ),
                                executionTimeMs:
                                    Math.max(
                                        0,
                                        Math.round(
                                            result.runtimeMs ??
                                            0,
                                        ),
                                    ),
                                memoryUsedKb:
                                    Math.max(
                                        0,
                                        Math.round(
                                            result.memoryKb ??
                                            0,
                                        ),
                                    ),
                                stdout:
                                    result.stdout ??
                                    "",
                                stderr:
                                    result.stderr ??
                                    "",
                            }),
                        ),
                    )
                    .onConflictDoUpdate({
                        target: [
                            submissionResults.submissionId,
                            submissionResults.testCaseId,
                        ],
                        set: {
                            verdict:
                                mapEvaluationStatusToDb(
                                    "judge_error",
                                ),
                        },
                    });
            }
        },
    );

    const finalized =
        await loadSubmission(
            submissionId,
        );

    if (!finalized) {
        throw new Error(
            "Submission was finalized but could not be loaded.",
        );
    }

    return finalized;
}

// ============================================================================
// FINAL PARTICIPANT SUBMISSION - ATOMIC DATABASE TRANSACTION
// ============================================================================

export async function persistFinalParticipantSubmission(
    input: {
        sessionCode: string;
        userId: string;
        problemId: string;
        language: string;
        sourceCode: string;
        status: string;
        score: number;
        runtimeMs: number;
        memoryKb: number;
        strikes: number;
        telemetryEvents?: Array<{
            eventType: string;
            details?: Record<string, unknown> | null;
        }>;
        results?: Array<{
            testCaseId: string;
            verdict: string;
            runtimeMs?: number;
            memoryKb?: number;
            stdout?: string;
            stderr?: string;
            passed?: boolean;
        }>;
        terminationReason?: string | null;
        isDisqualified?: boolean;
    },
): Promise<{
    submission: Submission;
    participantSessionStatus: string;
}> {
    const user =
        await resolveUser(
            input.userId,
            undefined,
        );

    const sessionCode =
        input.sessionCode
            .trim()
            .toUpperCase();

    const problem =
        await resolveProblem(
            input.problemId,
        );

    if (!problem) {
        throw new Error(
            `Problem '${input.problemId}' not found.`,
        );
    }

    const challengeRows =
        await db
            .select()
            .from(challenges)
            .where(
                eq(
                    challenges.code,
                    sessionCode,
                ),
            )
            .limit(1);

    const challenge =
        challengeRows[0];

    if (!challenge) {
        throw new Error(
            `Challenge '${sessionCode}' not found.`,
        );
    }

    const result =
        await db.transaction(
            async (tx) => {
                // ------------------------------------------------------------
                // 1. Verify the participant session
                // ------------------------------------------------------------
                const participantRows =
                    await tx
                        .select()
                        .from(
                            participantSessions,
                        )
                        .where(
                            and(
                                eq(
                                    participantSessions.challengeId,
                                    challenge.id,
                                ),
                                eq(
                                    participantSessions.userId,
                                    user.id,
                                ),
                            ),
                        )
                        .limit(1);

                const participantSession =
                    participantRows[0];

                if (!participantSession) {
                    throw new Error(
                        "Participant has not joined this challenge session.",
                    );
                }

                if (
                    participantSession.status ===
                    "submitted" ||
                    participantSession.status ===
                    "terminated" ||
                    participantSession.status ===
                    "disqualified"
                ) {
                    throw new Error(
                        `Participant session is already ${participantSession.status}.`,
                    );
                }

                // ------------------------------------------------------------
                // 2. Calculate the final attempt number inside the transaction
                // ------------------------------------------------------------
                const attemptRows =
                    await tx
                        .select({
                            count: count(),
                        })
                        .from(
                            submissions,
                        )
                        .where(
                            and(
                                eq(
                                    submissions.userId,
                                    user.id,
                                ),
                                eq(
                                    submissions.problemId,
                                    problem.id,
                                ),
                                eq(
                                    submissions.challengeId,
                                    challenge.id,
                                ),
                            ),
                        );

                const attemptNumber =
                    Number(
                        attemptRows[0]?.count ?? 0,
                    ) + 1;

                // ------------------------------------------------------------
                // 3. Insert final submission
                // ------------------------------------------------------------
                const insertedRows =
                    await tx
                        .insert(
                            submissions,
                        )
                        .values({
                            challengeId:
                                challenge.id,
                            userId:
                                user.id,
                            problemId:
                                problem.id,
                            language:
                                normalizeLanguage(
                                    input.language,
                                ),
                            sourceCode:
                                input.sourceCode,
                            status:
                                mapEvaluationStatusToDb(
                                    input.status,
                                ),
                            score:
                                Math.max(
                                    0,
                                    Math.round(
                                        input.score,
                                    ),
                                ),
                            executionTimeMs:
                                Math.max(
                                    0,
                                    Math.round(
                                        input.runtimeMs,
                                    ),
                                ),
                            memoryUsedKb:
                                Math.max(
                                    0,
                                    Math.round(
                                        input.memoryKb,
                                    ),
                                ),
                            attemptNumber,
                            submittedAt:
                                new Date(),
                            judgedAt:
                                new Date(),
                        })
                        .returning();

                const submission =
                    insertedRows[0];

                if (!submission) {
                    throw new Error(
                        "Failed to persist final submission.",
                    );
                }

                // ------------------------------------------------------------
                // 4. Persist individual test-case results
                // ------------------------------------------------------------
                const validResults =
                    (input.results ?? [])
                        .filter(
                            (item) =>
                                isUuid(item.testCaseId),
                        );

                if (
                    validResults.length > 0
                ) {
                    await tx
                        .insert(
                            submissionResults,
                        )
                        .values(
                            validResults.map(
                                (item) => ({
                                    submissionId:
                                        submission.id,
                                    testCaseId:
                                        item.testCaseId,
                                    verdict:
                                        mapResultVerdictToDb(
                                            item.verdict,
                                            item.passed,
                                        ),
                                    executionTimeMs:
                                        Math.max(
                                            0,
                                            Math.round(
                                                item.runtimeMs ??
                                                0,
                                            ),
                                        ),
                                    memoryUsedKb:
                                        Math.max(
                                            0,
                                            Math.round(
                                                item.memoryKb ??
                                                0,
                                            ),
                                        ),
                                    stdout:
                                        item.stdout ??
                                        "",
                                    stderr:
                                        item.stderr ??
                                        "",
                                }),
                            ),
                        )
                        .onConflictDoNothing();
                }

                // ------------------------------------------------------------
                // 5. Persist integrity / anti-cheat events
                // ------------------------------------------------------------
                const integrityEventTypes = [
                    "FULLSCREEN_ENTER",
                    "FULLSCREEN_EXIT",
                    "WINDOW_BLUR",
                    "TAB_SWITCH",
                    "DEVTOOLS_OPEN_ATTEMPT",
                    "EXTERNAL_PASTE_BLOCKED",
                    "INTERNAL_PASTE_ALLOWED",
                    "BURST_TYPING_FLAGGED",
                    "ESCAPE_KEY_PRESSED",
                ] as const;

                type IntegrityEventType =
                    (typeof integrityEventTypes)[number];

                const isIntegrityEventType =
                    (value: string): value is IntegrityEventType =>
                        integrityEventTypes.includes(
                            value as IntegrityEventType,
                        );

                const validIntegrityEvents =
                    (input.telemetryEvents ?? [])
                        .map((event) => {
                            const eventType =
                                event.eventType
                                    .trim()
                                    .toUpperCase();

                            if (!isIntegrityEventType(eventType)) {
                                return null;
                            }

                            return {
                                eventType,
                                details:
                                    event.details ?? null,
                            };
                        })
                        .filter(
                            (event): event is {
                                eventType: IntegrityEventType;
                                details: Record<string, unknown> | null;
                            } => event !== null,
                        );

                if (
                    validIntegrityEvents.length > 0
                ) {
                    await tx
                        .insert(
                            integrityEvents,
                        )
                        .values(
                            validIntegrityEvents.map(
                                (event) => ({
                                    challengeId:
                                        challenge.id,
                                    userId:
                                        user.id,
                                    eventType:
                                        event.eventType,
                                    details:
                                        event.details,
                                }),
                            ),
                        );
                }

                // ------------------------------------------------------------
                // 6. Persist the final code snapshot
                // ------------------------------------------------------------
                if (
                    input.sourceCode
                        .trim()
                        .length > 0
                ) {
                    await tx
                        .insert(
                            codeSnapshots,
                        )
                        .values({
                            challengeId:
                                challenge.id,
                            userId:
                                user.id,
                            problemId:
                                problem.id,
                            code:
                                input.sourceCode,
                            language:
                                normalizeLanguage(
                                    input.language,
                                ),
                            capturedAt:
                                new Date(),
                        });
                }

                // ------------------------------------------------------------
                // 7. Finalize participant session
                // ------------------------------------------------------------
                const finalSessionStatus =
                    input.isDisqualified
                        ? "disqualified"
                        : "submitted";

                await tx
                    .update(
                        participantSessions,
                    )
                    .set({
                        status:
                            finalSessionStatus,
                        strikes:
                            Math.max(
                                0,
                                Math.round(
                                    input.strikes,
                                ),
                            ),
                        lastActiveAt:
                            new Date(),
                        terminatedAt:
                            input.isDisqualified
                                ? new Date()
                                : null,
                        terminationReason:
                            input.terminationReason ??
                            null,
                    })
                    .where(
                        and(
                            eq(
                                participantSessions.challengeId,
                                challenge.id,
                            ),
                            eq(
                                participantSessions.userId,
                                user.id,
                            ),
                        ),
                    );

                return {
                    submissionId:
                        submission.id,
                    participantSessionStatus:
                        finalSessionStatus,
                };
            },
        );

    // ------------------------------------------------------------
    // 8. Reload through the existing repository mapping
    // ------------------------------------------------------------
    const loadedSubmission =
        await loadSubmission(
            result.submissionId,
        );

    if (!loadedSubmission) {
        throw new Error(
            "Final submission was persisted but could not be reloaded.",
        );
    }

    return {
        submission:
            loadedSubmission,
        participantSessionStatus:
            result.participantSessionStatus,
    };
}

export async function findSubmissionById(
    submissionId: string,
): Promise<Submission | undefined> {
    return loadSubmission(
        submissionId,
    );
}