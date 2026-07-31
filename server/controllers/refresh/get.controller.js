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
      res.clearCookie("refresh_token", cookieOptions);
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const oldSession = await deleteSessionAndFetchUser(refresh_token);
    if (!oldSession) {
      res.clearCookie("refresh_token", cookieOptions);
      return res.status(401).json({ message: "Session not found" });
    }

    if (!oldSession.is_verified) {
      res.clearCookie("refresh_token", cookieOptions);
      return res.status(403).json({ message: "Please verify your email address first" });
    }

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
          gender: oldSession.gender,
          created_at: oldSession.created_at,
          has_password: oldSession.has_password,
          has_google: oldSession.has_google,
        },
      });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
