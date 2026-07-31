import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import linkRouter from "./routes/links.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import redirectController from "./controllers/redirect/get.controller.js";
import checkCache from "./middlewares/cache.middleware.js";

const app = express();

// Behind a reverse proxy (Traefik in production) — trust the immediate hop so
// req.ip reflects the real client IP instead of the proxy's.
app.set("trust proxy", 1);

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim().replace(/\/$/, ""))
  : [];

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

app.use("/api/analytics", analyticsRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

// Must stay AFTER /health so the health check isn't swallowed by the catch-all
app.get("/:short_code", checkCache, redirectController);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

export default app;
