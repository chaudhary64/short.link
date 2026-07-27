import { redisClient } from "../../db/index.js";
import { resetPassword } from "../../repositories/user.repository.js";
import { hashPassword } from "../../utils/hash.js";

const updatePasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 1. Verify the token in Redis
    const userId = await redisClient.get(`reset_token:${token}`);

    if (!userId) {
      return res
        .status(400)
        .json({
          message: "Invalid or expired reset token. Please request a new one.",
        });
    }

    // 2. Hash the new password
    const hashedPassword = await hashPassword(password);

    // 3. Update the user's password in the database
    // Ensure the ID is parsed as integer if necessary, depending on your DB schema (PostgreSQL serial is integer, UUID is string)
    // Here we pass the raw userId, if your DB expects a number, you might need parseInt(userId, 10)
    await resetPassword(userId, hashedPassword);

    // 4. Delete the token so it cannot be used again
    await redisClient.del(`reset_token:${token}`);

    res
      .status(200)
      .json({
        message: "Password has been successfully reset. You can now log in.",
      });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default updatePasswordController;
