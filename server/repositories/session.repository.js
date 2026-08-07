import { createHash } from "node:crypto";
import { sessionsTable } from "../models/sessions.schema.js";
import db from "../db/index.js";
import { and, desc, eq, sql } from "drizzle-orm";
import { usersTable } from "../models/user.schema.js";

export const hashRefreshToken = (token) =>
  createHash("sha256").update(token).digest("hex");

async function createSession(sessionData) {
  const [session] = await db
    .insert(sessionsTable)
    .values({
      ...sessionData,
      refresh_token: hashRefreshToken(sessionData.refresh_token),
    })
    .returning();
  return session;
}

async function getSessionByRefreshToken(refreshToken) {
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.refresh_token, hashRefreshToken(refreshToken)));
  return session;
}

async function deleteSessionsByUserId(userId) {
  await db.delete(sessionsTable).where(eq(sessionsTable.user_id, userId));
}

async function markSessionRotated(sessionId, replacedBySessionId) {
  await db
    .update(sessionsTable)
    .set({
      rotated_at: new Date(),
      replaced_by: replacedBySessionId,
    })
    .where(
      and(
        eq(sessionsTable.session_id, sessionId),
        sql`${sessionsTable.rotated_at} IS NULL`,
      ),
    );
}

async function deleteSessionFamily(sessionId) {
  await db.execute(sql`
    WITH RECURSIVE family AS (
      SELECT session_id, replaced_by FROM sessions WHERE session_id = ${sessionId}
      UNION ALL
      SELECT s.session_id, s.replaced_by
      FROM sessions s
      JOIN family f ON f.replaced_by = s.session_id
    )
    DELETE FROM sessions
    WHERE session_id IN (SELECT session_id FROM family)
  `);
}

async function getSessionById(sessionId) {
  const [session] = await db
    .select({
      session_id: sessionsTable.session_id,
      user_id: sessionsTable.user_id,
    })
    .from(sessionsTable)
    .where(eq(sessionsTable.session_id, sessionId));
  return session;
}

async function deleteSessionByIdAndUserId(sessionId, userId) {
  const [session] = await db
    .delete(sessionsTable)
    .where(
      and(
        eq(sessionsTable.session_id, sessionId),
        eq(sessionsTable.user_id, userId),
      ),
    )
    .returning();
  return session;
}

async function getSessionsByUserId(userId) {
  return db
    .select({
      session_id: sessionsTable.session_id,
      refresh_token: sessionsTable.refresh_token,
      browser: sessionsTable.browser,
      os: sessionsTable.os,
      device_type: sessionsTable.device_type,
      country: sessionsTable.country,
      city: sessionsTable.city,
      created_at: sessionsTable.created_at,
    })
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.user_id, userId),
        sql`${sessionsTable.rotated_at} IS NULL`,
      ),
    )
    .orderBy(desc(sessionsTable.created_at), desc(sessionsTable.session_id));
}

export {
  createSession,
  getSessionById,
  getSessionByRefreshToken,
  markSessionRotated,
  deleteSessionFamily,
  deleteSessionByIdAndUserId,
  getSessionsByUserId,
  deleteSessionsByUserId,
};
