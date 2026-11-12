import {
  pgTable,
  integer,
  varchar,
  char,
  text,
  timestamp,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./user.schema.js";

// Only the SHA-256 hash of a key is stored, so a database leak does not hand
// out working credentials. `prefix` is the short public fragment shown in the
// UI so a user can tell two keys apart without revealing either.
export const apiKeysTable = pgTable(
  "api_keys",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

    user_id: integer("user_id")
      .references(() => usersTable.id, {
        onDelete: "CASCADE",
      })
      .notNull(),

    name: varchar("name", { length: 80 }).notNull(),

    prefix: varchar("prefix", { length: 16 }).notNull(),

    key_hash: char("key_hash", { length: 64 }).notNull(),

    scopes: text("scopes").array().notNull(),

    last_used_at: timestamp("last_used_at", { withTimezone: true }),
    expires_at: timestamp("expires_at", { withTimezone: true }),
    revoked_at: timestamp("revoked_at", { withTimezone: true }),

    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("api_keys_key_hash_unique").on(table.key_hash),
    check(
      "api_keys_scopes_check",
      sql`${table.scopes} <@ ARRAY['read', 'write']::text[]`,
    ),
    check(
      "api_keys_scopes_not_empty",
      sql`array_length(${table.scopes}, 1) >= 1`,
    ),
  ],
);
