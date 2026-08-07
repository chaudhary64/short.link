const buckets = new Map();

function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

export default function rateLimit({
  windowMs,
  max,
  keyFn = clientIp,
  message,
}) {
  return (req, res, next) => {
    const key = keyFn(req);
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || entry.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });

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
