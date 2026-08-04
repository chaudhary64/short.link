import {
  getSummary,
  getClicksOverTime,
  getTopCountries,
  getDeviceBreakdown,
  getBrowserBreakdown,
  getOsBreakdown,
  getTopLinks,
  getTimeline,
  getFilterOptions,
} from "../../repositories/analytics.repository.js";

const parseDate = (value) => {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const dt = new Date(y, m - 1, d);
  const valid =
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  return valid ? value : null;
};

const parseTz = (value) => {
  if (typeof value !== "string") return "UTC";
  if (!/^[A-Za-z0-9_+\-]+(?:\/[A-Za-z0-9_+\-]+)*$/.test(value)) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return value;
  } catch {
    return "UTC";
  }
};

const parseView = (value) => {
  const views = ["overview", "geography", "technology", "links", "timeline"];
  return views.includes(value) ? value : "overview";
};

const parseLimit = (value) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return 25;
  return Math.min(n, 500);
};

const parseSearch = (value) => {
  if (typeof value !== "string") return null;
  const q = value.trim().slice(0, 100);
  return q || null;
};

const SECTIONS = {
  overview: ["summary", "clicksOverTime", "filters"],
  geography: ["summary", "clicksOverTime", "topCountries", "filters"],
  technology: ["summary", "clicksOverTime", "devices", "browsers", "os", "filters"],
  links: ["summary", "clicksOverTime", "topLinks", "filters"],
  timeline: ["summary", "clicksOverTime", "timeline", "filters"],
};

const QUERY_MAP = {
  summary: getSummary,
  clicksOverTime: getClicksOverTime,
  topCountries: getTopCountries,
  devices: getDeviceBreakdown,
  browsers: getBrowserBreakdown,
  os: getOsBreakdown,
  topLinks: getTopLinks,
  timeline: getTimeline,
  filters: getFilterOptions,
};

export default async function getAnalyticsController(req, res) {
  try {
    const userId = req.user.id;

    const filters = {
      linkId: req.query.linkId ? Number(req.query.linkId) : null,
      country: req.query.country || null,
      device: req.query.device || null,
      from: parseDate(req.query.from),
      to: parseDate(req.query.to),
      day: parseDate(req.query.day),
      tz: parseTz(req.query.tz),
      q: parseSearch(req.query.q),
    };

    if (!filters.from && !filters.to) {
      const to = new Date();
      const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
      filters.to = to.toISOString().slice(0, 10);
      filters.from = from.toISOString().slice(0, 10);
    }

    const view = parseView(req.query.view);
    const limit = parseLimit(req.query.limit);

    const run = SECTIONS[view] ?? SECTIONS.overview;
    const queries = run.map((name) => {
      if (name === "timeline") return getTimeline(userId, filters, limit);
      return QUERY_MAP[name](userId, filters);
    });

    const results = await Promise.allSettled(queries);

    results.forEach((r, i) => {
      if (r.status === "rejected")
        console.error(`[analytics] Query ${run[i]} failed:`, r.reason);
    });

    const ok = (i, fallback) =>
      results[i]?.status === "fulfilled" ? results[i].value : fallback;

    const response = {
      view,
      day: filters.day ?? null,
      summary: ok(run.indexOf("summary"), { clicks: 0, uniqueClicks: 0 }),
      filters: {
        from: filters.from,
        to: filters.to,
        countries: ok(run.indexOf("filters"), { countries: [] }).countries ?? [],
      },
    };

    for (const name of [
      "clicksOverTime",
      "topCountries",
      "devices",
      "browsers",
      "os",
      "topLinks",
      "timeline",
    ]) {
      if (run.includes(name)) {
        response[name] = ok(run.indexOf(name), []);
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("[analytics] Error fetching analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
