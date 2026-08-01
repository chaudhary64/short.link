import { createSession } from "../../repositories/session.repository.js";
import { getUserByEmail } from "../../repositories/user.repository.js";
import generateTokens from "../../services/token.service.js";
import { cookieOptions } from "../../utils/cookie.js";
import { comparePassword } from "../../utils/hash.js";

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Google-auth users without a password cannot login via email/password
    if (!user.password) {
      return res.status(401).json({
        message:
          "This account uses Google sign-in. Please sign in with Google instead, or set a password in your account settings.",
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
      });
    }

    const { refreshToken, accessToken } = generateTokens(user);

    await createSession({
      user_id: user.id,
      refresh_token: refreshToken,
      user_agent: req.headers["user-agent"] || "unknown",
    });

    const hasPassword = !!user.password;
    const hasGoogle = !!user.provider_id;
    const {
      name: userName,
      email: userEmail,
      created_at,
      password_changed_at,
    } = user;

    res
      .status(200)
      .cookie("refresh_token", refreshToken, cookieOptions)
      .json({
        message: "Login successful",
        user: {
          name: userName,
          email: userEmail,
          created_at,
          password_changed_at,
          has_password: hasPassword,
          has_google: hasGoogle,
        },
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default loginController;
