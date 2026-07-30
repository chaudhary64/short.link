import { nanoid } from "nanoid";
import { redisClient } from "../../db/index.js";
import crypto from "crypto";

const GUEST_TTL = 60 * 60 * 24; // 24 hours

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

    // Check if this guest already has a link
    const existingShortCode = await redisClient.get(guestKey);
    if (existingShortCode) {
      // Check if the redirect URL still exists, or if it expired/stale
      const existingUrl = await redisClient.get(
        `guest_link:${existingShortCode}`,
      );
      if (!existingUrl) {
        // Stale fingerprint — clean it up and let the guest create a fresh link
        await redisClient.del(guestKey);
        // Fall through to creation logic below
      } else {
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
    }

    // Create a new guest link
    const nanoIdSize = parseInt(process.env.NANOID_SIZE, 10) || 8;
    const short_code = nanoid(nanoIdSize);

    // 1. Guest redirect URL (namespaced to avoid collision with authenticated link cache)
    await redisClient.set(`guest_link:${short_code}`, originalUrl, {
      EX: GUEST_TTL,
    });

    // 2. Guest fingerprint → short_code (to enforce 1-link limit per guest)
    await redisClient.set(guestKey, short_code, { EX: GUEST_TTL });

    // 3. Guest views counter
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
