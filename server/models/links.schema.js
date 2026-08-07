import {
  pgTable,
  integer,
  varchar,
  char,
  text,
  unique,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./user.schema.js";

export const linksTable = pgTable(
  "links",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

    user_id: integer("user_id")
      .references(() => usersTable.id, {
        onDelete: "CASCADE",
      })
      .notNull(),

    original_url: text("original_url").notNull(),

    url_hash: char("url_hash", { length: 32 })
      .generatedAlwaysAs(sql`md5(original_url)`)
      .notNull(),

    short_code: varchar("short_code", { length: 21 }).notNull().unique(),

    status: varchar("status", { length: 20 }).default("active").notNull(),

    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("user_url_unique").on(table.user_id, table.url_hash),
    check("status_check", sql`${table.status} IN ('active', 'disabled')`),
  ],
);
