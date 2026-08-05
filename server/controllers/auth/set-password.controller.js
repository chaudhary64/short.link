import { getUserById, updateUser } from "../../repositories/user.repository.js";
import { hashPassword } from "../../utils/hash.js";
import generateTokens from "../../services/token.service.js";
import {
  createSession,
  deleteSessionsByUserId,
} from "../../repositories/session.repository.js";
import { cookieOptions } from "../../utils/cookie.js";
import { getSessionClientInfo } from "../../utils/clientInfo.js";

export async function setPasswordController(req, res) {
  try {
    const userId = req.user.id;
    const { newPassword } = req.body;

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password) {
      return res.status(400).json({
        message:
          "You already have a password. Use the change password option instead.",
      });
    }

    const hashedPassword = await hashPassword(newPassword);
    await updateUser(userId, {
      password: hashedPassword,
      password_changed_at: new Date(),
    });

    await deleteSessionsByUserId(userId);

    const { refreshToken, accessToken } = generateTokens(user);
    await createSession({
      user_id: userId,
      refresh_token: refreshToken,
      ...getSessionClientInfo(req),
    });

    res
      .status(200)
      .cookie("refresh_token", refreshToken, cookieOptions)
      .json({
        message: "Password set successfully",
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.error("Set password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
