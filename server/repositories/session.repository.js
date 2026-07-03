import { sessionsTable } from "../models/sessions.schema.js";
import db from "../db/index.js";
import { eq, sql } from "drizzle-orm";
import { usersTable } from "../models/user.schema.js";

async function createSession(sessionData) {
  const [session] = await db
    .insert(sessionsTable)
    .values(sessionData)
    .returning();
  return session;
}

async function getSessionByRefreshToken(refreshToken) {
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.refresh_token, refreshToken));
  return session;
}

async function deleteSessionById(sessionId) {
  const [session] = await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.session_id, sessionId))
    .returning();
  return session;
}

async function deleteSessionByRefreshToken(refreshToken) {
  const [session] = await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.refresh_token, refreshToken))
    .returning();
  return session;
}

/**
 * Atomically deletes a session by its refresh token and returns the
 * associated user's data — all in a single CTE round-trip.
 *
 * @returns {{ session_id, user_id, user_agent, name, email } | undefined}
 */
async function deleteSessionAndFetchUser(refreshToken) {
  const result = await db.execute(sql`
    WITH deleted AS (
      DELETE FROM sessions
      WHERE refresh_token = ${refreshToken}
      RETURNING session_id, user_id, user_agent
    )
    SELECT
      d.session_id,
      d.user_id,
      d.user_agent,
      u.name,
      u.email
    FROM deleted d
    JOIN users u ON u.id = d.user_id
  `);

  return result.rows[0];
}

export {
  createSession,
  getSessionByRefreshToken,
  deleteSessionById,
  deleteSessionByRefreshToken,
  deleteSessionAndFetchUser,
};
