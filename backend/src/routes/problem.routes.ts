import { Router, Request, Response } from "express";
import { store } from "../services/store.service.js";
import { Problem, ProblemSubtask, GradingType, ExecutionEngine } from "../types/domain.js";

const router = Router();

// GET /api/problems
router.get("/", (_req: Request, res: Response) => {
  res.json(store.problems);
});

// GET /api/problems/:id
router.get("/:id", (req: Request, res: Response) => {
  const problem = store.problems.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!problem) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }
  res.json(problem);
});

// POST /api/problems
router.post("/", (req: Request, res: Response) => {
  const {
    title,
    slug,
    statement,
    difficulty = "medium",
    points = 100,
    time_limit_ms = 1500,
    memory_limit_kb = 262144,
    grading_type = "standard_diff",
    execution_engine = "judge0",
    checker_source,
    subtasks = []
  } = req.body;

  if (!title || !slug) {
    res.status(400).json({ error: "Title and slug are required" });
    return;
  }

  const problemId = `p${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

  const createdSubtasks: ProblemSubtask[] = (subtasks as any[]).map((st, idx) => ({
    id: `s${Date.now().toString(36)}-${idx}`,
    problem_id: problemId,
    order_index: st.order_index ?? (idx + 1),
    title: st.title || `Subtask ${idx + 1}`,
    description: st.description || "",
    points: Number(st.points) || 0
  }));

  const newProblem: Problem = {
    id: problemId,
    slug,
    title,
    statement: statement || "",
    difficulty,
    points: Number(points),
    time_limit_ms: Number(time_limit_ms),
    memory_limit_kb: Number(memory_limit_kb),
    grading_type: grading_type as GradingType,
    execution_engine: execution_engine as ExecutionEngine,
    checker_source: checker_source || null,
    is_published: true,
    created_by: "u0000000-0000-0000-0000-000000000004",
    created_at: new Date().toISOString(),
    subtasks: createdSubtasks.length > 0 ? createdSubtasks : undefined
  };

  store.problems.push(newProblem);
  res.status(201).json(newProblem);
});

export default router;
