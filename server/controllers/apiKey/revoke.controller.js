import { revokeApiKey } from "../../repositories/apiKey.repository.js";

export default async function revokeApiKeyController(req, res) {
  try {
    const userId = req.user.id;
    const apiKeyId = Number(req.params.id);

    const apiKey = await revokeApiKey(apiKeyId, userId);

    if (!apiKey) {
      return res
        .status(404)
        .json({ message: "API key not found or already revoked" });
    }

    res.status(200).json({ message: "API key revoked", apiKey });
  } catch (error) {
    console.error("Error revoking API key:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
