import {
    pgEnum,
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
    jsonb,
    primaryKey,
    uniqueIndex,
    index,
} from "drizzle-orm/pg-core";

/* =========================================================
   ENUMS
========================================================= */

export const userRoleEnum = pgEnum("user_role", [
    "student",
    "instructor",
    "admin",
]);

export const difficultyEnum = pgEnum("difficulty_level", [
    "easy",
    "medium",
    "hard",
]);

export const challengeStatusEnum = pgEnum(
    "challenge_status",
    [
        "draft",
        "scheduled",
        "registration_open",
        "live",
        "submission_closed",
        "evaluation_complete",
        "results_published",
        "ended",
        "finalized",
        "pending_finalization",
        "archived",
    ],
);

export const sessionStatusEnum = pgEnum("session_status", [
    "active",
    "strike_warning",
    "submitted",
    "terminated",
    "disqualified",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
    "queued",
    "running",
    "accepted",
    "wrong_answer",
    "compilation_error",
    "runtime_error",
    "time_limit_exceeded",
    "memory_limit_exceeded",
    "system_error",
]);

export const integrityEventTypeEnum = pgEnum(
    "integrity_event_type",
    [
        "FULLSCREEN_ENTER",
        "FULLSCREEN_EXIT",
        "WINDOW_BLUR",
        "TAB_SWITCH",
        "DEVTOOLS_OPEN_ATTEMPT",
        "EXTERNAL_PASTE_BLOCKED",
        "INTERNAL_PASTE_ALLOWED",
        "BURST_TYPING_FLAGGED",
        "ESCAPE_KEY_PRESSED",
    ],
);

/* =========================================================
   USERS
========================================================= */

export const users = pgTable(
    "users",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        username: varchar("username", {
            length: 50,
        }).notNull(),

        displayName: varchar("display_name", {
            length: 100,
        }).notNull(),

        email: varchar("email", {
            length: 255,
        }).notNull(),

        role: userRoleEnum("role")
            .notNull()
            .default("student"),

        passwordHash: text("password_hash"),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        uniqueIndex("users_username_unique").on(
            table.username,
        ),

        uniqueIndex("users_email_unique").on(
            table.email,
        ),
    ],
);

/* =========================================================
   CHALLENGES
========================================================= */

export const challenges = pgTable(
    "challenges",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        slug: varchar("slug", {
            length: 120,
        }).notNull(),

        code: varchar("code", {
            length: 20,
        }).notNull(),

        title: varchar("title", {
            length: 200,
        }).notNull(),

        description: text("description"),

        durationMinutes: integer(
            "duration_minutes",
        )
            .notNull()
            .default(45),

        points: integer("points")
            .notNull()
            .default(100),

        rules: jsonb("rules")
            .notNull()
            .default({
                fullscreenEnforced: true,
                maxStrikes: 3,
                blockExternalPaste: true,
                autoSaveIntervalSec: 10,
            }),

        startAt: timestamp("start_at", {
            withTimezone: true,
        }).notNull(),

        endAt: timestamp("end_at", {
            withTimezone: true,
        }).notNull(),

        status: challengeStatusEnum("status")
            .notNull()
            .default("draft"),

        createdBy: uuid("created_by")
            .notNull()
            .references(() => users.id),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        uniqueIndex("challenges_slug_unique").on(
            table.slug,
        ),

        uniqueIndex("challenges_code_unique").on(
            table.code,
        ),

        index("challenges_status_idx").on(
            table.status,
        ),

        index("challenges_start_at_idx").on(
            table.startAt,
        ),
    ],
);

/* =========================================================
   PROBLEMS
========================================================= */

export const problems = pgTable(
    "problems",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        slug: varchar("slug", {
            length: 120,
        }).notNull(),

        title: varchar("title", {
            length: 200,
        }).notNull(),

        statement: text("statement").notNull(),

        difficulty: difficultyEnum("difficulty")
            .notNull(),

        points: integer("points")
            .notNull()
            .default(100),

        timeLimitMs: integer("time_limit_ms")
            .notNull()
            .default(2000),

        memoryLimitKb: integer("memory_limit_kb")
            .notNull()
            .default(262144),

        isPublished: boolean("is_published")
            .notNull()
            .default(false),

        createdBy: uuid("created_by")
            .notNull()
            .references(() => users.id),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        uniqueIndex("problems_slug_unique").on(
            table.slug,
        ),

        index("problems_difficulty_idx").on(
            table.difficulty,
        ),

        index("problems_published_idx").on(
            table.isPublished,
        ),
    ],
);

/* =========================================================
   TAGS
========================================================= */

export const tags = pgTable(
    "tags",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        name: varchar("name", {
            length: 50,
        }).notNull(),
    },
    (table) => [
        uniqueIndex("tags_name_unique").on(
            table.name,
        ),
    ],
);

export const problemTags = pgTable(
    "problem_tags",
    {
        problemId: uuid("problem_id")
            .notNull()
            .references(() => problems.id, {
                onDelete: "cascade",
            }),

        tagId: uuid("tag_id")
            .notNull()
            .references(() => tags.id, {
                onDelete: "cascade",
            }),
    },
    (table) => [
        primaryKey({
            columns: [
                table.problemId,
                table.tagId,
            ],
        }),
    ],
);

/* =========================================================
   TEST CASES
========================================================= */

export const testCases = pgTable(
    "test_cases",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        problemId: uuid("problem_id")
            .notNull()
            .references(() => problems.id, {
                onDelete: "cascade",
            }),

        input: text("input").notNull(),

        expectedOutput: text("expected_output").notNull(),

        isSample: boolean("is_sample")
            .notNull()
            .default(false),

        points: integer("points")
            .notNull()
            .default(0),

        orderIndex: integer("order_index")
            .notNull()
            .default(0),
    },
    (table) => [
        index("test_cases_problem_idx").on(
            table.problemId,
        ),

        index("test_cases_problem_order_idx").on(
            table.problemId,
            table.orderIndex,
        ),
    ],
);

/* =========================================================
   CHALLENGE ↔ PROBLEM
========================================================= */

export const challengeProblems = pgTable(
    "challenge_problems",
    {
        challengeId: uuid("challenge_id")
            .notNull()
            .references(() => challenges.id, {
                onDelete: "cascade",
            }),

        problemId: uuid("problem_id")
            .notNull()
            .references(() => problems.id),

        orderIndex: integer("order_index")
            .notNull()
            .default(0),
    },
    (table) => [
        primaryKey({
            columns: [
                table.challengeId,
                table.problemId,
            ],
        }),
    ],
);

/* =========================================================
   PARTICIPANTS
========================================================= */

export const challengeParticipants = pgTable(
    "challenge_participants",
    {
        challengeId: uuid("challenge_id")
            .notNull()
            .references(() => challenges.id, {
                onDelete: "cascade",
            }),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),

        joinedAt: timestamp("joined_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        primaryKey({
            columns: [
                table.challengeId,
                table.userId,
            ],
        }),
    ],
);

/* =========================================================
   PARTICIPANT SESSIONS
========================================================= */

export const participantSessions = pgTable(
    "participant_sessions",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        challengeId: uuid("challenge_id")
            .notNull()
            .references(() => challenges.id, {
                onDelete: "cascade",
            }),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),

        status: sessionStatusEnum("status")
            .notNull()
            .default("active"),

        strikes: integer("strikes")
            .notNull()
            .default(0),

        maxStrikes: integer("max_strikes")
            .notNull()
            .default(3),

        enteredAt: timestamp("entered_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        lastActiveAt: timestamp("last_active_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        terminatedAt: timestamp("terminated_at", {
            withTimezone: true,
        }),

        terminationReason: text("termination_reason"),
    },
    (table) => [
        uniqueIndex(
            "participant_sessions_challenge_user_unique",
        ).on(
            table.challengeId,
            table.userId,
        ),

        index("participant_sessions_challenge_idx").on(
            table.challengeId,
        ),
    ],
);

/* =========================================================
   SUBMISSIONS
========================================================= */

export const submissions = pgTable(
    "submissions",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        challengeId: uuid("challenge_id")
            .notNull()
            .references(() => challenges.id),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),

        problemId: uuid("problem_id")
            .notNull()
            .references(() => problems.id),

        language: varchar("language", {
            length: 30,
        }).notNull(),

        sourceCode: text("source_code")
            .notNull(),

        status: submissionStatusEnum("status")
            .notNull()
            .default("queued"),

        verificationEngine: varchar(
            "verification_engine",
            {
                length: 30,
            },
        ),

        discrepancyFlag: boolean(
            "discrepancy_flag",
        )
            .notNull()
            .default(false),

        discrepancyDetails: jsonb(
            "discrepancy_details",
        ),

        verificationNotes: text(
            "verification_notes",
        ),

        verifiedAt: timestamp(
            "verified_at",
            {
                withTimezone: true,
            },
        ),

        score: integer("score")
            .notNull()
            .default(0),

        executionTimeMs: integer(
            "execution_time_ms",
        ),

        memoryUsedKb: integer(
            "memory_used_kb",
        ),

        attemptNumber: integer(
            "attempt_number",
        ).notNull(),

        queueJobId: varchar(
            "queue_job_id",
            {
                length: 200,
            },
        ),

        submittedAt: timestamp(
            "submitted_at",
            {
                withTimezone: true,
            },
        )
            .notNull()
            .defaultNow(),

        judgedAt: timestamp(
            "judged_at",
            {
                withTimezone: true,
            },
        ),
    },
    (table) => [
        index("submissions_challenge_user_idx").on(
            table.challengeId,
            table.userId,
        ),

        index("submissions_problem_idx").on(
            table.problemId,
        ),

        index("submissions_user_time_idx").on(
            table.userId,
            table.submittedAt,
        ),

        index("submissions_status_idx").on(
            table.status,
        ),
    ],
);

/* =========================================================
   SUBMISSION RESULTS
========================================================= */

export const submissionResults = pgTable(
    "submission_results",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        submissionId: uuid(
            "submission_id",
        )
            .notNull()
            .references(() => submissions.id, {
                onDelete: "cascade",
            }),

        testCaseId: uuid(
            "test_case_id",
        )
            .notNull()
            .references(() => testCases.id),

        verdict: submissionStatusEnum(
            "verdict",
        ).notNull(),

        executionTimeMs: integer(
            "execution_time_ms",
        ),

        memoryUsedKb: integer(
            "memory_used_kb",
        ),

        stdout: text("stdout"),

        stderr: text("stderr"),
    },
    (table) => [
        uniqueIndex(
            "submission_results_submission_test_unique",
        ).on(
            table.submissionId,
            table.testCaseId,
        ),

        index("submission_results_submission_idx").on(
            table.submissionId,
        ),
    ],
);

/* =========================================================
   INTEGRITY EVENTS
========================================================= */

export const integrityEvents = pgTable(
    "integrity_events",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        challengeId: uuid("challenge_id")
            .notNull()
            .references(() => challenges.id, {
                onDelete: "cascade",
            }),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),

        eventType: integrityEventTypeEnum(
            "event_type",
        ).notNull(),

        details: jsonb("details"),

        timestamp: timestamp(
            "timestamp",
            {
                withTimezone: true,
            },
        )
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index(
            "integrity_events_challenge_user_time_idx",
        ).on(
            table.challengeId,
            table.userId,
            table.timestamp,
        ),

        index("integrity_events_type_idx").on(
            table.eventType,
        ),
    ],
);

/* =========================================================
   CODE SNAPSHOTS
========================================================= */

export const codeSnapshots = pgTable(
    "code_snapshots",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        challengeId: uuid("challenge_id")
            .notNull()
            .references(() => challenges.id, {
                onDelete: "cascade",
            }),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),

        problemId: uuid("problem_id")
            .notNull()
            .references(() => problems.id),

        code: text("code").notNull(),

        language: varchar("language", {
            length: 30,
        }).notNull(),

        capturedAt: timestamp(
            "captured_at",
            {
                withTimezone: true,
            },
        )
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("code_snapshots_lookup_idx").on(
            table.challengeId,
            table.userId,
            table.problemId,
            table.capturedAt,
        ),
    ],
);