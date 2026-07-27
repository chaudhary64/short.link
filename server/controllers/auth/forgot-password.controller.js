import sendEmail from "../../services/email.service.js";
import resetEmailTemplate from "../../templates/reset-password.template.js";
import { getUserByEmail } from "../../repositories/user.repository.js";
import { generateResetToken } from "../../utils/tokens.js";
import { redisClient } from "../../db/index.js";

const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await getUserByEmail(email);
    if (!user) {
      return res
        .status(200)
        .json({
          message: "If an account exists, a reset email has been sent.",
        });
    }

    const resetToken = generateResetToken(user);
    await redisClient.setEx(
      `reset_token:${resetToken}`,
      600,
      user.id.toString(),
    );
    await sendEmail(email, "Reset Password", resetEmailTemplate(resetToken));

    res
      .status(200)
      .json({ message: "If an account exists, a reset email has been sent." });
  } catch (error) {
    console.error("Error sending reset email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default forgotPasswordController;
