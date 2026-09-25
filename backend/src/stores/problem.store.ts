import { Problem, CreateProblemInput, ProblemFilterQuery } from "../types/problem.types.js";

// Pre-seeded problems for immediate testing
const INITIAL_PROBLEMS: Problem[] = [
  {
    id: "p1010000-0000-0000-0000-000000000001",
    slug: "two-sum",
    title: "Two Sum",
    statement: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.`,
    difficulty: "easy",
    points: 100,
    timeLimitMs: 2000,
    memoryLimitKb: 262144, // 256 MB
    isPublished: true,
    tags: ["array", "hash-table"],
    createdBy: "admin-user-id",
    createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
    updatedAt: new Date("2026-01-01T00:00:00Z").toISOString(),
    testCases: [
      {
        id: "tc-001",
        problemId: "p1010000-0000-0000-0000-000000000001",
        input: "4\n2 7 11 15\n9",
        expectedOutput: "0 1",
        isSample: true,
        points: 50,
        orderIndex: 0
      },
      {
        id: "tc-002",
        problemId: "p1010000-0000-0000-0000-000000000001",
        input: "3\n3 2 4\n6",
        expectedOutput: "1 2",
        isSample: true,
        points: 50,
        orderIndex: 1
      },
      {
        id: "tc-003",
        problemId: "p1010000-0000-0000-0000-000000000001",
        input: "2\n3 3\n6",
        expectedOutput: "0 1",
        isSample: false, // hidden test case
        points: 50,
        orderIndex: 2
      }
    ]
  },
  {
    id: "p1010000-0000-0000-0000-000000000002",
    slug: "reverse-string",
    title: "Reverse String",
    statement: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array **in-place** with $O(1)$ extra memory.`,
    difficulty: "easy",
    points: 100,
    timeLimitMs: 1000,
    memoryLimitKb: 262144,
    isPublished: true,
    tags: ["two-pointers", "string"],
    createdBy: "admin-user-id",
    createdAt: new Date("2026-01-02T00:00:00Z").toISOString(),
    updatedAt: new Date("2026-01-02T00:00:00Z").toISOString(),
    testCases: [
      {
        id: "tc-004",
        problemId: "p1010000-0000-0000-0000-000000000002",
        input: "hello",
        expectedOutput: "olleh",
        isSample: true,
        points: 40,
        orderIndex: 0
      },
      {
        id: "tc-004b",
        problemId: "p1010000-0000-0000-0000-000000000002",
        input: "Hannah",
        expectedOutput: "hannaH",
        isSample: true,
        points: 30,
        orderIndex: 1
      },
      {
        id: "tc-004c",
        problemId: "p1010000-0000-0000-0000-000000000002",
        input: "DETOX",
        expectedOutput: "XOTED",
        isSample: false,
        points: 30,
        orderIndex: 2
      }
    ]
  },
  {
    id: "p1010000-0000-0000-0000-000000000003",
    slug: "palindrome-number",
    title: "Palindrome Number",
    statement: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same backward as forward. For example, \`121\` is a palindrome while \`123\` is not.`,
    difficulty: "easy",
    points: 100,
    timeLimitMs: 1000,
    memoryLimitKb: 262144,
    isPublished: true,
    tags: ["math", "string"],
    createdBy: "admin-user-id",
    createdAt: new Date("2026-01-03T00:00:00Z").toISOString(),
    updatedAt: new Date("2026-01-03T00:00:00Z").toISOString(),
    testCases: [
      {
        id: "tc-005",
        problemId: "p1010000-0000-0000-0000-000000000003",
        input: "121",
        expectedOutput: "true",
        isSample: true,
        points: 33,
        orderIndex: 0
      },
      {
        id: "tc-006",
        problemId: "p1010000-0000-0000-0000-000000000003",
        input: "-121",
        expectedOutput: "false",
        isSample: true,
        points: 33,
        orderIndex: 1
      },
      {
        id: "tc-007",
        problemId: "p1010000-0000-0000-0000-000000000003",
        input: "10",
        expectedOutput: "false",
        isSample: true,
        points: 34,
        orderIndex: 2
      },
      {
        id: "tc-008",
        problemId: "p1010000-0000-0000-0000-000000000003",
        input: "12321",
        expectedOutput: "true",
        isSample: false,
        points: 50,
        orderIndex: 3
      }
    ]
  }
];

export class ProblemStore {
  private problems: Problem[] = [...INITIAL_PROBLEMS];

  public findAll(filter?: ProblemFilterQuery): { data: Problem[]; total: number } {
    let result = this.problems.filter((p) => p.isPublished);

    if (filter?.difficulty) {
      result = result.filter((p) => p.difficulty === filter.difficulty);
    }

    if (filter?.tag) {
      const tagLower = filter.tag.toLowerCase();
      result = result.filter((p) => p.tags.some((t) => t.toLowerCase() === tagLower));
    }

    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.statement.toLowerCase().includes(searchLower)
      );
    }

    const total = result.length;
    const page = Math.max(1, filter?.page ?? 1);
    const limit = Math.max(1, filter?.limit ?? 10);
    const startIndex = (page - 1) * limit;

    const data = result.slice(startIndex, startIndex + limit);

    return { data, total };
  }

  public findBySlug(slug: string): Problem | undefined {
    return this.problems.find((p) => p.slug === slug.toLowerCase());
  }

  public findById(id: string): Problem | undefined {
    return this.problems.find((p) => p.id === id);
  }

  public create(input: CreateProblemInput, createdByUserId: string = "system"): Problem {
    const slug =
      input.slug ||
      input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const existing = this.findBySlug(slug);
    if (existing) {
      throw new Error(`Problem with slug '${slug}' already exists.`);
    }

    const problemId = `p${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();

    const formattedTestCases = (input.testCases || []).map((tc, idx) => ({
      id: `tc-${Date.now()}-${idx}`,
      problemId,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isSample: tc.isSample ?? true,
      points: tc.points ?? 0,
      orderIndex: tc.orderIndex ?? idx
    }));

    const newProblem: Problem = {
      id: problemId,
      slug,
      title: input.title,
      statement: input.statement,
      difficulty: input.difficulty,
      points: input.points ?? 100,
      timeLimitMs: input.timeLimitMs ?? 2000,
      memoryLimitKb: input.memoryLimitKb ?? 262144,
      isPublished: input.isPublished ?? true,
      tags: input.tags || [],
      testCases: formattedTestCases,
      createdBy: createdByUserId,
      createdAt: now,
      updatedAt: now
    };

    this.problems.push(newProblem);
    return newProblem;
  }
}

export const problemStore = new ProblemStore();
