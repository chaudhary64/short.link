import { redisClient } from "../db/index.js";
import { incrementLinkViewsByShortCode } from "../repositories/links.repository.js";

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
      // Increment views in DB (for authenticated links — no-op on guest links)
      await incrementLinkViewsByShortCode(short_code);

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
