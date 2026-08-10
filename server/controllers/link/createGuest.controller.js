import { nanoid } from "nanoid";
import { redisClient } from "../../db/index.js";
import crypto from "crypto";
import {
  createGuestDoc,
  resolveGuestDoc,
  GUEST_TTL_SECONDS,
} from "../../services/guest.service.js";

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
      const existingDoc = await resolveGuestDoc(existingShortCode);
      if (existingDoc) {
        return res.status(200).json({
          message:
            "You already have an active guest link. Create a free account for unlimited links.",
          link: {
            short_code: existingShortCode,
            original_url: existingDoc.url,
            views: Number(existingDoc.views) || 0,
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
      EX: GUEST_TTL_SECONDS,
    });

    if (claimed !== "OK") {
      const winnerCode = await redisClient.get(guestKey);

      let winnerDoc = null;
      if (winnerCode) {
        for (let i = 0; i < 5 && winnerDoc === null; i++) {
          winnerDoc = await resolveGuestDoc(winnerCode);
          if (winnerDoc === null && i < 4) {
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
        }
      }

      if (winnerCode && winnerDoc) {
        return res.status(200).json({
          message:
            "You already have an active guest link. Create a free account for unlimited links.",
          link: {
            short_code: winnerCode,
            original_url: winnerDoc.url,
            views: Number(winnerDoc.views) || 0,
            guest: true,
          },
          expiresIn: "24h",
          alreadyExists: true,
          fingerprint,
        });
      }

      return res.status(500).json({ message: "Internal server error" });
    }

    try {
      await createGuestDoc(short_code, originalUrl, fingerprint);
    } catch (error) {
      await redisClient.del(guestKey);
      throw error;
    }

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
