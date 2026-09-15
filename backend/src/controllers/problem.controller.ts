import { Request, Response, NextFunction } from "express";
import { problemStore } from "../stores/problem.store.js";
import { CreateProblemInput, DifficultyLevel } from "../types/problem.types.js";

/**
 * GET /api/problems
 * List published problems with optional query filters (difficulty, tag, search, page, limit)
 */
export const getProblems = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const difficulty = req.query.difficulty as DifficultyLevel | undefined;
    const tag = req.query.tag as string | undefined;
    const search = req.query.search as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const result = problemStore.findAll({
      difficulty,
      tag,
      search,
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 10 : limit
    });

    // Strip test cases from list view to keep payload light
    const sanitizedProblems = result.data.map(({ testCases, ...rest }) => rest);

    res.status(200).json({
      success: true,
      total: result.total,
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 10 : limit,
      data: sanitizedProblems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/problems/:slug
 * Retrieve single problem by slug (includes public sample test cases only)
 */
export const getProblemBySlug = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const problem = problemStore.findBySlug(slug);

    if (!problem || !problem.isPublished) {
      res.status(404).json({
        success: false,
        error: `Problem with slug '${slug}' was not found.`
      });
      return;
    }

    // Filter test cases: return ONLY public sample test cases to standard users
    const sampleTestCases = problem.testCases
      .filter((tc) => tc.isSample)
      .map(({ expectedOutput, ...rest }) => ({
        ...rest,
        expectedOutput // Include sample expected output for frontend testing
      }));

    res.status(200).json({
      success: true,
      data: {
        ...problem,
        testCases: sampleTestCases
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/problems
 * Create a new problem definition
 */
export const createProblem = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { title, statement, difficulty, points, timeLimitMs, memoryLimitKb, tags, testCases, slug, isPublished } = req.body;

    if (!title || typeof title !== "string") {
      res.status(400).json({ success: false, error: "Field 'title' is required and must be a string." });
      return;
    }

    if (!statement || typeof statement !== "string") {
      res.status(400).json({ success: false, error: "Field 'statement' is required and must be a string." });
      return;
    }

    const validDifficulties: DifficultyLevel[] = ["easy", "medium", "hard"];
    if (!difficulty || !validDifficulties.includes(difficulty as DifficultyLevel)) {
      res.status(400).json({ success: false, error: "Field 'difficulty' must be one of: 'easy', 'medium', 'hard'." });
      return;
    }

    const input: CreateProblemInput = {
      title,
      slug,
      statement,
      difficulty: difficulty as DifficultyLevel,
      points,
      timeLimitMs,
      memoryLimitKb,
      isPublished,
      tags,
      testCases
    };

    const newProblem = problemStore.create(input, "admin-user");

    res.status(201).json({
      success: true,
      message: "Problem created successfully.",
      data: newProblem
    });
  } catch (error: any) {
    if (error.message && error.message.includes("already exists")) {
      res.status(409).json({ success: false, error: error.message });
      return;
    }
    next(error);
  }
};
