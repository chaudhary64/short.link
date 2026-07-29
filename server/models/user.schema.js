import { pgTable, integer, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  gender: varchar("gender", { length: 20 }),
  password: varchar("password", { length: 255 }),
  auth_provider: varchar("auth_provider", { length: 50 })
    .default("local")
    .notNull(),
  provider_id: varchar("provider_id", { length: 255 }),
  is_verified: boolean("is_verified").default(false).notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
