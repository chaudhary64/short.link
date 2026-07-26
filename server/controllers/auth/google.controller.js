import { createSession } from "../../repositories/session.repository.js";
import { getUserByProviderId, getUserByEmail, createUser, updateUser } from "../../repositories/user.repository.js";
import generateTokens from "../../services/token.service.js";
import { cookieOptions } from "../../utils/cookie.js";

const googleController = async (req, res) => {
  try {
    const { token } = req.body; // This is now the access_token

    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Fetch user profile from Google using the access token
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const payload = await response.json();
    const { sub: googleId, email, name } = payload;

    // Check if user already exists by provider ID
    let user = await getUserByProviderId(googleId);

    if (!user) {
      // Check if a user with this email already exists (they signed up with email/pass previously)
      user = await getUserByEmail(email);

      if (user) {
        // Link the Google account to the existing email
        user = await updateUser(user.id, {
          provider_id: googleId,
          auth_provider: "google",
        });
      } else {
        // Create a new user
        user = await createUser({
          name: name,
          email: email,
          password: null, // No password for Google users
          auth_provider: "google",
          provider_id: googleId,
        });
      }
    }

    // Generate our own JWT tokens exactly like local login
    const { refreshToken, accessToken } = generateTokens(user);

    await createSession({
      user_id: user.id,
      refresh_token: refreshToken,
      user_agent: req.headers["user-agent"] || "unknown",
    });

    const { name: userName, email: userEmail, created_at } = user;

    res.status(200).cookie("refresh_token", refreshToken, cookieOptions).json({
      message: "Google Login successful",
      user: { name: userName, email: userEmail, created_at },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export default googleController;
