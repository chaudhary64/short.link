import db, { redisClient } from "../db/index.js";
import { linksTable } from "../models/links.schema.js";
import { clicksTable } from "../models/analytics.schema.js";
import { eq, sql, desc } from "drizzle-orm";

const REDIS_TTL = process.env.REDIS_TTL
  ? parseInt(process.env.REDIS_TTL)
  : 86400;

const LINK_KEY_PREFIX = "link:";

async function cacheLink(shortCode, originalUrl, linkId) {
  try {
    const pipeline = redisClient.multi();
    pipeline.set(`${LINK_KEY_PREFIX}${shortCode}`, originalUrl, { EX: REDIS_TTL });
    if (linkId != null) {
      pipeline.set(`${LINK_KEY_PREFIX}${shortCode}:id`, String(linkId), { EX: REDIS_TTL });
    }
    await pipeline.exec();
  } catch (error) {
    console.error(`[Redis] Failed to cache link ${shortCode}:`, error);
  }
}

async function uncacheLink(shortCode) {
  try {
    const pipeline = redisClient.multi();
    pipeline.del(`${LINK_KEY_PREFIX}${shortCode}`);
    pipeline.del(`${LINK_KEY_PREFIX}${shortCode}:id`);
    await pipeline.exec();
  } catch (error) {
    console.error(`[Redis] Failed to delete cache for ${shortCode}:`, error);
  }
}

async function getAllLinksByUserId(userId) {
  const links = await db
    .select({
      id: linksTable.id,
      user_id: linksTable.user_id,
      original_url: linksTable.original_url,
      short_code: linksTable.short_code,
      status: linksTable.status,
      created_at: linksTable.created_at,
      updated_at: linksTable.updated_at,
      views: sql`count(${clicksTable.id})::int`,
    })
    .from(linksTable)
    .leftJoin(clicksTable, eq(clicksTable.link_id, linksTable.id))
    .where(eq(linksTable.user_id, userId))
    .groupBy(linksTable.id, linksTable.user_id, linksTable.original_url, linksTable.short_code, linksTable.status, linksTable.created_at, linksTable.updated_at)
    .orderBy(desc(linksTable.created_at));
  return links;
}

async function getLinkById(linkId) {
  const [link] = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.id, linkId));
  return link;
}

async function getLinkByShortCode(shortCode) {
  const [link] = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.short_code, shortCode));
  return link;
}

async function createLink(userId, originalUrl, shortCode) {
  const newLink = await db
    .insert(linksTable)
    .values({
      user_id: userId,
      original_url: originalUrl,
      short_code: shortCode,
    })
    .returning();

  if (newLink[0]) {
    cacheLink(shortCode, originalUrl, newLink[0].id);
  }

  return newLink[0];
}

async function updateLink(linkId, updatedFields) {
  const updatedLink = await db
    .update(linksTable)
    .set(updatedFields)
    .where(eq(linksTable.id, linkId))
    .returning();

  const link = updatedLink[0];
  if (link && link.short_code) {
    if (link.status === "disabled") {
      uncacheLink(link.short_code);
    } else {
      cacheLink(link.short_code, link.original_url, link.id);
    }
  }

  return link;
}

async function deleteLink(linkId) {
  const deletedLink = await db
    .delete(linksTable)
    .where(eq(linksTable.id, linkId))
    .returning();

  const link = deletedLink[0];
  if (link && link.short_code) {
    uncacheLink(link.short_code);
  }

  return link;
}

async function getLinkByShortCodeAndCache(shortCode) {
  const link = await getLinkByShortCode(shortCode);

  if (link && link.status !== "disabled") {
    cacheLink(shortCode, link.original_url, link.id);
  }

  return link;
}

export {
  getAllLinksByUserId,
  getLinkById,
  getLinkByShortCode,
  getLinkByShortCodeAndCache,
  createLink,
  updateLink,
  deleteLink,
};
