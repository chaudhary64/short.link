import { pgTable, integer, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema.js";

export const sessionsTable = pgTable("sessions", {
  session_id: integer("session_id").generatedAlwaysAsIdentity().primaryKey(),

  user_id: integer("user_id")
    .references(() => usersTable.id, {
      onDelete: "CASCADE",
    })
    .notNull(),

  refresh_token: varchar("refresh_token", { length: 255 }).notNull(),

  user_agent: varchar("user_agent", { length: 255 }).notNull(),
});
