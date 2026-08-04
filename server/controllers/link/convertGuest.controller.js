import { createLink } from "../../repositories/links.repository.js";
import { bulkInsertClicks } from "../../repositories/analytics.repository.js";
import { redisClient } from "../../db/index.js";

const GUEST_TTL_SECONDS = 60 * 60 * 24;

export default async function convertGuestLinkController(req, res) {
  try {
    const userId = req.user.id;
    const { short_code, fingerprint } = req.body;

    if (!short_code || !fingerprint) {
      return res
        .status(400)
        .json({ message: "short_code and fingerprint are required." });
    }

    const guestKey = `guest:${fingerprint}`;

    const storedShortCode = await redisClient.get(guestKey);
    if (storedShortCode !== short_code) {
      return res.status(404).json({
        message:
          "Guest link not found or has already expired. Create a new link instead.",
      });
    }

    const originalUrl = await redisClient.get(`guest_link:${short_code}`);
    if (!originalUrl) {
      await redisClient.del(guestKey);
      return res.status(404).json({
        message:
          "Guest link has expired. Create a new link from your dashboard.",
      });
    }

    const permanentLink = await createLink(userId, originalUrl, short_code);

    try {
      const views = parseInt(
        (await redisClient.get(`guest_views:${short_code}`)) || "0",
        10,
      );
      const rawTimes = await redisClient.lrange(
        `guest_clicks:${short_code}`,
        0,
        -1,
      );

      const rows = rawTimes
        .map((t) => Number(t))
        .filter((t) => Number.isFinite(t) && t > 0)
        .map((t) => ({
          link_id: permanentLink.id,
          clicked_at: new Date(t),
        }));

      const remaining = Math.max(0, views - rows.length);
      if (remaining > 0) {
        const now = Date.now();
        const oldestReal = rows.length
          ? Math.min(...rows.map((r) => r.clicked_at.getTime()))
          : now;
        const ttl = await redisClient.ttl(`guest_views:${short_code}`);
        const ageMs =
          ttl > 0 && ttl <= GUEST_TTL_SECONDS
            ? (GUEST_TTL_SECONDS - ttl) * 1000
            : GUEST_TTL_SECONDS * 1000;
        const start = Math.max(0, now - ageMs);
        const end = Math.max(start, oldestReal);
        const step = remaining > 1 ? (end - start) / (remaining - 1) : 0;
        for (let i = 0; i < remaining; i++) {
          rows.push({
            link_id: permanentLink.id,
            clicked_at: new Date(start + i * step),
          });
        }
      }

      if (rows.length) {
        await bulkInsertClicks(rows);
      }
    } catch (error) {
      console.error("Error migrating guest click history:", error);
    }

    await Promise.all([
      redisClient.del(guestKey),
      redisClient.del(`guest_link:${short_code}`),
      redisClient.del(`guest_views:${short_code}`),
      redisClient.del(`guest_clicks:${short_code}`),
    ]);

    res.status(200).json({
      message:
        "Your guest link has been converted to a permanent link! It will no longer expire.",
      link: permanentLink,
    });
  } catch (error) {
    console.error("Error converting guest link:", error);

    if (
      error.code === "23505" ||
      error.message?.includes("duplicate key") ||
      error.message?.includes("unique constraint")
    ) {
      return res.status(409).json({
        message:
          "This short code is already taken in our system. Create a new link from your dashboard.",
      });
    }

    res.status(500).json({ message: "Internal server error" });
  }
}
