-- ============================================================
-- Migration 001: Phase 1 core schema
-- Competitive Coding / Learning / Assessment Platform
-- Covers: User, Problem, Submission, Contest entity groups
-- ============================================================

-- ---------- extensions ----------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ---------- enums ----------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE judge_status AS ENUM (
        'pending',
        'judging',
        'accepted',
        'wrong_answer',
        'compilation_error',
        'runtime_error',
        'time_limit_exceeded',
        'memory_limit_exceeded',
        'judge_error'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contest_status AS ENUM ('draft', 'scheduled', 'running', 'ended', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- USER / PROFILE / ROLE
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT NOT NULL UNIQUE,
    username        CITEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            user_role NOT NULL DEFAULT 'student',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name    TEXT,
    avatar_url      TEXT,
    bio             TEXT,
    institution     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================
-- LANGUAGE / TAG / PROBLEM / TEST CASE
-- ============================================================

CREATE TABLE IF NOT EXISTS languages (
    id              SMALLSERIAL PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,        -- e.g. 'C++17'
    judge_slug      TEXT NOT NULL UNIQUE,        -- id/slug used by Judge0 / Piston
    file_extension  TEXT NOT NULL,               -- e.g. 'cpp'
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tags (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    slug            TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS problems (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL UNIQUE,
    title           TEXT NOT NULL,
    statement       TEXT NOT NULL,               -- markdown
    difficulty      difficulty_level NOT NULL DEFAULT 'medium',
    points          INTEGER NOT NULL DEFAULT 100,
    time_limit_ms   INTEGER NOT NULL DEFAULT 2000,
    memory_limit_kb INTEGER NOT NULL DEFAULT 262144, -- 256 MB
    is_published    BOOLEAN NOT NULL DEFAULT FALSE,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS problem_tags (
    problem_id      UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    tag_id          INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, tag_id)
);

CREATE TABLE IF NOT EXISTS test_cases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id      UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    input           TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample       BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE = public (Run), FALSE = hidden (Submit)
    points          INTEGER NOT NULL DEFAULT 0,
    order_index     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_problems_published   ON problems(is_published);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty  ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_test_cases_problem   ON test_cases(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_tags_tag     ON problem_tags(tag_id);

-- ============================================================
-- CONTEST / CONTEST_PROBLEM / PARTICIPANT / SCORE
-- ============================================================

CREATE TABLE IF NOT EXISTS contests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL UNIQUE,
    title           TEXT NOT NULL,
    description     TEXT,
    status          contest_status NOT NULL DEFAULT 'draft',
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_contest_window CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS contest_problems (
    contest_id      UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    problem_id      UUID NOT NULL REFERENCES problems(id) ON DELETE RESTRICT,
    points          INTEGER NOT NULL DEFAULT 100,
    order_index     INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (contest_id, problem_id)
);

CREATE TABLE IF NOT EXISTS participants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id      UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (contest_id, user_id)
);

CREATE TABLE IF NOT EXISTS scores (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id          UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_score         INTEGER NOT NULL DEFAULT 0,
    penalty             INTEGER NOT NULL DEFAULT 0,
    last_accepted_at    TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (contest_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_contests_status         ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_time_window    ON contests(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_participants_contest    ON participants(contest_id);
CREATE INDEX IF NOT EXISTS idx_scores_leaderboard
    ON scores(contest_id, total_score DESC, penalty ASC, last_accepted_at ASC);

-- ============================================================
-- SUBMISSION / SUBMISSION_TEST_RESULT
-- ============================================================

CREATE TABLE IF NOT EXISTS submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id      UUID NOT NULL REFERENCES problems(id) ON DELETE RESTRICT,
    contest_id      UUID REFERENCES contests(id) ON DELETE SET NULL, -- NULL = practice
    language_id     SMALLINT NOT NULL REFERENCES languages(id),
    source_code     TEXT NOT NULL,
    status          judge_status NOT NULL DEFAULT 'pending',
    runtime_ms      INTEGER,
    memory_kb       INTEGER,
    score           INTEGER NOT NULL DEFAULT 0,
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    judged_at       TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS submission_test_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id   UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    test_case_id    UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
    status          judge_status NOT NULL,
    runtime_ms      INTEGER,
    memory_kb       INTEGER,
    stdout          TEXT,
    stderr          TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_problem ON submissions(user_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_contest      ON submissions(contest_id) WHERE contest_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_status       ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_str_submission           ON submission_test_results(submission_id);

-- ============================================================
-- updated_at auto-touch trigger (reused across tables)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_problems_updated_at ON problems;
CREATE TRIGGER trg_problems_updated_at
    BEFORE UPDATE ON problems
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_scores_updated_at ON scores;
CREATE TRIGGER trg_scores_updated_at
    BEFORE UPDATE ON scores
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
