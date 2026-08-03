import {
  createLink,
  getLinkByShortCode,
} from "../../repositories/links.repository.js";
import { nanoid } from "nanoid";

export default async function postLinkController(req, res) {
  try {
    const userId = req.user.id;
    const { originalUrl, shortCode } = req.body;

    let short_code;
    if (shortCode) {
      const existing = await getLinkByShortCode(shortCode);
      if (existing) {
        return res.status(409).json({
          message: `The short code "${shortCode}" is already taken. Try another one.`,
        });
      }
      short_code = shortCode;
    } else {
      const configuredSize = parseInt(process.env.NANOID_SIZE, 10);
      const nanoIdSize =
        configuredSize > 0 ? Math.min(configuredSize, 21) : undefined;
      short_code = nanoid(nanoIdSize);
    }

    const newLink = await createLink(userId, originalUrl, short_code);
    res.status(201).json({ message: "Link created successfully", link: newLink });
  } catch (error) {
    if (error?.code === "23505") {
      return res.status(409).json({
        message: "That short code was just taken. Try another one.",
      });
    }
    console.error("Error creating link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
