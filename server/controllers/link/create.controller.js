import { createLink } from "../../repositories/links.repository.js";
import { nanoid } from "nanoid";

export default async function postLinkController(req, res) {
  try {
    const userId = req.user.id;
    const { originalUrl } = req.body;
    // Cap at 21 — links.short_code is varchar(21) and longer codes would fail
    // to insert. Guard against 0/negative (nanoid would return an empty
    // string); undefined falls back to nanoid's default length of 21.
    const configuredSize = parseInt(process.env.NANOID_SIZE, 10);
    const nanoIdSize = configuredSize > 0 ? Math.min(configuredSize, 21) : undefined;
    const short_code = nanoid(nanoIdSize);
    const newLink = await createLink(userId, originalUrl, short_code);
    res.status(201).json({ message: "Link created successfully", link: newLink });
  } catch (error) {
    console.error("Error creating link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
