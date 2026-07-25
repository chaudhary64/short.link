import "dotenv/config";
import app from "./app.js";
import { client } from "./db/index.js";

const PORT = process.env.PORT || 3000;

client.on("error", (err) => console.error("Redis Client Error:", err));
client.on("connect", () => console.log("Connected to Redis successfully"));

const startServer = async () => {
  try {
    await client.connect();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();