import "dotenv/config";
import app from "./app.js";
import { redisClient } from "./db/index.js";

const PORT = process.env.PORT || 3000;

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () => console.log("Connected to Redis successfully"));

const startServer = async () => {
  try {
    await redisClient.connect();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();