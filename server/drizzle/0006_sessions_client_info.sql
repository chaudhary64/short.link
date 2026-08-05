ALTER TABLE "sessions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "browser" varchar(64);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "os" varchar(64);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "device_type" varchar(16);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "country" varchar(2);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "city" varchar(128);