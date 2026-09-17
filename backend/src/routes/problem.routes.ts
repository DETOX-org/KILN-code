import { Router } from "express";
import { getProblems, getProblemBySlug, createProblem } from "../controllers/problem.controller.js";

const router = Router();

// GET /api/problems — List problems (with filters)
router.get("/", getProblems);

// GET /api/problems/:slug — Detail view for a specific problem by slug
router.get("/:slug", getProblemBySlug);

// POST /api/problems — Create a new problem
router.post("/", createProblem);

export default router;
