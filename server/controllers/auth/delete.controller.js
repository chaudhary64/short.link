import { deleteUser } from "../../repositories/user.repository.js";

export async function deleteUserController(req, res) {
  const userId = req.user.id;

  try {
    const deletedUser = await deleteUser(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, provider_id, auth_provider, ...safeUser } = deletedUser;
    res
      .status(200)
      .json({ message: "User deleted successfully", user: safeUser });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
