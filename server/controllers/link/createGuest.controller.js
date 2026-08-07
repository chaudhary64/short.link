import { nanoid } from "nanoid";
import { redisClient } from "../../db/index.js";
import crypto from "crypto";

const GUEST_TTL = 60 * 60 * 24;

function generateFingerprint(req) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  const raw = `${ip}:${ua}`;
  return crypto.createHash("sha256").update(raw).digest("hex").substring(0, 16);
}

export default async function createGuestLinkController(req, res) {
  try {
    const { originalUrl } = req.body;
    const fingerprint = generateFingerprint(req);
    const guestKey = `guest:${fingerprint}`;

    const existingShortCode = await redisClient.get(guestKey);
    if (existingShortCode) {
      const existingUrl = await redisClient.get(
        `guest_link:${existingShortCode}`,
      );
      if (existingUrl) {
        const existingViews = await redisClient.get(
          `guest_views:${existingShortCode}`,
        );
        return res.status(200).json({
          message:
            "You already have an active guest link. Create a free account for unlimited links.",
          link: {
            short_code: existingShortCode,
            original_url: existingUrl,
            views: parseInt(existingViews || "0", 10),
            guest: true,
          },
          expiresIn: "24h",
          alreadyExists: true,
          fingerprint,
        });
      }

      await redisClient.del(guestKey);
    }

    const configuredSize = parseInt(process.env.NANOID_SIZE, 10);
    const nanoIdSize = configuredSize > 0 ? Math.min(configuredSize, 21) : 8;
    const short_code = nanoid(nanoIdSize);

    const claimed = await redisClient.set(guestKey, short_code, {
      NX: true,
      EX: GUEST_TTL,
    });

    if (claimed !== "OK") {
      const winnerCode = await redisClient.get(guestKey);

      let winnerUrl = null;
      if (winnerCode) {
        for (let i = 0; i < 5 && winnerUrl === null; i++) {
          winnerUrl = await redisClient.get(`guest_link:${winnerCode}`);
          if (winnerUrl === null && i < 4) {
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
        }
      }

      if (winnerCode && winnerUrl) {
        const winnerViews = await redisClient.get(`guest_views:${winnerCode}`);
        return res.status(200).json({
          message:
            "You already have an active guest link. Create a free account for unlimited links.",
          link: {
            short_code: winnerCode,
            original_url: winnerUrl,
            views: parseInt(winnerViews || "0", 10),
            guest: true,
          },
          expiresIn: "24h",
          alreadyExists: true,
          fingerprint,
        });
      }

      return res.status(500).json({ message: "Internal server error" });
    }

    await redisClient.set(`guest_link:${short_code}`, originalUrl, {
      EX: GUEST_TTL,
    });

    await redisClient.set(`guest_views:${short_code}`, "0", { EX: GUEST_TTL });

    res.status(201).json({
      message:
        "Link created successfully! It will expire in 24 hours. Create a free account to keep it forever.",
      link: {
        short_code,
        original_url: originalUrl,
        views: 0,
        guest: true,
      },
      expiresIn: "24h",
      fingerprint,
    });
  } catch (error) {
    console.error("Error creating guest link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
