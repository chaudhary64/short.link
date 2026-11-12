import { createHash, randomBytes } from "node:crypto";

export const API_KEY_PREFIX = "sk_live_";
export const API_KEY_SCOPES = ["read", "write"];

const VISIBLE_SALT_CHARS = 4;
const SECRET_BYTES = 24;

// last_used_at is diagnostic, so one write per key per minute is enough. The
// window is applied inside the UPDATE so concurrent requests cannot all pass a
// stale read and write anyway.
export const API_KEY_TOUCH_INTERVAL_MS = 60_000;

function apiKeyTouchCutoff(now = new Date()) {
  return new Date(now.getTime() - API_KEY_TOUCH_INTERVAL_MS);
}

function hashApiKey(token) {
  return createHash("sha256").update(token).digest("hex");
}

function apiKeyPrefix(token) {
  return token.slice(0, API_KEY_PREFIX.length + VISIBLE_SALT_CHARS);
}

function generateApiKey() {
  const token = `${API_KEY_PREFIX}${randomBytes(SECRET_BYTES).toString("base64url")}`;

  return { token, prefix: apiKeyPrefix(token), hash: hashApiKey(token) };
}

function isApiKeyToken(token) {
  return typeof token === "string" && token.startsWith(API_KEY_PREFIX);
}

function hasScope(apiKey, scope) {
  return Array.isArray(apiKey?.scopes) && apiKey.scopes.includes(scope);
}

function normalizeScopes(scopes) {
  const list = Array.isArray(scopes) ? scopes : [scopes];
  const unique = [...new Set(list)];
  const unknown = unique.filter((scope) => !API_KEY_SCOPES.includes(scope));

  if (unknown.length > 0) {
    throw new Error(
      `Unknown API key scope: ${unknown.map((scope) => String(scope)).join(", ")}`,
    );
  }

  if (unique.length === 0) {
    throw new Error("An API key needs at least one scope");
  }

  return unique;
}

// Kept pure so the middleware's rejection reasons are unit-testable without a
// database: the record is whatever the repository looked up by hash.
function evaluateApiKey(record, now = new Date()) {
  if (!record) {
    return { ok: false, message: "Unauthorized: Invalid API key" };
  }

  if (record.revoked_at) {
    return { ok: false, message: "Unauthorized: API key has been revoked" };
  }

  if (record.expires_at && new Date(record.expires_at) <= now) {
    return { ok: false, message: "Unauthorized: API key has expired" };
  }

  return { ok: true, message: null };
}

export {
  apiKeyTouchCutoff,
  hashApiKey,
  apiKeyPrefix,
  generateApiKey,
  isApiKeyToken,
  hasScope,
  normalizeScopes,
  evaluateApiKey,
};
