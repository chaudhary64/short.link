import { redisClient } from "../db/index.js";
import { recordClickForLink } from "../repositories/analytics.repository.js";

const GUEST_TTL = 60 * 60 * 24; // 24 hours — must match createGuest.controller.js

const checkCache = async (req, res, next) => {
  try {
    const { short_code } = req.params;

    // Check authenticated link cache first (link: prefix), then guest link namespace
    let targetUrl = await redisClient.get(`link:${short_code}`);
    let isGuest = false;

    if (!targetUrl) {
      targetUrl = await redisClient.get(`guest_link:${short_code}`);
      if (targetUrl) isGuest = true;
    }

    if (targetUrl) {
      // Record an analytics click using the cached link_id (no extra DB query)
      const cachedId = await redisClient.get(`link:${short_code}:id`);
      if (cachedId) {
        recordClickForLink(Number(cachedId), req);
      }

      // Track guest link views in Redis — atomic incr prevents TTL race
      if (isGuest) {
        try {
          const views = await redisClient.incr(`guest_views:${short_code}`);
          if (views === 1) {
            // Key was just created (expired between requests) — re-set TTL
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
