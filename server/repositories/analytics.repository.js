import db from "../db/index.js";
import { clicksTable } from "../models/analytics.schema.js";
import { linksTable } from "../models/links.schema.js";
import { and, eq, gte, lte, sql, desc, isNotNull } from "drizzle-orm";
import { getClientInfo } from "../utils/clientInfo.js";

const normalizeFilters = (filters = {}) => {
  const conditions = [];

  if (filters.linkId) conditions.push(eq(clicksTable.link_id, Number(filters.linkId)));
  if (filters.country) conditions.push(eq(clicksTable.country, filters.country));
  if (filters.device) conditions.push(eq(clicksTable.device_type, filters.device));

  if (filters.from) {
    conditions.push(gte(clicksTable.clicked_at, new Date(`${filters.from}T00:00:00.000Z`)));
  }
  if (filters.to) {
    conditions.push(lte(clicksTable.clicked_at, new Date(`${filters.to}T23:59:59.999Z`)));
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

  const rows = await db
    .select({
      date: sql`to_char(date_trunc('day', ${clicksTable.clicked_at}), 'YYYY-MM-DD')`,
      clicks: sql`count(*)::int`,
      visitors: sql`count(distinct ${clicksTable.visitor_hash})::int`,
    })
    .from(clicksTable)
    .where(where)
    .groupBy(sql`date_trunc('day', ${clicksTable.clicked_at})`)
    .orderBy(sql`date_trunc('day', ${clicksTable.clicked_at})`);

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

async function getTopCities(userId, filters) {
  const where = and(
    sql`${clicksTable.link_id} IN (SELECT ${linksTable.id} FROM ${linksTable} WHERE ${linksTable.user_id} = ${userId})`,
    normalizeFilters(filters),
    isNotNull(clicksTable.city),
  );

  return db
    .select({
      city: clicksTable.city,
      country: clicksTable.country,
      clicks: sql`count(*)::int`,
    })
    .from(clicksTable)
    .where(where)
    .groupBy(clicksTable.city, clicksTable.country)
    .orderBy(desc(sql`count(*)`))
    .limit(10);
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
  const clickFilters = [];
  if (filters.country) clickFilters.push(eq(clicksTable.country, filters.country));
  if (filters.device) clickFilters.push(eq(clicksTable.device_type, filters.device));
  if (filters.from) clickFilters.push(gte(clicksTable.clicked_at, new Date(`${filters.from}T00:00:00.000Z`)));
  if (filters.to) clickFilters.push(lte(clicksTable.clicked_at, new Date(`${filters.to}T23:59:59.999Z`)));

  const linkConditions = [eq(linksTable.user_id, userId)];
  if (filters.linkId && !isNaN(filters.linkId)) {
    linkConditions.push(eq(linksTable.id, Number(filters.linkId)));
  }

  const rows = await db
    .select({
      id: linksTable.id,
      short_code: linksTable.short_code,
      original_url: linksTable.original_url,
      created_at: linksTable.created_at,
      clicks: sql`count(${clicksTable.id})::int`,
      unique: sql`count(distinct ${clicksTable.visitor_hash})::int`,
      last_click_at: sql`max(${clicksTable.clicked_at})`,
    })
    .from(linksTable)
    .leftJoin(clicksTable, eq(clicksTable.link_id, linksTable.id))
    .where(and(...linkConditions, clickFilters.length ? and(...clickFilters) : undefined))
    .groupBy(linksTable.id, linksTable.short_code, linksTable.original_url, linksTable.created_at)
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
  getTopCities,
  getDeviceBreakdown,
  getBrowserBreakdown,
  getOsBreakdown,
  getTopLinks,
  getTimeline,
  getFilterOptions,
};
