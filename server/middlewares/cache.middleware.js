import { redisClient } from "../db/index.js";
import { recordClickForLink } from "../repositories/analytics.repository.js";
import { resolveGuestUrl, trackGuestVisit } from "../services/guest.service.js";

const checkCache = async (req, res, next) => {
  try {
    const { short_code } = req.params;

    let targetUrl = await redisClient.get(`link:${short_code}`);
    let isGuest = false;

    if (!targetUrl) {
      targetUrl = await resolveGuestUrl(short_code);
      if (targetUrl) isGuest = true;
    }

    if (targetUrl) {
      const cachedId = await redisClient.get(`link:${short_code}:id`);
      if (cachedId) {
        recordClickForLink(Number(cachedId), req);
      }

      if (isGuest) {
        try {
          await trackGuestVisit(short_code, Date.now());
        } catch (err) {
          console.error("Guest view tracking error:", err.message);
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
