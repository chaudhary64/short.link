import {
  createLink,
  getLinkByShortCode,
} from "../../repositories/links.repository.js";
import {
  bulkInsertClicks,
  countClicksForLink,
} from "../../repositories/analytics.repository.js";
import { redisClient } from "../../db/index.js";
import {
  resolveGuestDoc,
  cleanupGuestKeys,
  guestDocKey,
  GUEST_TTL_SECONDS,
} from "../../services/guest.service.js";

function isDuplicateKeyError(error) {
  return (
    error?.code === "23505" ||
    error?.message?.includes("duplicate key") ||
    error?.message?.includes("unique constraint")
  );
}

async function acquireConversionLock(shortCode, timeoutMs = 3000) {
  const key = `guest_converting:${shortCode}`;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await redisClient.set(key, "1", { NX: true, EX: 15 });
    if (ok === "OK") {
      return async () => {
        await redisClient.del(key);
      };
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return null;
}

async function waitForMigration(linkId, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const count = await countClicksForLink(linkId);
    if (count > 0) return true;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return false;
}

async function migrateGuestClicks(shortCode, linkId) {
  const alreadyMigrated = await countClicksForLink(linkId);
  if (alreadyMigrated > 0) {
    return 0;
  }

  const doc = await resolveGuestDoc(shortCode);
  if (!doc) {
    return 0;
  }

  const views = Number(doc.views) || 0;
  const rawTimes = Array.isArray(doc.clicks) ? doc.clicks : [];
  const minuteCounts = doc.perMinute || {};

  const rows = rawTimes
    .map((t) => Number(t))
    .filter((t) => Number.isFinite(t) && t > 0)
    .map((t) => ({
      link_id: linkId,
      clicked_at: new Date(t),
    }));

  const exactByMinute = new Map();
  for (const row of rows) {
    const minute = Math.floor(row.clicked_at.getTime() / 60000);
    exactByMinute.set(minute, (exactByMinute.get(minute) || 0) + 1);
  }

  const buckets = Object.entries(minuteCounts)
    .map(([minute, count]) => ({
      minute: Number(minute),
      count: parseInt(count, 10),
    }))
    .filter((b) => Number.isFinite(b.minute) && b.count > 0)
    .sort((a, b) => a.minute - b.minute);

  for (const bucket of buckets) {
    const bucketStart = bucket.minute * 60000;
    const overflow = Math.max(
      0,
      bucket.count - (exactByMinute.get(bucket.minute) || 0),
    );
    for (let i = 0; i < overflow; i++) {
      const frac = overflow > 1 ? i / overflow : 0;
      rows.push({
        link_id: linkId,
        clicked_at: new Date(bucketStart + frac * 60000),
      });
    }
  }

  const remaining = Math.max(0, views - rows.length);
  if (remaining > 0) {
    const now = Date.now();
    const oldestReal = rows.length
      ? Math.min(...rows.map((r) => r.clicked_at.getTime()))
      : now;
    const ttl = await redisClient.ttl(guestDocKey(shortCode));
    const ageMs =
      ttl > 0 && ttl <= GUEST_TTL_SECONDS
        ? (GUEST_TTL_SECONDS - ttl) * 1000
        : GUEST_TTL_SECONDS * 1000;
    const start = Math.max(0, now - ageMs);
    const end = Math.max(start, oldestReal);
    const step = remaining > 1 ? (end - start) / (remaining - 1) : 0;
    for (let i = 0; i < remaining; i++) {
      rows.push({
        link_id: linkId,
        clicked_at: new Date(start + i * step),
      });
    }
  }

  if (rows.length) {
    await bulkInsertClicks(rows);
  }
  return rows.length;
}

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

    const doc = await resolveGuestDoc(short_code);
    if (!doc) {
      await redisClient.del(guestKey);
      return res.status(404).json({
        message:
          "Guest link has expired. Create a new link from your dashboard.",
      });
    }

    const originalUrl = doc.url;

    let permanentLink;
    try {
      permanentLink = await createLink(userId, originalUrl, short_code);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const existing = await getLinkByShortCode(short_code);

        if (
          existing &&
          existing.user_id === userId &&
          existing.original_url === originalUrl
        ) {
          const release = await acquireConversionLock(short_code);
          if (release) {
            try {
              await migrateGuestClicks(short_code, existing.id);
            } catch (migrationError) {
              await release();
              console.error(
                "[convert-guest] click migration failed on retry:",
                migrationError,
              );
              return res.status(500).json({
                message:
                  "Could not preserve your guest link's history. Please try again.",
              });
            }
            await release();
          } else if (!(await waitForMigration(existing.id))) {
            return res.status(500).json({
              message: "Conversion is still in progress. Please try again.",
            });
          }

          await cleanupGuestKeys(short_code, fingerprint);
          return res.status(200).json({
            message:
              "Your guest link has already been converted to a permanent link! It will no longer expire.",
            link: existing,
          });
        }
        return res.status(409).json({
          message:
            "This short code is already taken in our system. Create a new link from your dashboard.",
        });
      }
      throw error;
    }

    const release = await acquireConversionLock(short_code);
    if (release) {
      try {
        await migrateGuestClicks(short_code, permanentLink.id);
      } catch (error) {
        await release();
        console.error("[convert-guest] click migration failed:", error);
        return res.status(500).json({
          message:
            "Could not preserve your guest link's history. Please try again.",
        });
      }
      await release();
    } else if (!(await waitForMigration(permanentLink.id))) {
      return res.status(500).json({
        message: "Conversion is still in progress. Please try again.",
      });
    }

    await cleanupGuestKeys(short_code, fingerprint);

    res.status(200).json({
      message:
        "Your guest link has been converted to a permanent link! It will no longer expire.",
      link: permanentLink,
    });
  } catch (error) {
    console.error("Error converting guest link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
