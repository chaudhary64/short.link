import { createLink } from "../../repositories/links.repository.js";
import { redisClient } from "../../db/index.js";

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

    // Verify that the fingerprint owns this short_code
    const storedShortCode = await redisClient.get(guestKey);
    if (storedShortCode !== short_code) {
      return res.status(404).json({
        message:
          "Guest link not found or has already expired. Create a new link instead.",
      });
    }

    // Get the original URL from the guest link
    const originalUrl = await redisClient.get(`guest_link:${short_code}`);
    if (!originalUrl) {
      // Clean up the stale fingerprint
      await redisClient.del(guestKey);
      return res.status(404).json({
        message:
          "Guest link has expired. Create a new link from your dashboard.",
      });
    }

    // Persist the link in the database with the SAME short_code
    const permanentLink = await createLink(userId, originalUrl, short_code);

    // Clean up all guest Redis keys
    await Promise.all([
      redisClient.del(guestKey),
      redisClient.del(`guest_link:${short_code}`),
      redisClient.del(`guest_views:${short_code}`),
    ]);

    res.status(200).json({
      message:
        "Your guest link has been converted to a permanent link! It will no longer expire.",
      link: permanentLink,
    });
  } catch (error) {
    console.error("Error converting guest link:", error);

    // Handle unique constraint violation (short_code collision in DB)
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
