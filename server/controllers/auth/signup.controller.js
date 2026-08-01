import { createUser, getUserByEmail, updateUser } from "../../repositories/user.repository.js";
import { hashPassword } from "../../utils/hash.js";
import sendEmail from "../../services/email.service.js";
import { redisClient } from "../../db/index.js";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const signupController = async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;
    const finalGender = gender || "unknown";

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      if (existingUser.is_verified) {
        return res.status(409).json({ message: "User already exists with this email. Please log in." });
      }

      // User exists but is not verified — update details and resend OTP
      const hashedPassword = await hashPassword(password);
      const updatedUser = await updateUser(existingUser.id, {
        name,
        password: hashedPassword,
        gender: finalGender,
        password_changed_at: new Date(),
      });

      const otp = generateOtp();
      await redisClient.setEx(
        `otp:${email}`,
        600, // 10 minutes
        JSON.stringify({ otp, userId: updatedUser.id }),
      );

      await sendEmail({
        to: email,
        subject: "Your Short.link Verification Code",
        template: "verify-account",
        data: { name, otp },
      });

      return res.status(200).json({
        message: "Verification code sent. Please check your inbox.",
      });
    }

    const hashedPassword = await hashPassword(password);
    const createdUser = await createUser({
      name,
      email,
      password: hashedPassword,
      gender: finalGender,
      password_changed_at: new Date(),
    });

    const otp = generateOtp();
    await redisClient.setEx(
      `otp:${email}`,
      600, // 10 minutes
      JSON.stringify({ otp, userId: createdUser.id }),
    );

    await sendEmail({
      to: email,
      subject: "Your Short.link Verification Code",
      template: "verify-account",
      data: { name, otp },
    });

    res.status(201).json({
      message: "Verification code sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default signupController;
