import { redisClient } from "../../db/index.js";

const renderResetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;

    const userId = await redisClient.get(`reset_token:${token}`);

    if (!userId) {
      return res
        .status(400)
        .send(
          "Invalid or expired token. Please request a new password reset link.",
        );
    }

    res.render("forgot-password", { token });
  } catch (err) {
    console.error("Redis Error:", err);
    res.status(500).send("Internal server error.");
  }
};

export default renderResetPasswordController;
