import {
  pgTable,
  integer,
  varchar,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const usersTable = pgTable(
  "users",
  {
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
    password_changed_at: timestamp("password_changed_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    uniqueIndex("users_email_lower_unique").on(sql`lower(${table.email})`),

    uniqueIndex("users_provider_id_unique")
      .on(table.provider_id)
      .where(sql`${table.provider_id} IS NOT NULL`),
  ],
);
