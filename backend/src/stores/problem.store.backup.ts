import {
  Problem,
  CreateProblemInput,
  ProblemFilterQuery,
} from "../types/problem.types.js";

import {
  findAllProblems,
  findProblemBySlug,
  findProblemById,
  createProblem as createProblemInDatabase,
} from "../repositories/problem.repository.js";

export class ProblemStore {
  public async findAll(
    filter?: ProblemFilterQuery,
  ): Promise<{
    data: Problem[];
    total: number;
  }> {
    return findAllProblems(filter);
  }

  public async findBySlug(
    slug: string,
  ): Promise<Problem | undefined> {
    return findProblemBySlug(slug);
  }

  public async findById(
    id: string,
  ): Promise<Problem | undefined> {
    return findProblemById(id);
  }

  public async create(
    input: CreateProblemInput,
    createdByUserId = "system",
  ): Promise<Problem> {
    return createProblemInDatabase(
      input,
      createdByUserId,
    );
  }
}

export const problemStore = new ProblemStore();