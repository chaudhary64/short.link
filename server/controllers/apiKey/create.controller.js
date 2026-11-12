import { createApiKey } from "../../repositories/apiKey.repository.js";
import { generateApiKey } from "../../utils/apiKey.js";

export default async function createApiKeyController(req, res) {
  try {
    const userId = req.user.id;
    const { name, scopes } = req.body;

    const { token } = generateApiKey();

    const apiKey = await createApiKey({
      userId,
      name,
      token,
      scopes,
    });

    // The plaintext token is returned exactly once, here. Only its hash is
    // stored, so it can never be shown again.
    res.status(201).json({
      message: "API key created",
      apiKey,
      token,
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
