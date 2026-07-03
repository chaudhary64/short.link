import {
  getLinkByShortCode,
  getLinkByShortCodeAndIncrement,
} from "../../repositories/links.repository.js";

export default async function redirectController(req, res) {
  try {
    const { short_code } = req.params;

    // Fetch first without incrementing so we can check status
    const link = await getLinkByShortCode(short_code);

    if (!link) {
      return res.status(404).json({ message: "Short link not found" });
    }

    if (link.status === "disabled") {
      return res.status(410).json({
        message: "This link has been disabled and is no longer active.",
      });
    }

    // Link is active — increment views then redirect
    const activeLink = await getLinkByShortCodeAndIncrement(short_code);

    return res.redirect(302, activeLink.original_url);
  } catch (error) {
    console.error("Error redirecting:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
