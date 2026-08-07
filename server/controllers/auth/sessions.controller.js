import {
  deleteSessionByIdAndUserId,
  deleteSessionsByUserId,
  getSessionsByUserId,
  hashRefreshToken,
} from "../../repositories/session.repository.js";
import { cookieOptions } from "../../utils/cookie.js";

const getSessionsController = async (req, res) => {
  try {
    const sessions = await getSessionsByUserId(req.user.id);
    const currentHash = req.cookies.refresh_token
      ? hashRefreshToken(req.cookies.refresh_token)
      : null;

    const list = sessions.map((s) => ({
      session_id: s.session_id,
      browser: s.browser,
      os: s.os,
      device_type: s.device_type,
      country: s.country,
      city: s.city,
      created_at: s.created_at,
      is_current: s.refresh_token === currentHash,
    }));

    return res.status(200).json({ sessions: list });
  } catch (error) {
    console.error("List sessions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const revokeSessionController = async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({ message: "Invalid session id" });
    }

    const deleted = await deleteSessionByIdAndUserId(sessionId, req.user.id);

    if (!deleted) {
      return res.status(404).json({ message: "Session not found" });
    }

    const isCurrent =
      !!req.cookies.refresh_token &&
      hashRefreshToken(req.cookies.refresh_token) === deleted.refresh_token;

    if (isCurrent) {
      res.clearCookie("refresh_token", cookieOptions);
    }

    return res
      .status(200)
      .json({ message: "Session ended", ended_current: isCurrent });
  } catch (error) {
    console.error("Revoke session error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const revokeAllSessionsController = async (req, res) => {
  try {
    await deleteSessionsByUserId(req.user.id);
    res.clearCookie("refresh_token", cookieOptions);
    return res.status(200).json({ message: "All sessions ended" });
  } catch (error) {
    console.error("Revoke all sessions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getSessionsController,
  revokeSessionController,
  revokeAllSessionsController,
};
