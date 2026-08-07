import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

function generateAccessToken(user, sid) {
  return jwt.sign({ id: user.id, sid }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, jti: nanoid() },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );
}

function generateResetToken(user) {
  return jwt.sign({ id: user.id }, process.env.RESET_PASSWORD_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return null;
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return null;
  }
}

export {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyAccessToken,
  verifyRefreshToken,
};
