import {
  Request,
  Response,
  NextFunction,
} from "express";

import { problemStore } from "../stores/problem.store.js";

import {
  CreateProblemInput,
  DifficultyLevel,
} from "../types/problem.types.js";

/**
 * GET /api/problems
 */
export const getProblems = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const difficulty =
      req.query.difficulty as
      | DifficultyLevel
      | undefined;

    const tag =
      req.query.tag as string | undefined;

    const search =
      req.query.search as string | undefined;

    const page = req.query.page
      ? parseInt(req.query.page as string, 10)
      : 1;

    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;

    const result = await problemStore.findAll({
      difficulty,
      tag,
      search,
      page: Number.isNaN(page) ? 1 : page,
      limit: Number.isNaN(limit) ? 10 : limit,
    });

    const sanitizedProblems = result.data.map(
      ({ testCases, ...rest }) => rest,
    );

    res.status(200).json({
      success: true,
      total: result.total,
      page: Number.isNaN(page) ? 1 : page,
      limit: Number.isNaN(limit) ? 10 : limit,
      data: sanitizedProblems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/problems/:slug
 */
export const getProblemBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const slug = Array.isArray(req.params.slug)
      ? req.params.slug[0]
      : req.params.slug;

    const problem =
      (await problemStore.findBySlug(slug)) ??
      (await problemStore.findById(slug));

    if (!problem || !problem.isPublished) {
      res.status(404).json({
        success: false,
        error: `Problem with slug '${slug}' was not found.`,
      });

      return;
    }

    const sampleTestCases = problem.testCases
      .filter((tc) => tc.isSample)
      .map(({ expectedOutput, ...rest }) => ({
        ...rest,
        expectedOutput,
      }));

    res.status(200).json({
      success: true,
      data: {
        ...problem,
        testCases: sampleTestCases,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/problems
 */
export const createProblem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      title,
      statement,
      difficulty,
      points,
      timeLimitMs,
      memoryLimitKb,
      tags,
      testCases,
      slug,
      isPublished,
    } = req.body;

    if (
      !title ||
      typeof title !== "string"
    ) {
      res.status(400).json({
        success: false,
        error:
          "Field 'title' is required and must be a string.",
      });

      return;
    }

    if (
      !statement ||
      typeof statement !== "string"
    ) {
      res.status(400).json({
        success: false,
        error:
          "Field 'statement' is required and must be a string.",
      });

      return;
    }

    const validDifficulties: DifficultyLevel[] = [
      "easy",
      "medium",
      "hard",
    ];

    if (
      !difficulty ||
      !validDifficulties.includes(
        difficulty as DifficultyLevel,
      )
    ) {
      res.status(400).json({
        success: false,
        error:
          "Field 'difficulty' must be one of: 'easy', 'medium', 'hard'.",
      });

      return;
    }

    const input: CreateProblemInput = {
      title,
      slug,
      statement,
      difficulty:
        difficulty as DifficultyLevel,
      points,
      timeLimitMs,
      memoryLimitKb,
      isPublished,
      tags,
      testCases,
    };

    const newProblem =
      await problemStore.create(
        input,
        "admin-user",
      );

    res.status(201).json({
      success: true,
      message:
        "Problem created successfully.",
      data: newProblem,
    });
  } catch (error: any) {
    if (
      error?.message?.includes(
        "already exists",
      )
    ) {
      res.status(409).json({
        success: false,
        error: error.message,
      });

      return;
    }

    next(error);
  }
};