import { client } from "../db/index.js";

const checkCache = async (req, res, next) => {
  try {
    const { short_code } = req.params;
    const cachedLink = await client.get(short_code);
    
    if (cachedLink) {
      return res.redirect(302, cachedLink);
    }
    
    next();
  } catch (error) {
    console.error("Redis Cache Error:", error);
    next();
  }
};

export default checkCache;