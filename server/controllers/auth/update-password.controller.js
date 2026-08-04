import { redisClient } from "../../db/index.js";
import { resetPassword, getUserById } from "../../repositories/user.repository.js";
import { hashPassword } from "../../utils/hash.js";
import generateTokens from "../../services/token.service.js";
import {
  createSession,
  deleteSessionsByUserId,
} from "../../repositories/session.repository.js";
import { cookieOptions } from "../../utils/cookie.js";
const updatePasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const userId = await redisClient.get(`reset_token:${token}`);

    if (!userId) {
      return res
        .status(400)
        .json({
          message: "Invalid or expired reset token. Please request a new one.",
        });
    }

    const hashedPassword = await hashPassword(password);

    await resetPassword(Number(userId), hashedPassword);

    await redisClient.del(`reset_token:${token}`);

    await deleteSessionsByUserId(Number(userId));

    const user = await getUserById(Number(userId));
    const { refreshToken, accessToken } = generateTokens(user);

    await createSession({
      user_id: user.id,
      refresh_token: refreshToken,
      user_agent: req.headers["user-agent"] || "unknown",
    });

    const clientUrl = process.env.CLIENT_URL?.split(",")[0]?.trim() || "/";

    res
      .cookie("refresh_token", refreshToken, cookieOptions)
      .redirect(`${clientUrl}/`);
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default updatePasswordController;
