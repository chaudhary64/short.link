import {
  pgTable,
  bigint,
  integer,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { linksTable } from "./links.schema.js";

export const clicksTable = pgTable(
  "clicks",
  {
    id: bigint("id", { mode: "number" })
      .generatedAlwaysAsIdentity()
      .primaryKey(),

    link_id: integer("link_id")
      .references(() => linksTable.id, {
        onDelete: "CASCADE",
      })
      .notNull(),

    clicked_at: timestamp("clicked_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    country: varchar("country", { length: 2 }),

    city: varchar("city", { length: 100 }),

    device_type: varchar("device_type", { length: 20 }),

    browser: varchar("browser", { length: 50 }),

    os: varchar("os", { length: 50 }),

    visitor_hash: varchar("visitor_hash", { length: 64 }),
  },
  (table) => [
    index("clicks_link_id_idx").on(table.link_id),
    index("clicks_clicked_at_idx").on(table.clicked_at),
  ],
);
