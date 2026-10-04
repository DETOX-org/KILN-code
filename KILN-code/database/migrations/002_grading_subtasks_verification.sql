-- ============================================================
-- Migration 002: Grading Types, Execution Routing, Subtasks & Dual-Run Verification
-- Refined Scope: Capability routing (grading_type & execution_engine)
-- Narrow Contest-Finalization Verification & Discrepancy Reconciliation
-- ============================================================

-- ---------- enums ----------
DO $$ BEGIN
    CREATE TYPE grading_type AS ENUM ('standard_diff', 'custom_checker', 'subtask_ioi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE execution_engine AS ENUM ('judge0', 'piston', 'isolated_worker');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- EXTEND PROBLEMS: Routing & Checker Specification
-- ============================================================

ALTER TABLE problems
    ADD COLUMN IF NOT EXISTS grading_type grading_type NOT NULL DEFAULT 'standard_diff',
    ADD COLUMN IF NOT EXISTS execution_engine execution_engine NOT NULL DEFAULT 'judge0',
    ADD COLUMN IF NOT EXISTS checker_source TEXT; -- C++ testlib / Python custom checker source

CREATE INDEX IF NOT EXISTS idx_problems_grading_type ON problems(grading_type);
CREATE INDEX IF NOT EXISTS idx_problems_execution_engine ON problems(execution_engine);

-- ============================================================
-- SUBTASKS: IOI-Style Partial Scoring
-- ============================================================

CREATE TABLE IF NOT EXISTS problem_subtasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id      UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    order_index     INTEGER NOT NULL DEFAULT 1,
    title           TEXT NOT NULL,               -- e.g. 'Subtask 1: N <= 100, K <= 10^3'
    description     TEXT,                        -- constraints description
    points          INTEGER NOT NULL DEFAULT 0,  -- e.g. 20 pts
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_subtask_points_positive CHECK (points >= 0),
    UNIQUE (problem_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_subtasks_problem ON problem_subtasks(problem_id);

-- Link test cases optionally to a subtask
ALTER TABLE test_cases
    ADD COLUMN IF NOT EXISTS subtask_id UUID REFERENCES problem_subtasks(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_test_cases_subtask ON test_cases(subtask_id) WHERE subtask_id IS NOT NULL;

-- ============================================================
-- EXTEND SUBMISSIONS: Routing & Contest-Finalization Trust Seal
-- ============================================================

ALTER TABLE submissions
    ADD COLUMN IF NOT EXISTS grading_type grading_type NOT NULL DEFAULT 'standard_diff',
    ADD COLUMN IF NOT EXISTS execution_engine execution_engine NOT NULL DEFAULT 'judge0',
    ADD COLUMN IF NOT EXISTS verification_engine execution_engine, -- NULL unless dual-run tested
    ADD COLUMN IF NOT EXISTS discrepancy_flag BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS discrepancy_details JSONB,            -- side-by-side metrics, test case diff
    ADD COLUMN IF NOT EXISTS verification_notes TEXT,             -- staff resolution rationale
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Indices for rapid discrepancy filtering and leaderboard verified badge lookup
CREATE INDEX IF NOT EXISTS idx_submissions_discrepancy 
    ON submissions(discrepancy_flag) WHERE discrepancy_flag = TRUE;

CREATE INDEX IF NOT EXISTS idx_submissions_verified 
    ON submissions(is_verified) WHERE is_verified = TRUE;

-- ============================================================
-- SUBMISSION SUBTASK RESULTS: Test-Group Verdicts
-- ============================================================

CREATE TABLE IF NOT EXISTS submission_subtask_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id   UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    subtask_id      UUID NOT NULL REFERENCES problem_subtasks(id) ON DELETE CASCADE,
    order_index     INTEGER NOT NULL DEFAULT 1,
    status          judge_status NOT NULL DEFAULT 'pending',
    score           INTEGER NOT NULL DEFAULT 0,
    max_score       INTEGER NOT NULL DEFAULT 0,
    runtime_ms      INTEGER,
    memory_kb       INTEGER,
    details         JSONB,                      -- individual test result summaries within subtask
    UNIQUE (submission_id, subtask_id)
);

CREATE INDEX IF NOT EXISTS idx_ssr_submission ON submission_subtask_results(submission_id);
