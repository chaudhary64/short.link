import { createSession } from "../../repositories/session.repository.js";
import {
  getUserByProviderId,
  getUserByEmail,
  createUser,
  updateUser,
} from "../../repositories/user.repository.js";
import generateTokens from "../../services/token.service.js";
import { cookieOptions } from "../../utils/cookie.js";

const googleController = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const payload = await response.json();
    const { sub: googleId, email, name, gender: googleGender } = payload;
    const gender = googleGender || "unknown";

    let user = await getUserByProviderId(googleId);

    if (!user) {
      user = await getUserByEmail(email);

      if (user) {
        // Link Google account but keep original auth_provider
        user = await updateUser(user.id, {
          provider_id: googleId,
          is_verified: true,
        });
      } else {
        user = await createUser({
          name: name,
          email: email,
          password: null,
          auth_provider: "google",
          provider_id: googleId,
          gender: gender,
          is_verified: true,
        });
      }
    }

    const { refreshToken, accessToken } = generateTokens(user);

    await createSession({
      user_id: user.id,
      refresh_token: refreshToken,
      user_agent: req.headers["user-agent"] || "unknown",
    });

    const {
      name: userName,
      email: userEmail,
      created_at,
      gender: userGender,
    } = user;
    const hasPassword = !!user.password;
    const hasGoogle = !!user.provider_id;

    res
      .status(200)
      .cookie("refresh_token", refreshToken, cookieOptions)
      .json({
        message: "Google Login successful",
        user: {
          name: userName,
          email: userEmail,
          created_at,
          gender: userGender,
          has_password: hasPassword,
          has_google: hasGoogle,
        },
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export default googleController;
