import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

function generateAccessToken(user) {
  return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(user) {
  // jti guarantees uniqueness — two logins in the same second would otherwise
  // produce byte-identical JWTs (same payload + same second-level iat) and
  // collide on the sessions.refresh_token unique index.
  return jwt.sign({ id: user.id, jti: nanoid() }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

function generateVerificationToken(user) {
  return jwt.sign({ id: user.id }, process.env.VERIFICATION_TOKEN_SECRET, {
    expiresIn: "1d",
  });
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

function verifyVerificationToken(token) {
  try {
    return jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);
  } catch (err) {
    return null;
  }
}

function verifyResetToken(token) {
  try {
    return jwt.verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET);
  } catch (err) {
    return null;
  }
}

export {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  generateResetToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyVerificationToken,
  verifyResetToken,
};
