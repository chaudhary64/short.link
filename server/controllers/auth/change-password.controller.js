import { getUserById, updateUser } from "../../repositories/user.repository.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";

export async function changePasswordController(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Google-authenticated users don't have a password
    if (!user.password) {
      return res.status(400).json({
        message:
          "Your account uses Google sign-in. Password changes are not available.",
      });
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await hashPassword(newPassword);
    await updateUser(userId, {
      password: hashedPassword,
      password_changed_at: new Date(),
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
