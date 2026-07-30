import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { createClient } from "redis";

const db = drizzle(process.env.DATABASE_URL);

const redisClient = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || undefined,
  },
});

export { redisClient };
export default db;
