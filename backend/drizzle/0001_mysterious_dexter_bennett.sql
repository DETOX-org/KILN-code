ALTER TYPE "public"."challenge_status" ADD VALUE 'ended' BEFORE 'archived';--> statement-breakpoint
ALTER TYPE "public"."challenge_status" ADD VALUE 'finalized' BEFORE 'archived';--> statement-breakpoint
ALTER TYPE "public"."challenge_status" ADD VALUE 'pending_finalization' BEFORE 'archived';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student'::text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'instructor', 'admin');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "code" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "duration_minutes" integer DEFAULT 45 NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "points" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "rules" jsonb DEFAULT '{"fullscreenEnforced":true,"maxStrikes":3,"blockExternalPaste":true,"autoSaveIntervalSec":10}'::jsonb NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "challenges_code_unique" ON "challenges" USING btree ("code");