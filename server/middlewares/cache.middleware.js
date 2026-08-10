import { redisClient } from "../db/index.js";
import { recordClickForLink } from "../repositories/analytics.repository.js";

const GUEST_TTL = 60 * 60 * 24;

const checkCache = async (req, res, next) => {
  try {
    const { short_code } = req.params;

    let targetUrl = await redisClient.get(`link:${short_code}`);
    let isGuest = false;

    if (!targetUrl) {
      targetUrl = await redisClient.get(`guest_link:${short_code}`);
      if (targetUrl) isGuest = true;
    }

    if (targetUrl) {
      const cachedId = await redisClient.get(`link:${short_code}:id`);
      if (cachedId) {
        recordClickForLink(Number(cachedId), req);
      }

      if (isGuest) {
        try {
          const now = Date.now();
          const pipeline = redisClient.multi();
          pipeline.incr(`guest_views:${short_code}`);
          pipeline.rpush(`guest_clicks:${short_code}`, String(now));
          pipeline.ltrim(`guest_clicks:${short_code}`, -5000, -1);
          pipeline.expire(`guest_clicks:${short_code}`, GUEST_TTL);
          pipeline.hincrby(
            `guest_clicks_min:${short_code}`,
            String(Math.floor(now / 60000)),
            1,
          );
          pipeline.expire(`guest_clicks_min:${short_code}`, GUEST_TTL);

          const results = await pipeline.exec();
          const views = results?.[0];
          if (views === 1) {
            await redisClient.expire(`guest_views:${short_code}`, GUEST_TTL);
          }
        } catch (err) {
          console.error("Guest view tracking error:", err);
        }
      }

      return res.redirect(302, targetUrl);
    }

    next();
  } catch (error) {
    console.error("Redis Cache Error:", error);
    next();
  }
};

export default checkCache;
