import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  createLink,
  getAllLinksByUserId,
  getLinkById,
  getLinkByShortCode,
  updateLink,
} from "../repositories/links.repository.js";
import {
  getClicksOverTime,
  getSummary,
  getTopCountries,
  getTopLinks,
} from "../repositories/analytics.repository.js";

const SHORT_CODE_PATTERN = /^[a-zA-Z0-9_-]{1,21}$/;
const DEFAULT_LINK_LIMIT = 25;
const MAX_LINK_LIMIT = 100;

const ok = (value) => ({
  content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
});

const fail = (message) => ({
  isError: true,
  content: [{ type: "text", text: message }],
});

const toShortUrl = (baseUrl, code) => `${baseUrl}/${code}`;

const parseHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.href
      : null;
  } catch {
    return null;
  }
};

const generateShortCode = () => {
  const configured = parseInt(process.env.NANOID_SIZE, 10);
  const size = configured > 0 ? Math.min(configured, 21) : undefined;
  return nanoid(size);
};

const isoDate = (date) => date.toISOString().slice(0, 10);

const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: isoDate(from), to: isoDate(to) };
};

const presentLink = (baseUrl) => (link) => ({
  id: link.id,
  short_url: toShortUrl(baseUrl, link.short_code),
  short_code: link.short_code,
  destination: link.original_url,
  status: link.status,
  created_at: link.created_at,
  ...(link.clicks !== undefined ? { clicks: link.clicks } : {}),
  ...(link.last_click_at ? { last_click_at: link.last_click_at } : {}),
});

/**
 * Builds an MCP server bound to one authenticated credential. Every tool acts
 * as that user, so ownership and scope checks stay in one place: the caller
 * cannot ask for another user's links, only for its own.
 */
export function createMcpServer({ userId, scopes, baseUrl }) {
  const canWrite = scopes.includes("write");
  const canRead = scopes.includes("read");

  const server = new McpServer(
    { name: "short.link", version: "1.0.0" },
    {
      instructions:
        "Tools for short.link. Use create_short_link to make a new short URL, list_links to see existing ones, get_analytics for click data, and update_destination to repoint a link without changing its short code.",
    },
  );

  server.registerTool(
    "create_short_link",
    {
      title: "Create short link",
      description:
        "Shorten a destination URL. Returns the short code and the full short URL. Requires the write scope.",
      inputSchema: {
        originalUrl: z
          .string()
          .describe("Absolute http(s) URL to send visitors to"),
        shortCode: z
          .string()
          .regex(SHORT_CODE_PATTERN)
          .optional()
          .describe(
            "Optional custom code, 1-21 characters of letters, numbers, dashes or underscores",
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ originalUrl, shortCode }) => {
      if (!canWrite) {
        return fail(
          'This API key is read-only. Ask the account owner for a key with the "write" scope.',
        );
      }

      try {
        const destination = parseHttpUrl(originalUrl);
        if (!destination) {
          return fail(
            "originalUrl must be an absolute http:// or https:// URL.",
          );
        }

        const code = shortCode ?? generateShortCode();

        if (shortCode) {
          const existing = await getLinkByShortCode(code);
          if (existing) {
            return fail(
              `The short code "${code}" is already taken. Try another one.`,
            );
          }
        }

        const link = await createLink(userId, destination, code);

        return ok(presentLink(baseUrl)(link));
      } catch (error) {
        console.error("[mcp] create_short_link failed:", error);
        return fail("Could not create the link. Please try again.");
      }
    },
  );

  server.registerTool(
    "list_links",
    {
      title: "List links",
      description:
        "List this account's short links with their destinations, status and click counts. Requires the read scope.",
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(MAX_LINK_LIMIT)
          .optional()
          .describe(`How many links to return (default ${DEFAULT_LINK_LIMIT})`),
        status: z
          .enum(["active", "disabled"])
          .optional()
          .describe("Only return links in this state"),
        query: z
          .string()
          .optional()
          .describe("Case-insensitive match on the code or destination"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ limit, status, query }) => {
      if (!canRead) {
        return fail(
          'This API key is write-only. Ask the account owner for a key with the "read" scope.',
        );
      }

      try {
        const all = await getAllLinksByUserId(userId);
        const needle = query?.trim().toLowerCase();

        const filtered = all.filter((link) => {
          if (status && link.status !== status) return false;
          if (!needle) return true;
          return (
            link.short_code.toLowerCase().includes(needle) ||
            link.original_url.toLowerCase().includes(needle)
          );
        });

        const take = limit ?? DEFAULT_LINK_LIMIT;

        return ok({
          total: filtered.length,
          returned: Math.min(take, filtered.length),
          links: filtered.slice(0, take).map(presentLink(baseUrl)),
        });
      } catch (error) {
        console.error("[mcp] list_links failed:", error);
        return fail("Could not list links. Please try again.");
      }
    },
  );

  server.registerTool(
    "get_analytics",
    {
      title: "Get analytics",
      description:
        "Click totals, top links and top countries for a date range. Defaults to the last 30 days. Requires the read scope.",
      inputSchema: {
        from: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .describe("Start date, YYYY-MM-DD"),
        to: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .describe("End date, YYYY-MM-DD"),
        linkId: z
          .number()
          .int()
          .optional()
          .describe("Restrict the numbers to one link id"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ from, to, linkId }) => {
      if (!canRead) {
        return fail(
          'This API key is write-only. Ask the account owner for a key with the "read" scope.',
        );
      }

      try {
        const range = defaultRange();
        const filters = {
          linkId: linkId ?? null,
          country: null,
          device: null,
          from: from ?? range.from,
          to: to ?? range.to,
          day: null,
          tz: "UTC",
          q: null,
        };

        const [summary, links, countries, timeline] = await Promise.all([
          getSummary(userId, filters),
          getTopLinks(userId, filters),
          getTopCountries(userId, filters),
          getClicksOverTime(userId, filters),
        ]);

        return ok({
          range: { from: filters.from, to: filters.to, linkId: filters.linkId },
          summary,
          links: links.slice(0, 10).map(presentLink(baseUrl)),
          countries: countries.slice(0, 10),
          daily: timeline,
        });
      } catch (error) {
        console.error("[mcp] get_analytics failed:", error);
        return fail("Could not load analytics. Please try again.");
      }
    },
  );

  server.registerTool(
    "update_destination",
    {
      title: "Update destination",
      description:
        "Repoint an existing link to a new destination. The short code stays the same. Requires the write scope.",
      inputSchema: {
        linkId: z.number().int().positive().describe("Id from list_links"),
        originalUrl: z
          .string()
          .describe("New absolute http(s) URL to send visitors to"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ linkId, originalUrl }) => {
      if (!canWrite) {
        return fail(
          'This API key is read-only. Ask the account owner for a key with the "write" scope.',
        );
      }

      try {
        const destination = parseHttpUrl(originalUrl);
        if (!destination) {
          return fail(
            "originalUrl must be an absolute http:// or https:// URL.",
          );
        }

        const existing = await getLinkById(linkId);
        if (!existing || existing.user_id !== userId) {
          return fail(`No link with id ${linkId} belongs to this account.`);
        }

        const link = await updateLink(linkId, { original_url: destination });

        return ok(presentLink(baseUrl)(link));
      } catch (error) {
        console.error("[mcp] update_destination failed:", error);
        return fail("Could not update the link. Please try again.");
      }
    },
  );

  return server;
}
