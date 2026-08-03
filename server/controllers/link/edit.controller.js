import {
  updateLink,
  getLinkById,
  getLinkByShortCode,
  uncacheLink,
} from "../../repositories/links.repository.js";

export default async function editLinkController(req, res) {
  try {
    const { id } = req.params;
    const { originalUrl, shortCode } = req.body;
    const userId = req.user.id;

    const link = await getLinkById(id);
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }
    if (link.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this link" });
    }

    const fields = { original_url: originalUrl };
    let oldShortCode = null;

    if (shortCode && shortCode !== link.short_code) {
      const existing = await getLinkByShortCode(shortCode);
      if (existing && existing.id !== link.id) {
        return res.status(409).json({
          message: `The short code "${shortCode}" is already taken. Try another one.`,
        });
      }
      fields.short_code = shortCode;
      oldShortCode = link.short_code;
    }

    const updatedLink = await updateLink(id, fields);

    if (oldShortCode) {
      await uncacheLink(oldShortCode);
    }

    return res.status(200).json({
      message: "Link updated successfully",
      link: updatedLink,
    });
  } catch (error) {
    if (error?.code === "23505") {
      return res.status(409).json({
        message: "That short code was just taken. Try another one.",
      });
    }
    console.error("Error updating link:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
