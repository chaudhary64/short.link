import {
  createSession,
  deleteSessionAndFetchUser,
} from "../../repositories/session.repository.js";
import generateTokens from "../../services/token.service.js";
import { verifyRefreshToken } from "../../utils/tokens.js";
import { cookieOptions } from "../../utils/cookie.js";

export default async function refreshController(req, res) {
  try {
    const { refresh_token } = req.cookies;

    if (!refresh_token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = verifyRefreshToken(refresh_token);

    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const oldSession = await deleteSessionAndFetchUser(refresh_token);
    if (!oldSession) {
      return res.status(401).json({ message: "Session not found" });
    }

    // Rotate tokens: generate new pair and persist new session
    const { accessToken, refreshToken } = generateTokens(decoded);

    await createSession({
      user_id: oldSession.user_id,
      refresh_token: refreshToken,
      user_agent: req.headers["user-agent"] || "unknown",
    });

    res
      .status(200)
      .cookie("refresh_token", refreshToken, cookieOptions)
      .json({
        message: "Tokens refreshed successfully",
        accessToken,
        refreshToken,
        user: {
          name: oldSession.name,
          email: oldSession.email,
          created_at: oldSession.created_at,
        },
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
