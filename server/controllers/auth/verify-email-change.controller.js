import { getUserById, updateUser } from "../../repositories/user.repository.js";
import { redisClient } from "../../db/index.js";

export async function verifyEmailChangeController(req, res) {
  try {
    const userId = req.user.id;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const stored = await redisClient.get(`email-change:${userId}`);
    if (!stored) {
      return res.status(400).json({ message: "OTP has expired or is invalid. Please request a new code." });
    }

    const { otp: storedOtp, newEmail, userId: storedUserId } = JSON.parse(stored);

    if (otp.toString() !== storedOtp) {
      return res.status(400).json({ message: "Incorrect OTP. Please try again." });
    }

    if (Number(storedUserId) !== userId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const updatedUser = await updateUser(userId, { email: newEmail });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await redisClient.del(`email-change:${userId}`);

    res.status(200).json({
      message: "Email updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        gender: updatedUser.gender,
        created_at: updatedUser.created_at,
        password_changed_at: updatedUser.password_changed_at,
        has_password: !!updatedUser.password,
        has_google: !!updatedUser.provider_id,
      },
    });
  } catch (error) {
    console.error("Verify email change error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}