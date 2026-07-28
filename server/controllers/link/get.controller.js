import { getAllLinksByUserId } from "../../repositories/links.repository.js";

export default async function getLinkController(req, res) {
  try {
    const userId = req.user.id;

    const links = await getAllLinksByUserId(userId);

    return res.status(200).json({ links });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
