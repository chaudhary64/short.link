import { and, desc, eq, isNull, lt, or } from "drizzle-orm";
import db from "../db/index.js";
import { apiKeysTable } from "../models/apiKeys.schema.js";
import {
  apiKeyPrefix,
  apiKeyTouchCutoff,
  hashApiKey,
  normalizeScopes,
} from "../utils/apiKey.js";

// Never select key_hash for anything returned to a client.
const PUBLIC_COLUMNS = {
  id: apiKeysTable.id,
  user_id: apiKeysTable.user_id,
  name: apiKeysTable.name,
  prefix: apiKeysTable.prefix,
  scopes: apiKeysTable.scopes,
  last_used_at: apiKeysTable.last_used_at,
  expires_at: apiKeysTable.expires_at,
  revoked_at: apiKeysTable.revoked_at,
  created_at: apiKeysTable.created_at,
};

async function createApiKey({ userId, name, token, scopes, expiresAt = null }) {
  const [apiKey] = await db
    .insert(apiKeysTable)
    .values({
      user_id: userId,
      name,
      prefix: apiKeyPrefix(token),
      key_hash: hashApiKey(token),
      scopes: normalizeScopes(scopes),
      expires_at: expiresAt,
    })
    .returning(PUBLIC_COLUMNS);

  return apiKey;
}

async function getApiKeyByHash(hash) {
  const [apiKey] = await db
    .select({
      id: apiKeysTable.id,
      user_id: apiKeysTable.user_id,
      scopes: apiKeysTable.scopes,
      expires_at: apiKeysTable.expires_at,
      revoked_at: apiKeysTable.revoked_at,
    })
    .from(apiKeysTable)
    .where(eq(apiKeysTable.key_hash, hash));

  return apiKey;
}

async function touchApiKey(id, now = new Date()) {
  await db
    .update(apiKeysTable)
    .set({ last_used_at: now })
    .where(
      and(
        eq(apiKeysTable.id, id),
        or(
          isNull(apiKeysTable.last_used_at),
          lt(apiKeysTable.last_used_at, apiKeyTouchCutoff(now)),
        ),
      ),
    );
}

async function listApiKeysByUserId(userId) {
  return db
    .select(PUBLIC_COLUMNS)
    .from(apiKeysTable)
    .where(eq(apiKeysTable.user_id, userId))
    .orderBy(desc(apiKeysTable.created_at), desc(apiKeysTable.id));
}

async function revokeApiKey(id, userId) {
  const [apiKey] = await db
    .update(apiKeysTable)
    .set({ revoked_at: new Date() })
    .where(
      and(
        eq(apiKeysTable.id, id),
        eq(apiKeysTable.user_id, userId),
        isNull(apiKeysTable.revoked_at),
      ),
    )
    .returning(PUBLIC_COLUMNS);

  return apiKey;
}

export {
  createApiKey,
  getApiKeyByHash,
  touchApiKey,
  listApiKeysByUserId,
  revokeApiKey,
};
