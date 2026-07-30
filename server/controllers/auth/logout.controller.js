import { deleteSessionByRefreshToken } from "../../repositories/session.repository.js";
import { cookieOptions } from "../../utils/cookie.js";

const logoutController = async (req, res, next) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    await deleteSessionByRefreshToken(token);

    res.clearCookie("refresh_token", cookieOptions);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default logoutController;
