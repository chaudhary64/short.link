import { updateLink, getLinkById } from "../../repositories/links.repository.js";

export default async function updateLinkStatusController(req, res) {
  try {
    const { linkId, status } = req.body;
    const userId = req.user.id;


    const link = await getLinkById(linkId);
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }
    if (link.user_id !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this link" });
    }

    const updatedLink = await updateLink(linkId, { status });

    return res.status(200).json({
      message: `Link ${status === "active" ? "activated" : "disabled"} successfully`,
      link: updatedLink,
    });
  } catch (error) {
    console.error("Error updating link status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
