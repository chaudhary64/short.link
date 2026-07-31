import { getUserById, getUserByProviderId, updateUser } from "../../repositories/user.repository.js";

const linkGoogleController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Verify the Google token
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
    const { sub: googleId, email: googleEmail } = payload;

    // Get the current user
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already has Google linked
    if (user.provider_id) {
      return res.status(400).json({
        message: "Your Google account is already linked.",
      });
    }

    // Verify that the Google account email matches the user's email
    if (user.email.toLowerCase() !== googleEmail.toLowerCase()) {
      return res.status(400).json({
        message: "The Google account email does not match your account email. Please sign in with the same email.",
      });
    }

    // Check if this Google account is already linked to another user
    const existingGoogleUser = await getUserByProviderId(googleId);
    if (existingGoogleUser) {
      return res.status(400).json({
        message: "This Google account is already linked to another user.",
      });
    }

    // Link the Google account
    await updateUser(userId, {
      provider_id: googleId,
    });

    res.status(200).json({
      message: "Google account linked successfully",
      user: {
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        gender: user.gender,
        has_password: !!user.password,
        has_google: true,
      },
    });
  } catch (error) {
    console.error("Link Google error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default linkGoogleController;
