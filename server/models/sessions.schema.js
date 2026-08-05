import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema.js";

export const sessionsTable = pgTable("sessions", {
  session_id: integer("session_id").generatedAlwaysAsIdentity().primaryKey(),

  user_id: integer("user_id")
    .references(() => usersTable.id, {
      onDelete: "CASCADE",
    })
    .notNull(),

  // sha256 hex digest of the refresh token — the raw token is never stored.
  refresh_token: varchar("refresh_token", { length: 64 }).notNull().unique(),

  user_agent: varchar("user_agent", { length: 255 }).notNull(),

  created_at: timestamp("created_at").defaultNow().notNull(),

  // Best-effort device + location captured at session creation.
  browser: varchar("browser", { length: 64 }),
  os: varchar("os", { length: 64 }),
  device_type: varchar("device_type", { length: 16 }),
  country: varchar("country", { length: 2 }),
  city: varchar("city", { length: 128 }),
});
