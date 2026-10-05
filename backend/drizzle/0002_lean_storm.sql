ALTER TABLE "submissions" ADD COLUMN "verification_engine" varchar(30);--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "discrepancy_flag" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "discrepancy_details" jsonb;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "verification_notes" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "verified_at" timestamp with time zone;