import { redisClient } from "../../db/index.js";
import { verifyUser, getUserById } from "../../repositories/user.repository.js";
import generateTokens from "../../services/token.service.js";
import { createSession } from "../../repositories/session.repository.js";
import sendEmail from "../../services/email.service.js";
import { cookieOptions } from "../../utils/cookie.js";

const verifyAccountController = async (req, res) => {
  const { token } = req.params;

  try {
    const userId = await redisClient.get(`verify_token:${token}`);
    if (!userId) {
      return res.status(400).send("Invalid or expired verification link. Please sign up again.");
    }

    const user = await verifyUser(Number(userId));

    await redisClient.del(`verify_token:${token}`);

    const { refreshToken } = generateTokens(user);

    await createSession({
      user_id: user.id,
      refresh_token: refreshToken,
      user_agent: req.headers["user-agent"] || "unknown",
    });

    const origins = process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(",").map((u) => u.trim().replace(/\/$/, ""))
      : ["http://localhost:5173"];

    const isProduction = process.env.NODE_ENV === "production";
    const clientUrl = isProduction
      ? (origins.find((u) => !u.includes("localhost") && !u.includes("127.0.0.1")) || origins[0])
      : (origins.find((u) => u.includes("localhost") || u.includes("127.0.0.1")) || origins[0]);

    sendEmail({
      to: user.email,
      subject: "Welcome to Short.link!",
      template: "welcome",
      data: {
        name: user.name,
        actionUrl: `${clientUrl}/dashboard`,
      },
    }).catch((err) =>
      console.error("[Welcome Email Error] Failed to send welcome email:", err),
    );

    res
      .cookie("refresh_token", refreshToken, cookieOptions)
      .render("verified-account", {
        dashboardUrl: `${clientUrl}/dashboard`,
      });
  } catch (error) {
    console.error("Error verifying account:", error);
    res.status(500).send("Internal server error");
  }
};

export default verifyAccountController;

