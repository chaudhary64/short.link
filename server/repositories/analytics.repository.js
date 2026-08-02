import db from "../db/index.js";
import { clicksTable } from "../models/analytics.schema.js";
import { linksTable } from "../models/links.schema.js";
import { and, eq, sql, desc, isNotNull } from "drizzle-orm";
import { getClientInfo } from "../utils/clientInfo.js";

const tzLiteral = (tz) => {
  const safe =
    typeof tz === "string" && /^[A-Za-z0-9_+\-]+(?:\/[A-Za-z0-9_+\-]+)*$/.test(tz)
      ? tz
      : "UTC";
  return sql.raw(`'${safe}'`);
};

const normalizeFilters = (filters = {}) => {
  const conditions = [];

  if (filters.linkId) conditions.push(eq(clicksTable.link_id, Number(filters.linkId)));
  if (filters.country) conditions.push(eq(clicksTable.country, filters.country));
  if (filters.device) conditions.push(eq(clicksTable.device_type, filters.device));

  const tz = filters.tz || "UTC";
  if (filters.from) {
    conditions.push(sql`${clicksTable.clicked_at} >= (${filters.from}::date AT TIME ZONE ${tzLiteral(tz)})`);
  }
  if (filters.to) {
    conditions.push(sql`${clicksTable.clicked_at} < ((${filters.to}::date + 1) AT TIME ZONE ${tzLiteral(tz)})`);
  }

  return conditions.length ? and(...conditions) : undefined;
};

/** Record a single click. linkId must be a real DB link id. */
async function recordClick(linkId, clickData) {
  try {
    await db.insert(clicksTable).values({
      link_id: linkId,
      country: clickData.country || null,
      city: clickData.city || null,
      device_type: clickData.device_type || null,
      browser: clickData.browser || null,
      os: clickData.os || null,
      visitor_hash: clickData.visitor_hash || null,
    });
  } catch (error) {
    console.error("[analytics] Failed to record click:", error);
  }
}

/**
 * Record a click for a known link id. Fire-and-forget: any failure is
 * logged and never blocks the redirect.
 */
async function recordClickForLink(linkId, req) {
  try {
    await recordClick(linkId, getClientInfo(req));
  } catch (error) {
    console.error("[analytics] Failed to record click:", error);
  }
}


async function getSummary(userId, filters) {
  const where = and(
    sql`${clicksTable.link_id} IN (SELECT ${linksTable.id} FROM ${linksTable} WHERE ${linksTable.user_id} = ${userId})`,
    normalizeFilters(filters),
  );

  const [row] = await db
    .select({
      clicks: sql`count(*)::int`,
      uniqueClicks: sql`count(distinct ${clicksTable.visitor_hash})::int`,
    })
    .from(clicksTable)
    .where(where);

  return {
    clicks: row?.clicks ?? 0,
    uniqueClicks: row?.uniqueClicks ?? 0,
  };
}

async function getClicksOverTime(userId, filters) {
  const where = and(
    sql`${clicksTable.link_id} IN (SELECT ${linksTable.id} FROM ${linksTable} WHERE ${linksTable.user_id} = ${userId})`,
    normalizeFilters(filters),
  );

  const tz = filters.tz || "UTC";
  const dayExpr = sql`date_trunc('day', ${clicksTable.clicked_at} AT TIME ZONE ${tzLiteral(tz)})`;
  const rows = await db
    .select({
      date: sql`to_char(${dayExpr}, 'YYYY-MM-DD')`,
      clicks: sql`count(*)::int`,
      visitors: sql`count(distinct ${clicksTable.visitor_hash})::int`,
    })
    .from(clicksTable)
    .where(where)
    .groupBy(dayExpr)
    .orderBy(dayExpr);

  return rows.map((r) => ({ date: r.date, clicks: r.clicks, visitors: r.visitors }));
}

async function getTopCountries(userId, filters) {
  const where = and(
    sql`${clicksTable.link_id} IN (SELECT ${linksTable.id} FROM ${linksTable} WHERE ${linksTable.user_id} = ${userId})`,
    normalizeFilters(filters),
    isNotNull(clicksTable.country),
  );

  return db
    .select({
      country: clicksTable.country,
      clicks: sql`count(*)::int`,
    })
    .from(clicksTable)
    .where(where)
    .groupBy(clicksTable.country)
    .orderBy(desc(sql`count(*)`))
    .limit(12);
}

async function getDeviceBreakdown(userId, filters) {
  const where = and(
    sql`${clicksTable.link_id} IN (SELECT ${linksTable.id} FROM ${linksTable} WHERE ${linksTable.user_id} = ${userId})`,
    normalizeFilters(filters),
    isNotNull(clicksTable.device_type),
  );

  return db
    .select({
      label: clicksTable.device_type,
      clicks: sql`count(*)::int`,
    })
    .from(clicksTable)
    .where(where)
    .groupBy(clicksTable.device_type)
    .orderBy(desc(sql`count(*)`));
}

async function getBrowserBreakdown(userId, filters) {
  const where = and(
    sql`${clicksTable.link_id} IN (SELECT ${linksTable.id} FROM ${linksTable} WHERE ${linksTable.user_id} = ${userId})`,
    normalizeFilters(filters),
    isNotNull(clicksTable.browser),
  );

  return db
    .select({
      label: clicksTable.browser,
      clicks: sql`count(*)::int`,
    })
    .from(clicksTable)
    .where(where)
    .groupBy(clicksTable.browser)
    .orderBy(desc(sql`count(*)`));
}

async function getOsBreakdown(userId, filters) {
  const where = and(
    sql`${clicksTable.link_id} IN (SELECT ${linksTable.id} FROM ${linksTable} WHERE ${linksTable.user_id} = ${userId})`,
    normalizeFilters(filters),
    isNotNull(clicksTable.os),
  );

  return db
    .select({
      label: clicksTable.os,
      clicks: sql`count(*)::int`,
    })
    .from(clicksTable)
    .where(where)
    .groupBy(clicksTable.os)
    .orderBy(desc(sql`count(*)`));
}

async function getTopLinks(userId, filters) {
  // Build join condition: always match link_id, plus any click-level filters
  // (country, device, date range). linkId is applied on linksTable
  // so that the LEFT JOIN isn't broken by clicksTable conditions.
  const tz = filters.tz || "UTC";
  const clickFilters = [];
  if (filters.country) clickFilters.push(eq(clicksTable.country, filters.country));
  if (filters.device) clickFilters.push(eq(clicksTable.device_type, filters.device));
  if (filters.from) clickFilters.push(sql`${clicksTable.clicked_at} >= (${filters.from}::date AT TIME ZONE ${tzLiteral(tz)})`);
  if (filters.to) clickFilters.push(sql`${clicksTable.clicked_at} < ((${filters.to}::date + 1) AT TIME ZONE ${tzLiteral(tz)})`);

  const linkConditions = [eq(linksTable.user_id, userId)];
  if (filters.linkId && !isNaN(filters.linkId)) {
    linkConditions.push(eq(linksTable.id, Number(filters.linkId)));
  }

  // Click-level filters belong in the LEFT JOIN's ON clause — putting them in
  // WHERE would collapse the join to an inner join and drop links that have no
  // clicks matching the filters (e.g. every link with 0 clicks in the period).
  const clickJoin = clickFilters.length
    ? and(eq(clicksTable.link_id, linksTable.id), ...clickFilters)
    : eq(clicksTable.link_id, linksTable.id);

  const rows = await db
    .select({
      id: linksTable.id,
      short_code: linksTable.short_code,
      original_url: linksTable.original_url,
      status: linksTable.status,
      created_at: linksTable.created_at,
      clicks: sql`count(${clicksTable.id})::int`,
      unique: sql`count(distinct ${clicksTable.visitor_hash})::int`,
      countries: sql`count(distinct ${clicksTable.country})::int`,
      last_click_at: sql`max(${clicksTable.clicked_at})`,
    })
    .from(linksTable)
    .leftJoin(clicksTable, clickJoin)
    .where(and(...linkConditions))
    .groupBy(
      linksTable.id,
      linksTable.short_code,
      linksTable.original_url,
      linksTable.status,
      linksTable.created_at,
    )
    .orderBy(desc(sql`count(${clicksTable.id})`))
    .limit(50);

  return rows.map((r) => ({
    ...r,
    ctr: r.clicks > 0 ? Number(((r.unique / r.clicks) * 100).toFixed(1)) : 0,
  }));
}

async function getTimeline(userId, filters, limit = 25) {
  const where = and(
    sql`${clicksTable.link_id} IN (SELECT ${linksTable.id} FROM ${linksTable} WHERE ${linksTable.user_id} = ${userId})`,
    normalizeFilters(filters),
  );

  return db
    .select({
      id: clicksTable.id,
      clicked_at: clicksTable.clicked_at,
      country: clicksTable.country,
      city: clicksTable.city,
      browser: clicksTable.browser,
      os: clicksTable.os,
      device_type: clicksTable.device_type,
      short_code: linksTable.short_code,
      original_url: linksTable.original_url,
    })
    .from(clicksTable)
    .innerJoin(linksTable, eq(clicksTable.link_id, linksTable.id))
    .where(where)
    .orderBy(desc(clicksTable.clicked_at))
    .limit(limit);
}

/** Distinct non-null values for the country filter dropdown. */
async function getFilterOptions(userId) {
  const userLinks = sql`${clicksTable.link_id} IN (SELECT ${linksTable.id} FROM ${linksTable} WHERE ${linksTable.user_id} = ${userId})`;

  const countries = await db
    .select({ value: clicksTable.country })
    .from(clicksTable)
    .where(and(userLinks, isNotNull(clicksTable.country)))
    .groupBy(clicksTable.country)
    .orderBy(desc(sql`count(*)`));

  return {
    countries: countries.map((c) => c.value),
  };
}

export {
  recordClick,
  recordClickForLink,
  getSummary,
  getClicksOverTime,
  getTopCountries,
  getDeviceBreakdown,
  getBrowserBreakdown,
  getOsBreakdown,
  getTopLinks,
  getTimeline,
  getFilterOptions,
};
