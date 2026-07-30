import { updateUser } from "../../repositories/user.repository.js";

export async function updateInfoController(req, res) {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const updatedUser = await updateUser(userId, { name });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User information updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        gender: updatedUser.gender,
        created_at: updatedUser.created_at,
        has_password: !!updatedUser.password,
        has_google: !!updatedUser.provider_id,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
