import {
  createUser,
  getUserByEmail,
  updateUser,
} from "../../repositories/user.repository.js";
import { hashPassword } from "../../utils/hash.js";
import { sendVerificationCode } from "../../services/verification.service.js";

const signupController = async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;
    const finalGender = gender || "unknown";
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await getUserByEmail(normalizedEmail);

    if (existingUser) {
      if (existingUser.is_verified) {
        return res
          .status(409)
          .json({
            message: "User already exists with this email. Please log in.",
          });
      }

      const hashedPassword = await hashPassword(password);
      const updatedUser = await updateUser(existingUser.id, {
        name,
        password: hashedPassword,
        gender: finalGender,
        password_changed_at: new Date(),
      });

      await sendVerificationCode(normalizedEmail, updatedUser);

      return res.status(200).json({
        message: "Verification code sent. Please check your inbox.",
      });
    }

    const hashedPassword = await hashPassword(password);
    const createdUser = await createUser({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      gender: finalGender,
      password_changed_at: new Date(),
    });

    await sendVerificationCode(normalizedEmail, createdUser);

    res.status(201).json({
      message: "Verification code sent. Please check your inbox.",
    });
  } catch (error) {
    if (error?.code === "23505") {
      return res.status(409).json({
        message: "User already exists with this email. Please log in.",
      });
    }
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default signupController;
