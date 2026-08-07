import { getUserById, updateUser } from "../../repositories/user.repository.js";
import { redisClient } from "../../db/index.js";
import sendEmail from "../../services/email.service.js";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestEmailChangeController(req, res) {
  try {
    const userId = req.user.id;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ message: "New email is required" });
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.email.toLowerCase() === normalizedEmail) {
      return res
        .status(400)
        .json({ message: "New email must be different from current email" });
    }

    const { getUserByEmail } =
      await import("../../repositories/user.repository.js");
    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    const otp = generateOtp();

    await redisClient.setEx(
      `email-change:${userId}`,
      600,
      JSON.stringify({ otp, newEmail: normalizedEmail, userId }),
    );

    await sendEmail({
      to: normalizedEmail,
      subject: "Verify your new email address",
      template: "verify-account",
      data: { name: user.name, otp },
    });

    res.status(200).json({
      message: "Verification code sent to your new email address",
    });
  } catch (error) {
    console.error("Request email change error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
