CREATE TYPE "public"."challenge_status" AS ENUM('draft', 'scheduled', 'registration_open', 'live', 'submission_closed', 'evaluation_complete', 'results_published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."difficulty_level" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."integrity_event_type" AS ENUM('FULLSCREEN_ENTER', 'FULLSCREEN_EXIT', 'WINDOW_BLUR', 'TAB_SWITCH', 'DEVTOOLS_OPEN_ATTEMPT', 'EXTERNAL_PASTE_BLOCKED', 'INTERNAL_PASTE_ALLOWED', 'BURST_TYPING_FLAGGED', 'ESCAPE_KEY_PRESSED');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('active', 'strike_warning', 'submitted', 'terminated', 'disqualified');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('queued', 'running', 'accepted', 'wrong_answer', 'compilation_error', 'runtime_error', 'time_limit_exceeded', 'memory_limit_exceeded', 'system_error');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('participant', 'admin');--> statement-breakpoint
CREATE TABLE "challenge_participants" (
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "challenge_participants_challenge_id_user_id_pk" PRIMARY KEY("challenge_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "challenge_problems" (
	"challenge_id" uuid NOT NULL,
	"problem_id" uuid NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "challenge_problems_challenge_id_problem_id_pk" PRIMARY KEY("challenge_id","problem_id")
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"status" "challenge_status" DEFAULT 'draft' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"problem_id" uuid NOT NULL,
	"code" text NOT NULL,
	"language" varchar(30) NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" "integrity_event_type" NOT NULL,
	"details" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participant_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "session_status" DEFAULT 'active' NOT NULL,
	"strikes" integer DEFAULT 0 NOT NULL,
	"max_strikes" integer DEFAULT 3 NOT NULL,
	"entered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"terminated_at" timestamp with time zone,
	"termination_reason" text
);
--> statement-breakpoint
CREATE TABLE "problem_tags" (
	"problem_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "problem_tags_problem_id_tag_id_pk" PRIMARY KEY("problem_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(200) NOT NULL,
	"statement" text NOT NULL,
	"difficulty" "difficulty_level" NOT NULL,
	"points" integer DEFAULT 100 NOT NULL,
	"time_limit_ms" integer DEFAULT 2000 NOT NULL,
	"memory_limit_kb" integer DEFAULT 262144 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"test_case_id" uuid NOT NULL,
	"verdict" "submission_status" NOT NULL,
	"execution_time_ms" integer,
	"memory_used_kb" integer,
	"stdout" text,
	"stderr" text
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"problem_id" uuid NOT NULL,
	"language" varchar(30) NOT NULL,
	"source_code" text NOT NULL,
	"status" "submission_status" DEFAULT 'queued' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"execution_time_ms" integer,
	"memory_used_kb" integer,
	"attempt_number" integer NOT NULL,
	"queue_job_id" varchar(200),
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"judged_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"input" text NOT NULL,
	"expected_output" text NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'participant' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_problems" ADD CONSTRAINT "challenge_problems_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_problems" ADD CONSTRAINT "challenge_problems_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_snapshots" ADD CONSTRAINT "code_snapshots_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_snapshots" ADD CONSTRAINT "code_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_snapshots" ADD CONSTRAINT "code_snapshots_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrity_events" ADD CONSTRAINT "integrity_events_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrity_events" ADD CONSTRAINT "integrity_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_sessions" ADD CONSTRAINT "participant_sessions_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_sessions" ADD CONSTRAINT "participant_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_tags" ADD CONSTRAINT "problem_tags_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_tags" ADD CONSTRAINT "problem_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_results" ADD CONSTRAINT "submission_results_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_results" ADD CONSTRAINT "submission_results_test_case_id_test_cases_id_fk" FOREIGN KEY ("test_case_id") REFERENCES "public"."test_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "challenges_slug_unique" ON "challenges" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "challenges_status_idx" ON "challenges" USING btree ("status");--> statement-breakpoint
CREATE INDEX "challenges_start_at_idx" ON "challenges" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "code_snapshots_lookup_idx" ON "code_snapshots" USING btree ("challenge_id","user_id","problem_id","captured_at");--> statement-breakpoint
CREATE INDEX "integrity_events_challenge_user_time_idx" ON "integrity_events" USING btree ("challenge_id","user_id","timestamp");--> statement-breakpoint
CREATE INDEX "integrity_events_type_idx" ON "integrity_events" USING btree ("event_type");--> statement-breakpoint
CREATE UNIQUE INDEX "participant_sessions_challenge_user_unique" ON "participant_sessions" USING btree ("challenge_id","user_id");--> statement-breakpoint
CREATE INDEX "participant_sessions_challenge_idx" ON "participant_sessions" USING btree ("challenge_id");--> statement-breakpoint
CREATE UNIQUE INDEX "problems_slug_unique" ON "problems" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "problems_difficulty_idx" ON "problems" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "problems_published_idx" ON "problems" USING btree ("is_published");--> statement-breakpoint
CREATE UNIQUE INDEX "submission_results_submission_test_unique" ON "submission_results" USING btree ("submission_id","test_case_id");--> statement-breakpoint
CREATE INDEX "submission_results_submission_idx" ON "submission_results" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "submissions_challenge_user_idx" ON "submissions" USING btree ("challenge_id","user_id");--> statement-breakpoint
CREATE INDEX "submissions_problem_idx" ON "submissions" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "submissions_user_time_idx" ON "submissions" USING btree ("user_id","submitted_at");--> statement-breakpoint
CREATE INDEX "submissions_status_idx" ON "submissions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_unique" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "test_cases_problem_idx" ON "test_cases" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "test_cases_problem_order_idx" ON "test_cases" USING btree ("problem_id","order_index");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");