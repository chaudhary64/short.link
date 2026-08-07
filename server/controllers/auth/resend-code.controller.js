import { getUserByEmail } from "../../repositories/user.repository.js";
import {
  getStoredOtp,
  storeOtp,
  clearOtp,
  sendVerificationCode,
} from "../../services/verification.service.js";

const resendCodeController = async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(200).json({
        message: "If an account exists, a verification code has been sent.",
      });
    }

    if (user.is_verified) {
      return res.status(400).json({
        message: "This account is already verified. Please log in.",
      });
    }

    const previous = await getStoredOtp(email);

    try {
      await sendVerificationCode(email, user);
    } catch (error) {
      if (previous) {
        await storeOtp(email, previous.otp, previous.userId);
      } else {
        await clearOtp(email);
      }
      throw error;
    }

    res.status(200).json({
      message: "Verification code sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend code error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default resendCodeController;
