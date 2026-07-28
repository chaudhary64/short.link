import { createUser } from "../../repositories/user.repository.js";
import { hashPassword } from "../../utils/hash.js";
import { createSession } from "../../repositories/session.repository.js";
import { cookieOptions } from "../../utils/cookie.js";
import generateTokens from "../../services/token.service.js";

const signupController = async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;
    const finalGender = gender || "unknown";

    const hashedPassword = await hashPassword(password);
    const createdUser = await createUser({
      name,
      email,
      password: hashedPassword,
      gender: finalGender,
    });

    const { refreshToken, accessToken } = generateTokens(createdUser);

    await createSession({
      user_id: createdUser.id,
      refresh_token: refreshToken,
      user_agent: req.headers["user-agent"] || "unknown",
    });

    const { name: userName, email: userEmail, created_at, gender: userGender } = createdUser;

    res
      .status(201)
      .cookie("refresh_token", refreshToken, cookieOptions)
      .json({
        message: "User created successfully",
        user: { name: userName, email: userEmail, created_at, gender: userGender },
        accessToken,
        refreshToken,
      });
  } catch (error) {
    if (error.code === '23505') {
      return res
        .status(409)
        .json({ message: "User already exists", error: error.message });
    }
    
    console.error("Signup error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error" });
  }
};

export default signupController;
