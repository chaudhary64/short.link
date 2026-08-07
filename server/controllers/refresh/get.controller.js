import {
  getSessionByRefreshToken,
  markSessionRotated,
  deleteSessionFamily,
} from "../../repositories/session.repository.js";
import { getUserById } from "../../repositories/user.repository.js";
import issueSessionTokens from "../../services/token.service.js";
import { verifyRefreshToken } from "../../utils/tokens.js";
import { cookieOptions } from "../../utils/cookie.js";

const REUSE_GRACE_MS = 60_000;

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

    const session = await getSessionByRefreshToken(refresh_token);
    if (!session || session.user_id !== decoded.id) {
      res.clearCookie("refresh_token", cookieOptions);
      return res.status(401).json({ message: "Session not found" });
    }

    if (session.rotated_at) {
      const age = Date.now() - new Date(session.rotated_at).getTime();

      if (age > REUSE_GRACE_MS) {
        await deleteSessionFamily(session.session_id);
        res.clearCookie("refresh_token", cookieOptions);
        return res.status(401).json({ message: "Session has been revoked" });
      }
    }

    const user = await getUserById(session.user_id);
    if (!user) {
      res.clearCookie("refresh_token", cookieOptions);
      return res.status(401).json({ message: "Session not found" });
    }

    if (!user.is_verified) {
      res.clearCookie("refresh_token", cookieOptions);
      return res
        .status(403)
        .json({ message: "Please verify your email address first" });
    }

    const { accessToken, refreshToken, sessionId } = await issueSessionTokens(
      user,
      req,
    );

    if (!session.rotated_at) {
      await markSessionRotated(session.session_id, sessionId);
    }

    res
      .status(200)
      .cookie("refresh_token", refreshToken, cookieOptions)
      .json({
        message: "Tokens refreshed successfully",
        accessToken,
        refreshToken,
        user: {
          name: user.name,
          email: user.email,
          gender: user.gender,
          created_at: user.created_at,
          password_changed_at: user.password_changed_at,
          has_password: !!user.password,
          has_google: !!user.provider_id,
        },
      });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
