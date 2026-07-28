import { createLink } from "../../repositories/links.repository.js";
import { nanoid } from "nanoid";

export default async function postLinkController(req, res) {
  try {
    const userId = req.user.id;
    const { originalUrl } = req.body;
    const short_code = nanoid(process.env.NANOID_SIZE);
    const newLink = await createLink(userId, originalUrl, short_code);
    res.status(201).json({ message: "Link created successfully", link: newLink });
  } catch (error) {
    console.error("Error creating link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
