import { redisClient } from "../../db/index.js";
import { verifyUser } from "../../repositories/user.repository.js";
import generateTokens from "../../services/token.service.js";
import { createSession } from "../../repositories/session.repository.js";
import sendEmail from "../../services/email.service.js";
import { cookieOptions } from "../../utils/cookie.js";

const verifyAccountController = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const stored = await redisClient.get(`otp:${normalizedEmail}`);

    if (!stored) {
      return res.status(400).json({ message: "OTP has expired or is invalid. Please sign up again." });
    }

    const { otp: storedOtp, userId } = JSON.parse(stored);

    if (otp.toString() !== storedOtp) {
      return res.status(400).json({ message: "Incorrect OTP. Please try again." });
    }

    const user = await verifyUser(Number(userId));

    await redisClient.del(`otp:${normalizedEmail}`);

    const { refreshToken, accessToken } = generateTokens(user);

    await createSession({
      user_id: user.id,
      refresh_token: refreshToken,
      user_agent: req.headers["user-agent"] || "unknown",
    });

    sendEmail({
      to: user.email,
      subject: "Welcome to Short.link!",
      template: "welcome",
      data: {
        name: user.name,
        actionUrl: `${process.env.CLIENT_URL?.split(",")[0]?.trim()}/dashboard`,
      },
    }).catch((err) =>
      console.error("[Welcome Email Error]:", err),
    );

    res
      .cookie("refresh_token", refreshToken, cookieOptions)
      .status(200)
      .json({
        message: "Account verified successfully",
        accessToken,
        user: {
          name: user.name,
          email: user.email,
          gender: user.gender,
          created_at: user.created_at,
          password_changed_at: user.password_changed_at,
          has_password: !!user.password,
          has_google: !!user.provider_id,
        },
      });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default verifyAccountController;
