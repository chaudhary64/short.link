import { redisClient } from "../db/index.js";
import { incrementLinkViewsByShortCode } from "../repositories/links.repository.js";

const checkCache = async (req, res, next) => {
  try {
    const { short_code } = req.params;
    const cachedLink = await redisClient.get(short_code);

    if (cachedLink) {
      incrementLinkViewsByShortCode(short_code);
      return res.redirect(302, cachedLink);
    }

    next();
  } catch (error) {
    console.error("Redis Cache Error:", error);
    next();
  }
};

export default checkCache;
