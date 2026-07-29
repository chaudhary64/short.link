import { createUser, getUserByEmail, updateUser } from "../../repositories/user.repository.js";
import { hashPassword } from "../../utils/hash.js";
import sendEmail from "../../services/email.service.js";
import { generateVerificationToken } from "../../utils/tokens.js";
import { redisClient } from "../../db/index.js";

const signupController = async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;
    const finalGender = gender || "unknown";

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      if (existingUser.is_verified) {
        return res.status(409).json({ message: "User already exists with this email. Please log in." });
      }

      // If user exists but is not verified, update details and resend verification email
      const hashedPassword = await hashPassword(password);
      const updatedUser = await updateUser(existingUser.id, {
        name,
        password: hashedPassword,
        gender: finalGender,
      });

      const token = generateVerificationToken(updatedUser);
      await redisClient.setEx(`verify_token:${token}`, 86400, updatedUser.id.toString());

      await sendEmail({
        to: updatedUser.email,
        subject: "Verify Your Email",
        template: "verify-account",
        data: {
          name,
          verifyUrl: `${process.env.SERVER_URL}/api/auth/verify-email/${token}`,
        },
      });

      return res.status(200).json({
        message: "Verification email sent. Please check your inbox.",
      });
    }

    const hashedPassword = await hashPassword(password);
    const createdUser = await createUser({
      name,
      email,
      password: hashedPassword,
      gender: finalGender,
    });

    const { id: userId, email: userEmail } = createdUser;

    const token = generateVerificationToken(createdUser);

    await redisClient.setEx(`verify_token:${token}`, 86400, userId.toString());

    await sendEmail({
      to: userEmail,
      subject: "Verify Your Email",
      template: "verify-account",
      data: {
        name,
        verifyUrl: `${process.env.SERVER_URL}/api/auth/verify-email/${token}`,
      },
    });

    res.status(201).json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default signupController;
