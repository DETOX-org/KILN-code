import { randomUUID } from "node:crypto";

import {
    and,
    asc,
    countDistinct,
    desc,
    eq,
    ilike,
    inArray,
    or,
} from "drizzle-orm";

import { db } from "../db/index.js";
import {
    problems,
    tags,
    problemTags,
    testCases,
    users,
} from "../db/schema.js";

import {
    Problem,
    CreateProblemInput,
    ProblemFilterQuery,
} from "../types/problem.types.js";

const SYSTEM_ADMIN_ID =
    "00000000-0000-0000-0000-000000000001";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Fetch tags for multiple problems.
 */
async function getTagsForProblems(
    problemIds: string[],
): Promise<Map<string, string[]>> {
    const result = new Map<string, string[]>();

    if (problemIds.length === 0) {
        return result;
    }

    const rows = await db
        .select({
            problemId: problemTags.problemId,
            tagName: tags.name,
        })
        .from(problemTags)
        .innerJoin(
            tags,
            eq(problemTags.tagId, tags.id),
        )
        .where(
            inArray(problemTags.problemId, problemIds),
        );

    for (const row of rows) {
        const existing = result.get(row.problemId);

        if (existing) {
            existing.push(row.tagName);
        } else {
            result.set(row.problemId, [row.tagName]);
        }
    }

    return result;
}

/**
 * Fetch test cases for multiple problems.
 */
async function getTestCasesForProblems(
    problemIds: string[],
): Promise<Map<string, Problem["testCases"]>> {
    const result = new Map<string, Problem["testCases"]>();

    if (problemIds.length === 0) {
        return result;
    }

    const rows = await db
        .select({
            id: testCases.id,
            problemId: testCases.problemId,
            input: testCases.input,
            expectedOutput: testCases.expectedOutput,
            isSample: testCases.isSample,
            points: testCases.points,
            orderIndex: testCases.orderIndex,
        })
        .from(testCases)
        .where(
            inArray(testCases.problemId, problemIds),
        )
        .orderBy(
            asc(testCases.problemId),
            asc(testCases.orderIndex),
        );

    for (const row of rows) {
        const testCase = {
            id: row.id,
            problemId: row.problemId,
            input: row.input,
            expectedOutput: row.expectedOutput,
            isSample: row.isSample,
            points: row.points,
            orderIndex: row.orderIndex,
        };

        const existing = result.get(row.problemId);

        if (existing) {
            existing.push(testCase);
        } else {
            result.set(row.problemId, [testCase]);
        }
    }

    return result;
}

/**
 * Convert database rows to the existing KILN Problem interface.
 */
async function buildProblems(
    rows: Array<{
        id: string;
        slug: string;
        title: string;
        statement: string;
        difficulty: "easy" | "medium" | "hard";
        points: number;
        timeLimitMs: number;
        memoryLimitKb: number;
        isPublished: boolean;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
    }>,
): Promise<Problem[]> {
    const problemIds = rows.map((row) => row.id);

    const [tagMap, testCaseMap] = await Promise.all([
        getTagsForProblems(problemIds),
        getTestCasesForProblems(problemIds),
    ]);

    return rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        statement: row.statement,
        difficulty: row.difficulty,
        points: row.points,
        timeLimitMs: row.timeLimitMs,
        memoryLimitKb: row.memoryLimitKb,
        isPublished: row.isPublished,
        tags: tagMap.get(row.id) ?? [],
        testCases: testCaseMap.get(row.id) ?? [],
        createdBy: row.createdBy,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    }));
}

/**
 * GET /api/problems
 */
export async function findAllProblems(
    filter?: ProblemFilterQuery,
): Promise<{ data: Problem[]; total: number }> {
    const conditions = [
        eq(problems.isPublished, true),
    ];

    if (filter?.difficulty) {
        conditions.push(
            eq(problems.difficulty, filter.difficulty),
        );
    }

    if (filter?.search) {
        const searchPattern = `%${filter.search}%`;

        conditions.push(
            or(
                ilike(problems.title, searchPattern),
                ilike(problems.statement, searchPattern),
            )!,
        );
    }

    if (filter?.tag) {
        conditions.push(
            eq(tags.name, filter.tag.trim().toLowerCase()),
        );
    }

    const whereClause = and(...conditions);

    const page = Math.max(1, filter?.page ?? 1);
    const limit = Math.min(
        100,
        Math.max(1, filter?.limit ?? 10),
    );

    const offset = (page - 1) * limit;

    /*
     * selectDistinct prevents duplicate problem rows when a
     * problem has multiple tags.
     */
    const rows = await db
        .selectDistinct({
            id: problems.id,
            slug: problems.slug,
            title: problems.title,
            statement: problems.statement,
            difficulty: problems.difficulty,
            points: problems.points,
            timeLimitMs: problems.timeLimitMs,
            memoryLimitKb: problems.memoryLimitKb,
            isPublished: problems.isPublished,
            createdBy: problems.createdBy,
            createdAt: problems.createdAt,
            updatedAt: problems.updatedAt,
        })
        .from(problems)
        .leftJoin(
            problemTags,
            eq(
                problemTags.problemId,
                problems.id,
            ),
        )
        .leftJoin(
            tags,
            eq(
                problemTags.tagId,
                tags.id,
            ),
        )
        .where(whereClause)
        .orderBy(
            asc(problems.title),
        )
        .limit(limit)
        .offset(offset);

    const totalResult = await db
        .select({
            total: countDistinct(problems.id),
        })
        .from(problems)
        .leftJoin(
            problemTags,
            eq(
                problemTags.problemId,
                problems.id,
            ),
        )
        .leftJoin(
            tags,
            eq(problemTags.tagId, tags.id),
        )
        .where(whereClause);

    const data = await buildProblems(rows);

    return {
        data,
        total: Number(totalResult[0]?.total ?? 0),
    };
}

/**
 * Find one problem by UUID.
 */
async function findOneById(
    id: string,
): Promise<Problem | undefined> {
    const rows = await db
        .select({
            id: problems.id,
            slug: problems.slug,
            title: problems.title,
            statement: problems.statement,
            difficulty: problems.difficulty,
            points: problems.points,
            timeLimitMs: problems.timeLimitMs,
            memoryLimitKb: problems.memoryLimitKb,
            isPublished: problems.isPublished,
            createdBy: problems.createdBy,
            createdAt: problems.createdAt,
            updatedAt: problems.updatedAt,
        })
        .from(problems)
        .where(eq(problems.id, id))
        .limit(1);

    if (rows.length === 0) {
        return undefined;
    }

    const result = await buildProblems(rows);

    return result[0];
}

/**
 * Find by slug.
 */
export async function findProblemBySlug(
    slug: string,
): Promise<Problem | undefined> {
    const normalizedSlug = slug.trim().toLowerCase();

    const rows = await db
        .select({
            id: problems.id,
            slug: problems.slug,
            title: problems.title,
            statement: problems.statement,
            difficulty: problems.difficulty,
            points: problems.points,
            timeLimitMs: problems.timeLimitMs,
            memoryLimitKb: problems.memoryLimitKb,
            isPublished: problems.isPublished,
            createdBy: problems.createdBy,
            createdAt: problems.createdAt,
            updatedAt: problems.updatedAt,
        })
        .from(problems)
        .where(eq(problems.slug, normalizedSlug))
        .limit(1);

    if (rows.length === 0) {
        return undefined;
    }

    const result = await buildProblems(rows);

    return result[0];
}

/**
 * Find by UUID.
 *
 * Old KILN IDs such as "p101..." are not valid PostgreSQL UUIDs,
 * so we safely return undefined instead of sending an invalid
 * UUID to PostgreSQL.
 */
export async function findProblemById(
    id: string,
): Promise<Problem | undefined> {
    if (!UUID_REGEX.test(id)) {
        return undefined;
    }

    return findOneById(id);
}

/**
 * Resolve the creator ID.
 *
 * The existing controller still sends "admin-user".
 * Later, authentication can pass the real UUID directly.
 */
async function resolveCreatorId(
    createdByUserId: string,
): Promise<string> {
    if (UUID_REGEX.test(createdByUserId)) {
        return createdByUserId;
    }

    const normalized = createdByUserId.trim().toLowerCase();

    if (
        normalized === "admin-user" ||
        normalized === "admin-user-id" ||
        normalized === "system"
    ) {
        return SYSTEM_ADMIN_ID;
    }

    const userRows = await db
        .select({
            id: users.id,
        })
        .from(users)
        .where(eq(users.username, normalized))
        .limit(1);

    if (userRows.length === 0) {
        throw new Error(
            `User '${createdByUserId}' was not found.`,
        );
    }

    return userRows[0].id;
}

/**
 * Create a complete problem inside one transaction.
 *
 * Problem
 *   + Tags
 *   + Test Cases
 *
 * either all succeed or all are rolled back.
 */
export async function createProblem(
    input: CreateProblemInput,
    createdByUserId = "system",
): Promise<Problem> {
    const slug =
        input.slug?.trim().toLowerCase() ||
        input.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    const creatorId =
        await resolveCreatorId(createdByUserId);

    /*
     * Create the entire problem inside one transaction.
     *
     * We return only the generated problem ID from the
     * transaction. After the transaction commits, we fetch
     * the complete problem using the normal database connection.
     *
     * This is important because buildProblems() uses db, not tx.
     */
    const problemId = await db.transaction(
        async (tx) => {
            const existing = await tx
                .select({
                    id: problems.id,
                })
                .from(problems)
                .where(eq(problems.slug, slug))
                .limit(1);

            if (existing.length > 0) {
                throw new Error(
                    `Problem with slug '${slug}' already exists.`,
                );
            }

            const newProblemId = randomUUID();

            await tx.insert(problems).values({
                id: newProblemId,
                slug,
                title: input.title,
                statement: input.statement,
                difficulty: input.difficulty,
                points: input.points ?? 100,
                timeLimitMs: input.timeLimitMs ?? 2000,
                memoryLimitKb: input.memoryLimitKb ?? 262144,
                isPublished: input.isPublished ?? true,
                createdBy: creatorId,
            });

            /*
             * Normalize and deduplicate tags.
             */
            const tagNames = [
                ...new Set(
                    (input.tags ?? [])
                        .map((tag) =>
                            tag.trim().toLowerCase(),
                        )
                        .filter(Boolean),
                ),
            ];

            /*
             * Create tags and problem ↔ tag relations.
             */
            for (const tagName of tagNames) {
                await tx
                    .insert(tags)
                    .values({
                        name: tagName,
                    })
                    .onConflictDoNothing();

                const tagRows = await tx
                    .select({
                        id: tags.id,
                    })
                    .from(tags)
                    .where(
                        eq(tags.name, tagName),
                    )
                    .limit(1);

                if (tagRows.length === 0) {
                    throw new Error(
                        `Failed to create/find tag '${tagName}'.`,
                    );
                }

                await tx
                    .insert(problemTags)
                    .values({
                        problemId: newProblemId,
                        tagId: tagRows[0].id,
                    })
                    .onConflictDoNothing();
            }

            /*
             * Create test cases.
             */
            const inputTestCases =
                input.testCases ?? [];

            if (inputTestCases.length > 0) {
                await tx.insert(testCases).values(
                    inputTestCases.map(
                        (testCase, index) => ({
                            id: randomUUID(),
                            problemId: newProblemId,
                            input: testCase.input,
                            expectedOutput:
                                testCase.expectedOutput,
                            isSample:
                                testCase.isSample ?? true,
                            points:
                                testCase.points ?? 0,
                            orderIndex:
                                testCase.orderIndex ?? index,
                        }),
                    ),
                );
            }

            return newProblemId;
        },
    );

    /*
     * The transaction has now committed.
     *
     * Fetching after commit allows buildProblems() to see
     * the problem, tags, and test cases.
     */
    const createdProblem =
        await findProblemById(problemId);

    if (!createdProblem) {
        throw new Error(
            "Problem was created but could not be read back.",
        );
    }

    return createdProblem;
}