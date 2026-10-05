import {
  Router,
  Request,
  Response,
} from "express";

import {
  desc,
  eq,
} from "drizzle-orm";

import { db } from "../db/index.js";

import {
  challenges,
  submissions,
  users,
  problems,
} from "../db/schema.js";

import {
  judgeRouter,
} from "../services/judge-router.service.js";

import type {
  DiscrepancyDetails,
  StaffResolutionAction,
} from "../types/domain.js";

const router = Router();

// ============================================================================
// DATABASE-BACKED DISCREPANCY QUEUE
// ============================================================================

async function getDatabaseDiscrepancyQueue() {
  const rows = await db
    .select({
      submission: submissions,
      contestId: challenges.code,
      contestTitle: challenges.title,
      contestStatus: challenges.status,
      username: users.username,
      displayName: users.displayName,
      problemTitle: problems.title,
      problemSlug: problems.slug,
    })
    .from(submissions)
    .innerJoin(
      challenges,
      eq(
        submissions.challengeId,
        challenges.id,
      ),
    )
    .innerJoin(
      users,
      eq(
        submissions.userId,
        users.id,
      ),
    )
    .innerJoin(
      problems,
      eq(
        submissions.problemId,
        problems.id,
      ),
    )
    .where(
      eq(
        submissions.discrepancyFlag,
        true,
      ),
    )
    .orderBy(
      desc(
        submissions.submittedAt,
      ),
    );

  return rows
    .map((row) => {
      const details =
        row.submission.discrepancyDetails as
        | DiscrepancyDetails
        | null;

      if (!details) {
        return null;
      }

      return {
        submission_id:
          row.submission.id,

        contest_id:
          row.contestId,

        contest_title:
          row.contestTitle,

        contest_status:
          row.contestStatus,

        // Rank is calculated by the leaderboard repository.
        // It is not stored on the submission record.
        contest_rank: 0,

        user: {
          id:
            row.submission.userId,
          username:
            row.username,
          display_name:
            row.displayName,
        },

        problem: {
          id:
            row.submission.problemId,
          title:
            row.problemTitle,
          slug:
            row.problemSlug,
        },

        primary_result:
          details.primary,

        verification_result:
          details.verification,

        source_code:
          row.submission.sourceCode,

        summary:
          details.summary,

        mismatch_test_case:
          details.mismatch_test_case,
      };
    })
    .filter(
      (
        item,
      ): item is NonNullable<typeof item> =>
        item !== null,
    );
}

// ============================================================================
// GET /api/admin/discrepancies
// ============================================================================

router.get(
  "/discrepancies",
  async (
    _req: Request,
    res: Response,
  ) => {
    try {
      const queue =
        await getDatabaseDiscrepancyQueue();

      res.json({
        total_pending:
          queue.length,

        contest_id:
          queue[0]?.contest_id ??
          null,

        contest_status:
          queue[0]?.contest_status ??
          null,

        items:
          queue,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error:
          err.message ||
          "Failed to load discrepancy queue",
      });
    }
  },
);

// ============================================================================
// POST /api/admin/discrepancies/:id/resolve
// ============================================================================

router.post(
  "/discrepancies/:id/resolve",
  async (
    req: Request,
    res: Response,
  ) => {
    const submissionId =
      Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    const {
      action,
      notes = "",
    } = req.body ?? {};

    if (
      !action ||
      ![
        "accept_primary",
        "accept_verification",
        "rerun_benchmark",
      ].includes(action)
    ) {
      res.status(400).json({
        success: false,
        error:
          "Invalid action. Must be 'accept_primary', 'accept_verification', or 'rerun_benchmark'.",
      });
      return;
    }

    try {
      const updated =
        await judgeRouter.resolveDiscrepancy({
          submissionId,
          action:
            action as StaffResolutionAction,
          notes:
            String(notes),
        });

      // Read the current contest status from PostgreSQL.
      const contestRows =
        await db
          .select({
            status:
              challenges.status,
          })
          .from(submissions)
          .innerJoin(
            challenges,
            eq(
              submissions.challengeId,
              challenges.id,
            ),
          )
          .where(
            eq(
              submissions.id,
              submissionId,
            ),
          )
          .limit(1);

      res.json({
        success: true,
        message:
          "Discrepancy successfully resolved by staff.",
        submission:
          updated,
        contest_status:
          contestRows[0]?.status ??
          null,
      });
    } catch (err: any) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to resolve discrepancy.";

      res.status(
        message.toLowerCase().includes("not found")
          ? 404
          : 400,
      ).json({
        success: false,
        error:
          message,
      });
    }
  },
);

// ============================================================================
// POST /api/admin/contests/:id/finalize
// ============================================================================

router.post(
  "/contests/:id/finalize",
  async (
    req: Request,
    res: Response,
  ) => {
    const contestId =
      Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    const topN =
      Number(
        req.body?.top_qualifiers ??
        10,
      );

    try {
      const result =
        await judgeRouter.finalizeContest(
          contestId,
          topN,
        );

      res.json({
        success: true,
        message:
          result.finalized
            ? "Contest finalized successfully. All top qualifying submissions verified."
            : "Contest finalization blocked: discrepancies flagged for staff review.",
        ...result,
        contest_status:
          result.contestStatus,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error:
          err.message ||
          "Failed to finalize contest",
      });
    }
  },
);

export default router;
