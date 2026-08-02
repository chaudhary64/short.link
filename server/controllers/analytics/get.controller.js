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

export default async function getAnalyticsController(req, res) {
  try {
    const userId = req.user.id;

    const filters = {
      linkId: req.query.linkId ? Number(req.query.linkId) : null,
      country: req.query.country || null,
      device: req.query.device || null,
      from: parseDate(req.query.from),
      to: parseDate(req.query.to),
      tz: parseTz(req.query.tz),
    };

    // Default to the last 30 days when no date range is provided
    if (!filters.from && !filters.to) {
      const to = new Date();
      const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
      filters.to = to.toISOString().slice(0, 10);
      filters.from = from.toISOString().slice(0, 10);
    }

    const results = await Promise.allSettled([
      getSummary(userId, filters),
      getClicksOverTime(userId, filters),
      getTopCountries(userId, filters),
      getDeviceBreakdown(userId, filters),
      getBrowserBreakdown(userId, filters),
      getOsBreakdown(userId, filters),
      getTopLinks(userId, filters),
      getTimeline(userId, filters),
      getFilterOptions(userId),
    ]);

    // Log any rejected queries for debugging
    results.forEach((r, i) => {
      if (r.status === "rejected")
        console.error(`[analytics] Query ${i} failed:`, r.reason);
    });

    // Helper to unwrap a settled promise or return a safe default
    const ok = (i, fallback) =>
      results[i].status === "fulfilled" ? results[i].value : fallback;

    res.status(200).json({
      summary: ok(0, { clicks: 0, uniqueClicks: 0 }),
      clicksOverTime: ok(1, []),
      topCountries: ok(2, []),
      devices: ok(3, []),
      browsers: ok(4, []),
      os: ok(5, []),
      topLinks: ok(6, []),
      timeline: ok(7, []),
      filters: (() => {
        const f = ok(8, { countries: [] });
        return { from: filters.from, to: filters.to, countries: f.countries };
      })(),
    });
  } catch (error) {
    console.error("[analytics] Error fetching analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
