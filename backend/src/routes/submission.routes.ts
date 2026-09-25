import { Router, Request, Response } from "express";
import { store } from "../services/store.service.js";
import { judgeRouter } from "../services/judge-router.service.js";

const router = Router();

// GET /api/submissions/:id
router.get("/:id", (req: Request, res: Response) => {
  const sub = store.submissions.find(s => s.id === req.params.id);
  if (!sub) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  // SENSITIVE-FLOW POLICY:
  // If request is from a student in an assessment session, discrepancies remain silent!
  const isStudent = req.headers["x-user-role"] === "student" || req.query.role === "student";
  const isAssessment = req.query.session_type === "assessment";

  if (isStudent && isAssessment && sub.discrepancy_flag) {
    // Return sanitized primary verdict to protect cognitive focus and eliminate panic
    const sanitized = {
      ...sub,
      discrepancy_flag: false,
      verification_engine: null,
      discrepancy_details: null,
      verification_notes: null
    };
    res.json(sanitized);
    return;
  }

  res.json(sub);
});

// POST /api/submissions
router.post("/", async (req: Request, res: Response) => {
  const { problem_id, user_id = "u0000000-0000-0000-0000-000000000002", username = "sam_dev", language_id = 1, source_code = "", contest_id } = req.body;

  if (!problem_id || !source_code) {
    res.status(400).json({ error: "problem_id and source_code are required" });
    return;
  }

  try {
    const result = await judgeRouter.executeSubmission({
      problemId: problem_id,
      userId: user_id,
      username,
      languageId: Number(language_id),
      sourceCode: source_code,
      contestId: contest_id
    });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to execute submission" });
  }
});

export default router;
