-- 0004: P0 schema hardening
--
-- 1. Refresh tokens are now stored as sha256 hex digests (64 chars) instead of
--    plaintext JWTs. Existing rows must be hashed in place BEFORE the column is
--    shrunk to varchar(64), otherwise the ALTER fails on the first long token.
--> statement-breakpoint
UPDATE "sessions"
SET "refresh_token" = encode(sha256("refresh_token"::bytea), 'hex')
WHERE length("refresh_token") <> 64;
--> statement-breakpoint
-- Drop the old (user_id, original_url) unique constraint; original_url becomes
-- unbounded text and uniqueness moves to the generated md5 url_hash column.
ALTER TABLE "links" DROP CONSTRAINT "user_url_unique";--> statement-breakpoint
-- clicks.id overflows integer at ~2.1B rows; widen to bigint (identity
-- sequence max value follows automatically).
ALTER TABLE "clicks" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "clicks" ALTER COLUMN "id" SET MAXVALUE 9223372036854775807;--> statement-breakpoint
-- Allow URLs longer than 255 chars.
ALTER TABLE "links" ALTER COLUMN "original_url" SET DATA TYPE text;--> statement-breakpoint
-- short_code only ever holds nanoid output (<=21 chars by default). NOTE: this
-- fails if any existing short_code is longer than 21 chars (e.g. a past
-- NANOID_SIZE > 21). Run `SELECT max(length(short_code)) FROM links;` first.
ALTER TABLE "links" ALTER COLUMN "short_code" SET DATA TYPE varchar(21);--> statement-breakpoint
-- Now safe: all tokens are exactly 64 hex chars.
ALTER TABLE "sessions" ALTER COLUMN "refresh_token" SET DATA TYPE varchar(64);--> statement-breakpoint
-- Generated column backfills every existing row automatically.
ALTER TABLE "links" ADD COLUMN "url_hash" char(32) GENERATED ALWAYS AS (md5(original_url)) STORED NOT NULL;--> statement-breakpoint
-- Case-insensitive email uniqueness. NOTE: fails if existing data contains
-- emails that differ only by case — dedupe before applying (keep one row per
-- lower(email)).
CREATE UNIQUE INDEX "users_email_lower_unique" ON "users" USING btree (lower("email"));--> statement-breakpoint
-- One Google account per user; only indexed where provider_id is set.
CREATE UNIQUE INDEX "users_provider_id_unique" ON "users" USING btree ("provider_id") WHERE "users"."provider_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "user_url_unique" UNIQUE("user_id","url_hash");--> statement-breakpoint
-- Dedupe before adding the unique constraint: pre-jti refresh tokens minted in
-- the same second were byte-identical, so their backfill hashes collide here.
-- Keeps the newest session per token — no logged-in user is affected.
DELETE FROM sessions a
USING sessions b
WHERE a.refresh_token = b.refresh_token AND a.session_id < b.session_id;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_refresh_token_unique" UNIQUE("refresh_token");
