ALTER TABLE "sessions" ADD COLUMN "rotated_at" timestamp;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "replaced_by" integer;