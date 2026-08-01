import { getUserById, updateUser } from "../../repositories/user.repository.js";
import { hashPassword } from "../../utils/hash.js";

export async function setPasswordController(req, res) {
  try {
    const userId = req.user.id;
    const { newPassword } = req.body;

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only users without a password can use this endpoint
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

    res.status(200).json({ message: "Password set successfully" });
  } catch (error) {
    console.error("Set password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
