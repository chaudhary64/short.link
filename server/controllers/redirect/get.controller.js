import { getLinkByShortCodeAndCache } from "../../repositories/links.repository.js";
import { recordClickForLink } from "../../repositories/analytics.repository.js";

export default async function redirectController(req, res) {
  try {
    const { short_code } = req.params;

    const link = await getLinkByShortCodeAndCache(short_code);

    if (!link) {
      return res.status(404).json({ message: "Short link not found" });
    }

    if (link.status === "disabled") {
      return res.status(410).json({
        message: "This link has been disabled and is no longer active.",
      });
    }

    recordClickForLink(link.id, req);

    return res.redirect(302, link.original_url);
  } catch (error) {
    console.error("Error redirecting:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
