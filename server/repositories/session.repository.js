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

async function deleteSessionById(sessionId) {
  const [session] = await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.session_id, sessionId))
    .returning();
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
    .where(eq(sessionsTable.user_id, userId))
    .orderBy(desc(sessionsTable.created_at), desc(sessionsTable.session_id));
}

async function deleteSessionByRefreshToken(refreshToken) {
  const [session] = await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.refresh_token, hashRefreshToken(refreshToken)))
    .returning();
  return session;
}

async function deleteSessionAndFetchUser(refreshToken) {
  const result = await db.execute(sql`
    WITH deleted AS (
      DELETE FROM sessions
      WHERE refresh_token = ${hashRefreshToken(refreshToken)}
      RETURNING session_id, user_id, user_agent
    )
    SELECT
      d.session_id,
      d.user_id,
      d.user_agent,
      u.name,
      u.email,
      u.gender,
      u.is_verified,
      u.created_at,
      u.password_changed_at,
      CASE WHEN u.password IS NOT NULL THEN true ELSE false END AS has_password,
      CASE WHEN u.provider_id IS NOT NULL THEN true ELSE false END AS has_google
    FROM deleted d
    JOIN users u ON u.id = d.user_id
  `);

  return result.rows[0];
}

export {
  createSession,
  getSessionByRefreshToken,
  deleteSessionById,
  deleteSessionByIdAndUserId,
  getSessionsByUserId,
  deleteSessionByRefreshToken,
  deleteSessionAndFetchUser,
  deleteSessionsByUserId,
};
