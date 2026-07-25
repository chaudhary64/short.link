import db, { client } from "../db/index.js";
import { linksTable } from "../models/links.schema.js";
import { eq, sql } from "drizzle-orm";

async function getAllLinksByUserId(userId) {
  const links = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.user_id, userId));
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
    await client.set(shortCode, originalUrl);
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
      await client.del(link.short_code);
    } else {
      await client.set(link.short_code, link.original_url);
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
    await client.del(link.short_code);
  }
  
  return link;
}

async function incrementLinkViews(linkId) {
  const updatedLink = await db
    .update(linksTable)
    .set({ views: linksTable.views + 1 })
    .where(eq(linksTable.id, linkId))
    .returning();
  return updatedLink[0];
}

async function getLinkByShortCodeAndIncrement(shortCode) {
  const [link] = await db
    .update(linksTable)
    .set({ views: sql`${linksTable.views} + 1` })
    .where(eq(linksTable.short_code, shortCode))
    .returning();

  if (link && link.status !== "disabled") {
    await client.set(shortCode, link.original_url);
  }

  return link;
}

export {
  getAllLinksByUserId,
  getLinkById,
  getLinkByShortCode,
  getLinkByShortCodeAndIncrement,
  createLink,
  updateLink,
  deleteLink,
  incrementLinkViews,
};
