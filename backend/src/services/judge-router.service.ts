import { store } from "./store.service.js";
import {
  Submission,
  Problem,
  StaffResolutionAction,
  SubmissionSubtaskResult
} from "../types/domain.js";

export class JudgeRouterService {
  /**
   * Normal Capability-Based Routing:
   * Driven strictly by problem.grading_type and problem.execution_engine.
   * No A/B splits, no circuit breaker, no shadow mode.
   */
  public async executeSubmission(params: {
    problemId: string;
    userId: string;
    username: string;
    languageId: number;
    sourceCode: string;
    contestId?: string;
  }): Promise<Submission> {
    const problem = store.problems.find(p => p.id === params.problemId);
    if (!problem) {
      throw new Error(`Problem not found: ${params.problemId}`);
    }

    const submissionId = `sub-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const targetEngine = problem.execution_engine; // e.g. 'judge0'
    const gradingType = problem.grading_type;     // e.g. 'subtask_ioi'

    let finalStatus: Submission['status'] = 'accepted';
    let finalScore = 0;
    let subtaskResults: SubmissionSubtaskResult[] | undefined;

    if (gradingType === 'subtask_ioi' && problem.subtasks && problem.subtasks.length > 0) {
      // Subtask-based scoring: all tests in subtask must pass
      subtaskResults = [];
      for (const st of problem.subtasks) {
        // Evaluate tests for this subtask
        const passed = true; // In production: evaluated by worker
        const stScore = passed ? st.points : 0;
        finalScore += stScore;

        subtaskResults.push({
          subtask_id: st.id,
          order_index: st.order_index,
          title: st.title,
          status: passed ? 'accepted' : 'wrong_answer',
          score: stScore,
          max_score: st.points,
          runtime_ms: 35,
          memory_kb: 12000,
          details: { tests_passed: 5, total_tests: 5 }
        });
      }
      finalStatus = finalScore === problem.points ? 'accepted' : 'accepted';
    } else {
      // Standard diff or custom checker
      finalScore = problem.points;
      finalStatus = 'accepted';
    }

    const newSubmission: Submission = {
      id: submissionId,
      user_id: params.userId,
      username: params.username,
      problem_id: problem.id,
      problem_title: problem.title,
      contest_id: params.contestId || null,
      language_id: params.languageId,
      language_name: params.languageId === 1 ? 'C++20 (GCC 12.2)' : 'Python 3',
      source_code: params.sourceCode,
      status: finalStatus,
      runtime_ms: 45,
      memory_kb: 15400,
      score: finalScore,
      grading_type: gradingType,
      execution_engine: targetEngine,
      verification_engine: null,
      discrepancy_flag: false,
      is_verified: false,
      submitted_at: new Date().toISOString(),
      subtask_results: subtaskResults
    };

    store.submissions.unshift(newSubmission);
    return newSubmission;
  }

  /**
   * Narrow Contest Finalization Dual-Run Trigger:
   * Only triggered at contest completion for qualifying top-of-leaderboard submissions.
   */
  public async finalizeContest(contestId: string, topQualifiersCount: number = 10): Promise<{
    auditedCount: number;
    discrepanciesFound: number;
    finalized: boolean;
  }> {
    const contestSubmissions = store.submissions.filter(s => s.contest_id === contestId);
    let audited = 0;
    let discrepancies = 0;

    for (const sub of contestSubmissions.slice(0, topQualifiersCount)) {
      audited++;
      // If already audited
      if (sub.verification_engine && (sub.is_verified || sub.discrepancy_flag)) {
        if (sub.discrepancy_flag) discrepancies++;
        continue;
      }

      // Simulate dual-run on verification engine (Piston)
      const primaryVerdict = sub.status;
      const verificationVerdict = sub.status; // or mismatch for manufactured test cases

      sub.verification_engine = 'piston';

      if (primaryVerdict === verificationVerdict) {
        sub.is_verified = true;
        sub.discrepancy_flag = false;
        sub.verified_at = new Date().toISOString();
      } else {
        sub.discrepancy_flag = true;
        sub.is_verified = false;
        discrepancies++;
      }
    }

    const finalized = discrepancies === 0;
    store.contestState.status = finalized ? 'finalized' : 'pending_finalization';

    return {
      auditedCount: audited,
      discrepanciesFound: discrepancies,
      finalized
    };
  }

  /**
   * Staff Resolution for Discrepancy Queue:
   * Allows admin / contest director to resolve mismatch and award "Verified ✓"
   */
  public resolveDiscrepancy(params: {
    submissionId: string;
    action: StaffResolutionAction;
    notes: string;
  }): Submission {
    const sub = store.submissions.find(s => s.id === params.submissionId);
    if (!sub) {
      throw new Error(`Submission ${params.submissionId} not found`);
    }

    if (params.action === 'accept_primary') {
      sub.score = sub.discrepancy_details?.primary.score ?? sub.score;
      sub.status = sub.discrepancy_details?.primary.status ?? sub.status;
    } else if (params.action === 'accept_verification') {
      sub.score = sub.discrepancy_details?.verification.score ?? sub.score;
      sub.status = sub.discrepancy_details?.verification.status ?? sub.status;
    } else if (params.action === 'rerun_benchmark') {
      // Clean isolated benchmark run
      sub.score = 100;
      sub.status = 'accepted';
      sub.runtime_ms = 1910;
    }

    sub.discrepancy_flag = false;
    sub.is_verified = true;
    sub.verification_notes = params.notes;
    sub.verified_at = new Date().toISOString();

    // Update contest standing
    const standing = store.contestStandings.find(s => s.user_id === sub.user_id);
    if (standing) {
      standing.total_score = sub.score;
      standing.is_verified = true;
    }

    // Check if all discrepancies in contest are resolved
    const remaining = store.getDiscrepancyQueue();
    if (remaining.length === 0) {
      store.contestState.status = 'finalized';
    }

    return sub;
  }
}

export const judgeRouter = new JudgeRouterService();
