// Lightweight in-memory fixed-window rate limiter.
// Suitable for a single-instance deployment; buckets are pruned lazily.
// The default key is the client IP (honoring X-Forwarded-For from the reverse proxy).

const buckets = new Map();

// With `trust proxy` set in app.js, req.ip is the real client IP (derived from
// X-Forwarded-For only when the request comes from the trusted proxy). Falling
// back to req.ip is safe: a client hitting the server directly can't spoof it.
function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

/**
 * @param {object} options
 * @param {number} options.windowMs  Fixed window length in ms.
 * @param {number} options.max       Max requests per window per key.
 * @param {(req) => string} [options.keyFn] Override the rate-limit key (default: client IP).
 * @param {string} [options.message] Response message when limited.
 */
export default function rateLimit({ windowMs, max, keyFn = clientIp, message }) {
  return (req, res, next) => {
    const key = keyFn(req);
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || entry.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });

      // Lazy prune of expired buckets so the map never grows unbounded
      if (buckets.size > 10_000) {
        for (const [k, e] of buckets) {
          if (e.resetAt <= now) buckets.delete(k);
        }
      }

      return next();
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        message: message || "Too many requests. Please try again later.",
      });
    }

    next();
  };
}
