import { and, count, desc, eq, or } from "drizzle-orm";
import { db } from "../db/index.js";
import {
    challenges,
    challengeParticipants,
    challengeProblems,
    participantSessions,
    problems,
    testCases,
    users,
} from "../db/schema.js";

import type {
    ChallengeSession,
    SessionRules,
} from "../stores/session.store.js";
import type { TestCaseInput } from "../services/compiler.service.js";

const SYSTEM_ADMIN_ID =
    "00000000-0000-0000-0000-000000000001";

const DEFAULT_RULES: SessionRules = {
    fullscreenEnforced: true,
    maxStrikes: 3,
    blockExternalPaste: true,
    autoSaveIntervalSec: 10,
};

function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function generateRandomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 4; i++) {
        code += chars.charAt(
            Math.floor(Math.random() * chars.length),
        );
    }

    return `KILN-${code}`;
}

async function generateUniqueSessionCode(): Promise<string> {
    for (let attempt = 0; attempt < 20; attempt++) {
        const code = generateRandomCode();

        const existing = await db
            .select({ id: challenges.id })
            .from(challenges)
            .where(eq(challenges.code, code))
            .limit(1);

        if (existing.length === 0) {
            return code;
        }
    }

    throw new Error(
        "Unable to generate a unique KILN session code",
    );
}

async function resolveCreatedBy(
    createdBy?: string,
): Promise<string> {
    if (
        !createdBy ||
        [
            "ADMIN",
            "ADMIN_CORE",
            "ADMIN_ORGANIZER",
            "system",
            "admin-user",
        ].includes(createdBy)
    ) {
        return SYSTEM_ADMIN_ID;
    }

    const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (uuidPattern.test(createdBy)) {
        const existingUser = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, createdBy))
            .limit(1);

        return existingUser[0]?.id ?? SYSTEM_ADMIN_ID;
    }

    const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, createdBy))
        .limit(1);

    return existingUser[0]?.id ?? SYSTEM_ADMIN_ID;
}

function mapChallengeStatus(
    status: string,
): ChallengeSession["status"] {
    switch (status) {
        case "archived":
            return "archived";

        case "live":
            return "live";

        case "submission_closed":
        case "evaluation_complete":
        case "results_published":
        case "ended":
        case "pending_finalization":
        case "finalized":
            return "closed";

        case "draft":
        case "scheduled":
        case "registration_open":
        default:
            return "scheduled";
    }
}

async function buildChallengeSession(
    challengeId: string,
): Promise<ChallengeSession | undefined> {
    const challengeRows = await db
        .select()
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

    const challenge = challengeRows[0];

    if (!challenge) {
        return undefined;
    }

    const challengeProblemRows = await db
        .select()
        .from(challengeProblems)
        .where(eq(challengeProblems.challengeId, challenge.id))
        .orderBy(challengeProblems.orderIndex)
        .limit(1);

    const challengeProblem = challengeProblemRows[0];

    if (!challengeProblem) {
        return undefined;
    }

    const problemRows = await db
        .select()
        .from(problems)
        .where(eq(problems.id, challengeProblem.problemId))
        .limit(1);

    const problem = problemRows[0];

    if (!problem) {
        return undefined;
    }

    const testCaseRows = await db
        .select({
            id: testCases.id,
            input: testCases.input,
            expectedOutput: testCases.expectedOutput,
            isSample: testCases.isSample,
            points: testCases.points,
            orderIndex: testCases.orderIndex,
        })
        .from(testCases)
        .where(eq(testCases.problemId, problem.id))
        .orderBy(testCases.orderIndex);

    const participantCountRows = await db
        .select({
            count: count(),
        })
        .from(challengeParticipants)
        .where(
            eq(
                challengeParticipants.challengeId,
                challenge.id,
            ),
        );

    const participantsCount = Number(
        participantCountRows[0]?.count ?? 0,
    );

    const rules: SessionRules = {
        ...DEFAULT_RULES,
        ...((challenge.rules ?? {}) as Partial<SessionRules>),
    };

    const sessionProblem: ChallengeSession["problem"] = {
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        statement: problem.statement,
        difficulty: problem.difficulty,
        points: problem.points,
        timeLimitMs: problem.timeLimitMs,
        memoryLimitKb: problem.memoryLimitKb,
        testCases: testCaseRows.map(
            (testCase): TestCaseInput => ({
                id: testCase.id,
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                isSample: testCase.isSample,
                points: testCase.points,
            }),
        ),
    };

    return {
        id: challenge.code,
        title: challenge.title,
        description: challenge.description ?? "",
        durationMinutes: challenge.durationMinutes,
        points: challenge.points,
        status: mapChallengeStatus(challenge.status),
        rules,
        problem: sessionProblem,
        createdAt: challenge.createdAt.toISOString(),
        createdBy: challenge.createdBy,
        participantsCount,
        submissions: [],
    };
}

export async function ensureDefaultSession(): Promise<void> {
    const existing = await db
        .select({ id: challenges.id })
        .from(challenges)
        .where(eq(challenges.code, "KILN-1001"))
        .limit(1);

    if (existing.length > 0) {
        return;
    }

    const problemRows = await db
        .select({
            id: problems.id,
        })
        .from(problems)
        .where(eq(problems.slug, "two-sum"))
        .limit(1);

    const problem = problemRows[0];

    if (!problem) {
        throw new Error(
            "Cannot create default KILN-1001 session because two-sum does not exist",
        );
    }

    const startAt = new Date();

    const endAt = new Date(
        startAt.getTime() + 45 * 60 * 1000,
    );

    await db
        .insert(challenges)
        .values({
            slug: "kiln-1001",
            code: "KILN-1001",
            title: "SEASON 01 // KILN TRIAL ARRAY CONFLICT",
            description:
                "Official Daily Synchronous Challenge — Proctored Algorithmic Arena",
            startAt,
            endAt,
            status: "live",
            createdBy: SYSTEM_ADMIN_ID,
            durationMinutes: 45,
            points: 100,
            rules: DEFAULT_RULES,
        })
        .onConflictDoNothing({
            target: challenges.code,
        });

    const challengeRows = await db
        .select({
            id: challenges.id,
        })
        .from(challenges)
        .where(eq(challenges.code, "KILN-1001"))
        .limit(1);

    const challenge = challengeRows[0];

    if (!challenge) {
        throw new Error(
            "Failed to create default KILN-1001 session",
        );
    }

    await db
        .insert(challengeProblems)
        .values({
            challengeId: challenge.id,
            problemId: problem.id,
            orderIndex: 0,
        })
        .onConflictDoNothing();
}

export async function findSessionByCode(
    sessionCode: string,
): Promise<ChallengeSession | undefined> {
    await ensureDefaultSession();

    const normalizedCode = sessionCode
        .trim()
        .toUpperCase();

    const rows = await db
        .select({
            id: challenges.id,
        })
        .from(challenges)
        .where(
            or(
                eq(challenges.code, normalizedCode),
                eq(
                    challenges.slug,
                    normalizedCode.toLowerCase(),
                ),
            ),
        )
        .limit(1);

    const challenge = rows[0];

    if (!challenge) {
        return undefined;
    }

    return buildChallengeSession(challenge.id);
}

export async function findAllSessions(): Promise<
    ChallengeSession[]
> {
    await ensureDefaultSession();

    const rows = await db
        .select({
            id: challenges.id,
        })
        .from(challenges)
        .orderBy(desc(challenges.createdAt));

    const sessions = await Promise.all(
        rows.map((row) =>
            buildChallengeSession(row.id),
        ),
    );

    return sessions.filter(
        (session): session is ChallengeSession =>
            Boolean(session),
    );
}

export async function createSession(data: {
    title: string;
    description?: string;
    durationMinutes?: number;
    points?: number;
    rules?: Partial<SessionRules>;
    problem: {
        title: string;
        slug?: string;
        statement: string;
        difficulty?: "easy" | "medium" | "hard";
        points?: number;
        timeLimitMs?: number;
        memoryLimitKb?: number;
        testCases: TestCaseInput[];
        starterTemplates?: Record<string, string>;
    };
    createdBy?: string;
}): Promise<ChallengeSession> {
    const createdBy = await resolveCreatedBy(
        data.createdBy,
    );

    const sessionCode =
        await generateUniqueSessionCode();

    const durationMinutes = Math.max(
        1,
        Number(data.durationMinutes) || 45,
    );

    const problemPoints =
        Number(data.problem.points) || 100;

    const sessionPoints =
        Number(data.points) || problemPoints;

    const rules: SessionRules = {
        ...DEFAULT_RULES,
        ...(data.rules ?? {}),
    };

    const startAt = new Date();

    const endAt = new Date(
        startAt.getTime() +
        durationMinutes * 60 * 1000,
    );

    const baseProblemSlug =
        slugify(
            data.problem.slug ||
            data.problem.title,
        ) || `problem-${Date.now()}`;

    const existingProblem = await db
        .select({
            id: problems.id,
        })
        .from(problems)
        .where(
            eq(
                problems.slug,
                baseProblemSlug,
            ),
        )
        .limit(1);

    const problemSlug =
        existingProblem.length > 0
            ? `${baseProblemSlug}-${sessionCode.toLowerCase()}`
            : baseProblemSlug;

    await db.transaction(async (tx) => {
        const problemRows = await tx
            .insert(problems)
            .values({
                slug: problemSlug,
                title: data.problem.title,
                statement: data.problem.statement,
                difficulty:
                    data.problem.difficulty ?? "easy",
                points: problemPoints,
                timeLimitMs:
                    Number(
                        data.problem.timeLimitMs,
                    ) || 2000,
                memoryLimitKb:
                    Number(
                        data.problem.memoryLimitKb,
                    ) || 262144,
                isPublished: true,
                createdBy,
            })
            .returning({
                id: problems.id,
            });

        const createdProblem = problemRows[0];

        if (!createdProblem) {
            throw new Error(
                "Failed to create challenge problem",
            );
        }

        if (data.problem.testCases.length > 0) {
            await tx.insert(testCases).values(
                data.problem.testCases.map(
                    (testCase, index) => ({
                        problemId: createdProblem.id,
                        input: testCase.input,
                        expectedOutput:
                            testCase.expectedOutput,
                        isSample: Boolean(
                            testCase.isSample,
                        ),
                        points:
                            Number(testCase.points) || 0,
                        orderIndex: index,
                    }),
                ),
            );
        }

        const challengeRows = await tx
            .insert(challenges)
            .values({
                slug: sessionCode.toLowerCase(),
                code: sessionCode,
                title:
                    data.title ||
                    `ARENA MATCH // ${problemSlug.toUpperCase()}`,
                description:
                    data.description ||
                    "Synchronous Time-Bound Competitive Coding Session",
                startAt,
                endAt,
                status: "live",
                createdBy,
                durationMinutes,
                points: sessionPoints,
                rules,
            })
            .returning({
                id: challenges.id,
            });

        const challenge = challengeRows[0];

        if (!challenge) {
            throw new Error(
                "Failed to create challenge",
            );
        }

        await tx.insert(challengeProblems).values({
            challengeId: challenge.id,
            problemId: createdProblem.id,
            orderIndex: 0,
        });
    });

    const createdSession =
        await findSessionByCode(sessionCode);

    if (!createdSession) {
        throw new Error(
            `Challenge ${sessionCode} was created but could not be loaded`,
        );
    }

    return createdSession;
}
export async function joinParticipant(
    sessionCode: string,
    userId: string,
): Promise<{
    sessionId: string;
    challengeId: string;
    userId: string;
    status: string;
    strikes: number;
    maxStrikes: number;
    enteredAt: Date;
    lastActiveAt: Date;
}> {
    const normalizedCode =
        sessionCode.trim().toUpperCase();

    return db.transaction(async (tx) => {
        const challengeRows =
            await tx
                .select({
                    id: challenges.id,
                    rules: challenges.rules,
                    status: challenges.status,
                })
                .from(challenges)
                .where(
                    eq(
                        challenges.code,
                        normalizedCode,
                    ),
                )
                .limit(1);

        const challenge =
            challengeRows[0];

        if (!challenge) {
            throw new Error(
                `Challenge ${normalizedCode} was not found.`,
            );
        }

        const userRows =
            await tx
                .select({
                    id: users.id,
                })
                .from(users)
                .where(
                    eq(
                        users.id,
                        userId,
                    ),
                )
                .limit(1);

        const user =
            userRows[0];

        if (!user) {
            throw new Error(
                "User was not found.",
            );
        }

        const rules =
            (challenge.rules ??
                {}) as Partial<SessionRules>;

        const maxStrikes =
            Number(
                rules.maxStrikes ?? 3,
            );

        await tx
            .insert(
                challengeParticipants,
            )
            .values({
                challengeId:
                    challenge.id,
                userId:
                    user.id,
            })
            .onConflictDoNothing();

        const existingSession =
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

        if (existingSession[0]) {
            const updated =
                await tx
                    .update(
                        participantSessions,
                    )
                    .set({
                        lastActiveAt:
                            new Date(),
                    })
                    .where(
                        eq(
                            participantSessions.id,
                            existingSession[0].id,
                        ),
                    )
                    .returning();

            const row =
                updated[0] ??
                existingSession[0];

            return {
                sessionId:
                    row.id,
                challengeId:
                    row.challengeId,
                userId:
                    row.userId,
                status:
                    row.status,
                strikes:
                    row.strikes,
                maxStrikes:
                    row.maxStrikes,
                enteredAt:
                    row.enteredAt,
                lastActiveAt:
                    row.lastActiveAt,
            };
        }

        const inserted =
            await tx
                .insert(
                    participantSessions,
                )
                .values({
                    challengeId:
                        challenge.id,
                    userId:
                        user.id,
                    status:
                        "active",
                    strikes: 0,
                    maxStrikes,
                })
                .returning();

        const row =
            inserted[0];

        if (!row) {
            throw new Error(
                "Failed to create participant session.",
            );
        }

        return {
            sessionId:
                row.id,
            challengeId:
                row.challengeId,
            userId:
                row.userId,
            status:
                row.status,
            strikes:
                row.strikes,
            maxStrikes:
                row.maxStrikes,
            enteredAt:
                row.enteredAt,
            lastActiveAt:
                row.lastActiveAt,
        };
    });
}

export async function getParticipantSession(
    sessionCode: string,
    userId: string,
) {
    const normalizedCode =
        sessionCode.trim().toUpperCase();

    const rows =
        await db
            .select({
                participantSession:
                    participantSessions,
            })
            .from(
                participantSessions,
            )
            .innerJoin(
                challenges,
                eq(
                    participantSessions.challengeId,
                    challenges.id,
                ),
            )
            .where(
                and(
                    eq(
                        challenges.code,
                        normalizedCode,
                    ),
                    eq(
                        participantSessions.userId,
                        userId,
                    ),
                ),
            )
            .limit(1);

    return rows[0]?.participantSession;
}

export async function touchParticipantSession(
    sessionId: string,
) {
    const rows =
        await db
            .update(
                participantSessions,
            )
            .set({
                lastActiveAt:
                    new Date(),
            })
            .where(
                eq(
                    participantSessions.id,
                    sessionId,
                ),
            )
            .returning();

    return rows[0];
}

export async function updateParticipantStrikes(
    sessionId: string,
    strikes: number,
) {
    const cleanStrikes =
        Math.max(
            0,
            Math.trunc(strikes),
        );

    const rows =
        await db
            .update(
                participantSessions,
            )
            .set({
                strikes:
                    cleanStrikes,
                status:
                    cleanStrikes > 0
                        ? "strike_warning"
                        : "active",
                lastActiveAt:
                    new Date(),
            })
            .where(
                eq(
                    participantSessions.id,
                    sessionId,
                ),
            )
            .returning();

    return rows[0];
}

export async function terminateParticipantSession(
    sessionId: string,
    reason: string,
    disqualified = false,
) {
    const rows =
        await db
            .update(
                participantSessions,
            )
            .set({
                status:
                    disqualified
                        ? "disqualified"
                        : "terminated",
                terminatedAt:
                    new Date(),
                lastActiveAt:
                    new Date(),
                terminationReason:
                    reason,
            })
            .where(
                eq(
                    participantSessions.id,
                    sessionId,
                ),
            )
            .returning();

    return rows[0];
}

export async function submitParticipantSession(
    sessionId: string,
) {
    const rows =
        await db
            .update(
                participantSessions,
            )
            .set({
                status:
                    "submitted",
                lastActiveAt:
                    new Date(),
            })
            .where(
                eq(
                    participantSessions.id,
                    sessionId,
                ),
            )
            .returning();

    return rows[0];
}