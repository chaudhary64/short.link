import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { createClient } from "redis";

const db = drizzle(process.env.DATABASE_URL);

export default db;

export const client = createClient();
