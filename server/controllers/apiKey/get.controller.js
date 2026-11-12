import { listApiKeysByUserId } from "../../repositories/apiKey.repository.js";

export default async function getApiKeysController(req, res) {
  try {
    const apiKeys = await listApiKeysByUserId(req.user.id);

    res.status(200).json({ apiKeys });
  } catch (error) {
    console.error("Error listing API keys:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
