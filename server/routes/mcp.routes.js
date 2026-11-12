import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import rateLimit from "../middlewares/rateLimit.middleware.js";
import { createMcpServer } from "../mcp/server.js";

const mcpRouter = express.Router();

// One key per minute budget is plenty for tool calls and keeps a runaway agent
// from hammering the API.
const mcpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  keyFn: (req) => req.apiKey?.id ?? req.ip,
  message: "Too many MCP requests. Slow down and try again.",
});

const publicBaseUrl = (req) =>
  (process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`).replace(
    /\/$/,
    "",
  );

mcpRouter.use(authenticateMiddleware);

// /mcp is for machines. A browser session has no scopes, so it is refused
// rather than silently granted full access.
mcpRouter.use((req, res, next) => {
  if (!req.apiKey) {
    return res
      .status(401)
      .json({ message: "Unauthorized: /mcp requires an API key" });
  }
  next();
});

mcpRouter.use(mcpLimiter);

mcpRouter.post("/", async (req, res) => {
  const server = createMcpServer({
    userId: req.user.id,
    scopes: req.apiKey.scopes,
    baseUrl: publicBaseUrl(req),
  });

  // Stateless: one server and transport per request, no session to leak.
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("[mcp] request failed:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

const methodNotAllowed = (req, res) =>
  res.status(405).json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "This stateless MCP endpoint only accepts POST",
    },
    id: null,
  });

mcpRouter.get("/", methodNotAllowed);
mcpRouter.delete("/", methodNotAllowed);

export default mcpRouter;
