export type DifficultyLevel = "easy" | "medium" | "hard";

export interface TestCase {
  id: string;
  problemId: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  points: number;
  orderIndex: number;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  statement: string;
  difficulty: DifficultyLevel;
  points: number;
  timeLimitMs: number;
  memoryLimitKb: number;
  isPublished: boolean;
  tags: string[];
  testCases: TestCase[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProblemInput {
  title: string;
  slug?: string;
  statement: string;
  difficulty: DifficultyLevel;
  points?: number;
  timeLimitMs?: number;
  memoryLimitKb?: number;
  isPublished?: boolean;
  tags?: string[];
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isSample?: boolean;
    points?: number;
    orderIndex?: number;
  }>;
}

export interface ProblemFilterQuery {
  difficulty?: DifficultyLevel;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}
