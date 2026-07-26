import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { createClient } from "redis";

const db = drizzle(process.env.DATABASE_URL);

const redisClient = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

export { redisClient };
export default db;
