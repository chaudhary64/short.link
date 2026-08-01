import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { usersTable } from "../models/user.schema.js";

async function getUserById(id) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));

  return user;
}

async function getUserByEmail(email) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return user;
}

async function getUserByProviderId(providerId) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.provider_id, providerId));

  return user;
}

async function createUser(userData) {
  const [user] = await db.insert(usersTable).values(userData).returning();

  return user;
}

async function updateUser(id, userData) {
  const [user] = await db
    .update(usersTable)
    .set(userData)
    .where(eq(usersTable.id, id))
    .returning();

  return user;
}

async function deleteUser(id) {
  const [user] = await db
    .delete(usersTable)
    .where(eq(usersTable.id, id))
    .returning();

  return user;
}

async function resetPassword(id, newPassword) {
  const [user] = await db
    .update(usersTable)
    .set({
      password: newPassword,
      is_verified: true,
      password_changed_at: new Date(),
    })
    .where(eq(usersTable.id, id))
    .returning();

  return user;
}

async function verifyUser(id) {
  const [user] = await db
    .update(usersTable)
    .set({ is_verified: true })
    .where(eq(usersTable.id, id))
    .returning();

  return user;
}

export {
  getUserById,
  getUserByEmail,
  getUserByProviderId,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  verifyUser,
};
