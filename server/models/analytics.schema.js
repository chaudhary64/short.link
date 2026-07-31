import {
  pgTable,
  integer,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { linksTable } from "./links.schema.js";

export const clicksTable = pgTable(
  "clicks",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),

    link_id: integer("link_id")
      .references(() => linksTable.id, {
        onDelete: "CASCADE",
      })
      .notNull(),

    clicked_at: timestamp("clicked_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // ISO 3166-1 alpha-2 country code, e.g. "US"
    country: varchar("country", { length: 2 }),

    city: varchar("city", { length: 100 }),

    device_type: varchar("device_type", { length: 20 }),

    browser: varchar("browser", { length: 50 }),

    os: varchar("os", { length: 50 }),

    // Salted hash of the visitor IP — used to compute unique clicks
    visitor_hash: varchar("visitor_hash", { length: 64 }),
  },
  (table) => [
    index("clicks_link_id_idx").on(table.link_id),
    index("clicks_clicked_at_idx").on(table.clicked_at),
  ],
);
