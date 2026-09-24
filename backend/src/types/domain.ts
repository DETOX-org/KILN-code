export type UserRole = 'student' | 'instructor' | 'admin';

export type JudgeStatus =
  | 'pending'
  | 'judging'
  | 'accepted'
  | 'wrong_answer'
  | 'compilation_error'
  | 'runtime_error'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'judge_error';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ContestStatus = 'draft' | 'scheduled' | 'running' | 'ended' | 'pending_finalization' | 'finalized' | 'archived';

export type GradingType = 'standard_diff' | 'custom_checker' | 'subtask_ioi';
export type ExecutionEngine = 'judge0' | 'piston' | 'isolated_worker';

export interface ProblemSubtask {
  id: string;
  problem_id: string;
  order_index: number;
  title: string;
  description?: string;
  points: number;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  statement: string;
  difficulty: DifficultyLevel;
  points: number;
  time_limit_ms: number;
  memory_limit_kb: number;
  grading_type: GradingType;
  execution_engine: ExecutionEngine;
  checker_source?: string | null;
  is_published: boolean;
  created_by: string;
  created_at: string;
  subtasks?: ProblemSubtask[];
}

export interface SubmissionSubtaskResult {
  subtask_id: string;
  order_index: number;
  title?: string;
  status: JudgeStatus;
  score: number;
  max_score: number;
  runtime_ms?: number;
  memory_kb?: number;
  details?: {
    tests_passed?: number;
    total_tests?: number;
    failed_test?: number;
    diagnostic?: string;
  };
}

export interface DiscrepancySideBySide {
  engine: string;
  runtime_ms: number;
  memory_kb: number;
  status: JudgeStatus;
  score: number;
  compiler: string;
  stdout: string;
  stderr: string;
}

export interface DiscrepancyDetails {
  summary: string;
  mismatch_test_case: number;
  primary: DiscrepancySideBySide;
  verification: DiscrepancySideBySide;
}

export interface Submission {
  id: string;
  user_id: string;
  username?: string;
  problem_id: string;
  problem_title?: string;
  contest_id?: string | null;
  language_id: number;
  language_name?: string;
  source_code: string;
  status: JudgeStatus;
  runtime_ms?: number;
  memory_kb?: number;
  score: number;
  grading_type: GradingType;
  execution_engine: ExecutionEngine;
  verification_engine?: ExecutionEngine | null;
  discrepancy_flag: boolean;
  is_verified: boolean;
  discrepancy_details?: DiscrepancyDetails | null;
  verification_notes?: string | null;
  verified_at?: string | null;
  submitted_at: string;
  subtask_results?: SubmissionSubtaskResult[];
}

export interface DiscrepancyQueueItem {
  submission_id: string;
  contest_id: string;
  contest_title: string;
  contest_rank: number;
  user: {
    id: string;
    username: string;
    display_name: string;
  };
  problem: {
    id: string;
    title: string;
    slug: string;
  };
  primary_result: DiscrepancySideBySide;
  verification_result: DiscrepancySideBySide;
  source_code: string;
  summary: string;
  mismatch_test_case: number;
}

export type StaffResolutionAction = 'accept_primary' | 'accept_verification' | 'rerun_benchmark';

export interface ContestStandingsItem {
  rank: number;
  user_id: string;
  username: string;
  display_name: string;
  total_score: number;
  penalty: number;
  is_verified: boolean;
  last_accepted_at?: string;
}
