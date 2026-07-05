import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import linkRouter from "./routes/links.routes.js";
import refreshController from "./controllers/refresh/get.controller.js";
import redirectController from "./controllers/redirect/get.controller.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/refresh", refreshController);

app.use("/auth", authRouter);

app.use("/links", linkRouter);

app.get("/:short_code", redirectController);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

export default app;
