import { redisClient } from "../db/index.js";

export const GUEST_TTL_SECONDS = 60 * 60 * 24;

const legacyKeys = (shortCode) => [
  `guest_link:${shortCode}`,
  `guest_views:${shortCode}`,
  `guest_clicks:${shortCode}`,
  `guest_clicks_min:${shortCode}`,
];

export const guestDocKey = (shortCode) => `guest:${shortCode}`;

export const buildGuestDoc = (url, fingerprint) => ({
  url,
  fingerprint,
  views: 0,
  clicks: [],
  perMinute: {},
});

export async function createGuestDoc(shortCode, url, fingerprint) {
  await redisClient.json.set(
    guestDocKey(shortCode),
    "$",
    buildGuestDoc(url, fingerprint),
  );
  await redisClient.expire(guestDocKey(shortCode), GUEST_TTL_SECONDS);
}

export async function getGuestDoc(shortCode) {
  return redisClient.json.get(guestDocKey(shortCode));
}

export async function getGuestUrl(shortCode) {
  return redisClient.json.get(guestDocKey(shortCode), { path: ".url" });
}

export async function migrateLegacyGuest(shortCode) {
  const legacyUrl = await redisClient.get(`guest_link:${shortCode}`);
  if (!legacyUrl) return null;

  const [views, rawTimes, minuteCounts, ttl] = await Promise.all([
    redisClient.get(`guest_views:${shortCode}`),
    redisClient.lRange(`guest_clicks:${shortCode}`, 0, -1),
    redisClient.hGetAll(`guest_clicks_min:${shortCode}`),
    redisClient.ttl(`guest_link:${shortCode}`),
  ]);

  const doc = {
    url: legacyUrl,
    fingerprint: null,
    views: parseInt(views || "0", 10) || 0,
    clicks: (rawTimes || [])
      .map(Number)
      .filter((t) => Number.isFinite(t) && t > 0),
    perMinute: Object.fromEntries(
      Object.entries(minuteCounts || {}).map(([minute, count]) => [
        minute,
        parseInt(count, 10) || 0,
      ]),
    ),
  };

  const key = guestDocKey(shortCode);
  await redisClient.json.set(key, "$", doc);
  const remaining = ttl > 0 && ttl <= GUEST_TTL_SECONDS ? ttl : GUEST_TTL_SECONDS;
  await redisClient.expire(key, remaining);
  await redisClient.unlink(legacyKeys(shortCode));
  return legacyUrl;
}

export async function resolveGuestDoc(shortCode) {
  let doc = await getGuestDoc(shortCode);
  if (!doc && (await migrateLegacyGuest(shortCode))) {
    doc = await getGuestDoc(shortCode);
  }
  return doc;
}

export async function resolveGuestUrl(shortCode) {
  let url = await getGuestUrl(shortCode);
  if (!url && (await migrateLegacyGuest(shortCode))) {
    url = await getGuestUrl(shortCode);
  }
  return url;
}

const GUEST_TRACK_SCRIPT = `
local minute = ARGV[1]
local now = ARGV[2]
local cur = redis.call('JSON.GET', KEYS[1], '$.perMinute.' .. minute)
if not cur or cur == '[]' then
  redis.call('JSON.SET', KEYS[1], '$.perMinute.' .. minute, '0')
end
redis.call('JSON.NUMINCRBY', KEYS[1], '$.perMinute.' .. minute, 1)
redis.call('JSON.NUMINCRBY', KEYS[1], '.views', 1)
redis.call('JSON.ARRAPPEND', KEYS[1], '.clicks', now)
redis.call('JSON.ARRTRIM', KEYS[1], '.clicks', -5000, -1)
return 1
`;

export async function trackGuestVisit(shortCode, timestamp) {
  const minute = String(Math.floor(timestamp / 60000));
  await redisClient.eval(GUEST_TRACK_SCRIPT, {
    keys: [guestDocKey(shortCode)],
    arguments: [minute, String(timestamp)],
  });
}

export async function cleanupGuestKeys(shortCode, fingerprint) {
  await Promise.all([
    redisClient.unlink(guestDocKey(shortCode)),
    redisClient.del(`guest:${fingerprint}`),
    redisClient.unlink(legacyKeys(shortCode)),
  ]);
}
