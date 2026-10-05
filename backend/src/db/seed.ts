import "dotenv/config";

import { db, pool } from "./index.js";
import {
    users,
    problems,
    tags,
    problemTags,
    testCases,
} from "./schema.js";
import { eq } from "drizzle-orm";

const SYSTEM_ADMIN_ID =
    "00000000-0000-0000-0000-000000000001";

const problemsToSeed = [
    {
        id: "00000000-0000-0000-0000-000000000101",
        slug: "two-sum",
        title: "Two Sum",
        statement: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.`,
        difficulty: "easy" as const,
        points: 100,
        timeLimitMs: 2000,
        memoryLimitKb: 262144,
        isPublished: true,
        tags: ["array", "hash-table"],
        testCases: [
            {
                id: "00000000-0000-0000-0000-000000001001",
                input: "4\n2 7 11 15\n9",
                expectedOutput: "0 1",
                isSample: true,
                points: 50,
                orderIndex: 0,
            },
            {
                id: "00000000-0000-0000-0000-000000001002",
                input: "3\n3 2 4\n6",
                expectedOutput: "1 2",
                isSample: true,
                points: 50,
                orderIndex: 1,
            },
            {
                id: "00000000-0000-0000-0000-000000001003",
                input: "2\n3 3\n6",
                expectedOutput: "0 1",
                isSample: false,
                points: 50,
                orderIndex: 2,
            },
        ],
    },

    {
        id: "00000000-0000-0000-0000-000000000102",
        slug: "reverse-string",
        title: "Reverse String",
        statement: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array **in-place** with $O(1)$ extra memory.`,
        difficulty: "easy" as const,
        points: 100,
        timeLimitMs: 1000,
        memoryLimitKb: 262144,
        isPublished: true,
        tags: ["two-pointers", "string"],
        testCases: [
            {
                id: "00000000-0000-0000-0000-000000001004",
                input: "hello",
                expectedOutput: "olleh",
                isSample: true,
                points: 40,
                orderIndex: 0,
            },
            {
                id: "00000000-0000-0000-0000-000000001005",
                input: "Hannah",
                expectedOutput: "hannaH",
                isSample: true,
                points: 30,
                orderIndex: 1,
            },
            {
                id: "00000000-0000-0000-0000-000000001006",
                input: "DETOX",
                expectedOutput: "XOTED",
                isSample: false,
                points: 30,
                orderIndex: 2,
            },
        ],
    },

    {
        id: "00000000-0000-0000-0000-000000000103",
        slug: "palindrome-number",
        title: "Palindrome Number",
        statement: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same backward as forward. For example, \`121\` is a palindrome while \`123\` is not.`,
        difficulty: "easy" as const,
        points: 100,
        timeLimitMs: 1000,
        memoryLimitKb: 262144,
        isPublished: true,
        tags: ["math", "string"],
        testCases: [
            {
                id: "00000000-0000-0000-0000-000000001007",
                input: "121",
                expectedOutput: "true",
                isSample: true,
                points: 33,
                orderIndex: 0,
            },
            {
                id: "00000000-0000-0000-0000-000000001008",
                input: "-121",
                expectedOutput: "false",
                isSample: true,
                points: 33,
                orderIndex: 1,
            },
            {
                id: "00000000-0000-0000-0000-000000001009",
                input: "10",
                expectedOutput: "false",
                isSample: true,
                points: 34,
                orderIndex: 2,
            },
            {
                id: "00000000-0000-0000-0000-000000001010",
                input: "12321",
                expectedOutput: "true",
                isSample: false,
                points: 50,
                orderIndex: 3,
            },
        ],
    },
];

async function seed() {
    console.log("🌱 Starting KILN database seed...");

    // ---------------------------------------------------------
    // 1. System admin
    // ---------------------------------------------------------

    await db
        .insert(users)
        .values({
            id: SYSTEM_ADMIN_ID,
            username: "admin-user",
            displayName: "KILN System Admin",
            email: "admin@kiln.local",
            role: "admin",
        })
        .onConflictDoNothing();

    console.log("✅ System admin ready");

    // ---------------------------------------------------------
    // 2. Problems
    // ---------------------------------------------------------

    for (const problem of problemsToSeed) {
        await db
            .insert(problems)
            .values({
                id: problem.id,
                slug: problem.slug,
                title: problem.title,
                statement: problem.statement,
                difficulty: problem.difficulty,
                points: problem.points,
                timeLimitMs: problem.timeLimitMs,
                memoryLimitKb: problem.memoryLimitKb,
                isPublished: problem.isPublished,
                createdBy: SYSTEM_ADMIN_ID,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .onConflictDoNothing();

        // -------------------------------------------------------
        // Tags
        // -------------------------------------------------------

        for (const tagName of problem.tags) {
            const normalizedTag = tagName
                .trim()
                .toLowerCase();

            await db
                .insert(tags)
                .values({
                    name: normalizedTag,
                })
                .onConflictDoNothing();

            const [tag] = await db
                .select()
                .from(tags)
                .where(eq(tags.name, normalizedTag))
                .limit(1);

            if (!tag) {
                throw new Error(
                    `Failed to create/find tag: ${normalizedTag}`,
                );
            }

            await db
                .insert(problemTags)
                .values({
                    problemId: problem.id,
                    tagId: tag.id,
                })
                .onConflictDoNothing();
        }

        // -------------------------------------------------------
        // Test cases
        // -------------------------------------------------------

        for (const testCase of problem.testCases) {
            await db
                .insert(testCases)
                .values({
                    id: testCase.id,
                    problemId: problem.id,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    isSample: testCase.isSample,
                    points: testCase.points,
                    orderIndex: testCase.orderIndex,
                })
                .onConflictDoNothing();
        }

        console.log(
            `✅ Seeded problem: ${problem.slug}`,
        );
    }

    console.log("🎉 KILN database seed completed successfully!");
}

seed()
    .catch((error) => {
        console.error("❌ Seed failed:");
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });