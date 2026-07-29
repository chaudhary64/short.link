import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import linkRouter from "./routes/links.routes.js";
import redirectController from "./controllers/redirect/get.controller.js";
import checkCache from "./middlewares/cache.middleware.js";

const app = express();

const allowedOrigins = process.env.CLIENT_URL

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.use("/api/links", linkRouter);

app.get("/:short_code", checkCache, redirectController);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

export default app;
