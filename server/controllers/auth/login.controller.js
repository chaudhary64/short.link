import { createSession } from "../../repositories/session.repository.js";
import { getUserByEmail } from "../../repositories/user.repository.js";
import generateTokens from "../../services/token.service.js";
import { cookieOptions } from "../../utils/cookie.js";
import { comparePassword } from "../../utils/hash.js";

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);

    const isPasswordValid =
      user && (await comparePassword(password, user.password));

    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { refreshToken, accessToken } = generateTokens(user);

    await createSession({
      user_id: user.id,
      refresh_token: refreshToken,
      user_agent: req.headers["user-agent"] || "unknown",
    });

    const { name: userName, email: userEmail, created_at } = user;

    res
      .status(200)
      .cookie("refresh_token", refreshToken, cookieOptions)
      .json({
        message: "Login successful",
        user: { name: userName, email: userEmail, created_at },
        accessToken,
        refreshToken,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export default loginController;
