import { getLinkByShortCode } from "../../repositories/links.repository.js";

export default async function checkAliasController(req, res) {
  try {
    const { alias } = req.query;
    const existing = await getLinkByShortCode(alias);
    return res.status(200).json({ available: !existing });
  } catch (error) {
    console.error("Error checking alias:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
