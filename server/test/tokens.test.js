import assert from "node:assert/strict";
import test from "node:test";

import jwt from "jsonwebtoken";

import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/tokens.js";

process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
process.env.RESET_PASSWORD_TOKEN_SECRET = "test-reset-secret";

const user = { id: 42 };

function tamperPayload(token) {
  const [header, payload, signature] = token.split(".");
  const lastChar = payload.at(-1);
  return `${header}.${payload.slice(0, -1)}${lastChar === "A" ? "B" : "A"}.${signature}`;
}

test("access token round-trips the user id and session id with a 15 minute expiry", () => {
  const token = generateAccessToken(user, "session-1");
  const decoded = verifyAccessToken(token);

  assert.ok(decoded);
  assert.equal(decoded.id, 42);
  assert.equal(decoded.sid, "session-1");
  assert.equal(decoded.exp - decoded.iat, 15 * 60);
});

test("refresh token round-trips the user id, carries a jti, and expires in 7 days", () => {
  const token = generateRefreshToken(user);
  const decoded = verifyRefreshToken(token);

  assert.ok(decoded);
  assert.equal(decoded.id, 42);
  assert.equal(typeof decoded.jti, "string");
  assert.ok(decoded.jti.length > 0);
  assert.equal(decoded.exp - decoded.iat, 7 * 24 * 60 * 60);
});

test("two refresh tokens for the same user have different jti values", () => {
  const first = verifyRefreshToken(generateRefreshToken(user));
  const second = verifyRefreshToken(generateRefreshToken(user));

  assert.notEqual(first.jti, second.jti);
});

test("garbage, tampered, and wrongly signed tokens are rejected", () => {
  const token = generateAccessToken(user, "session-1");

  assert.equal(verifyAccessToken("not-a-jwt"), null);
  assert.equal(verifyAccessToken(tamperPayload(token)), null);
  assert.equal(
    verifyAccessToken(
      jwt.sign({ id: 42, sid: "session-1" }, "some-other-secret"),
    ),
    null,
  );
});

test("expired tokens are rejected", () => {
  const expired = jwt.sign(
    { id: 42, sid: "session-1" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: -1 },
  );

  assert.equal(verifyAccessToken(expired), null);
});

test("tokens do not verify under another token type's secret", () => {
  const accessToken = generateAccessToken(user, "session-1");
  const refreshToken = generateRefreshToken(user);
  const resetToken = generateResetToken(user);

  assert.equal(verifyAccessToken(refreshToken), null);
  assert.equal(verifyAccessToken(resetToken), null);
  assert.equal(verifyRefreshToken(accessToken), null);
});

test("reset token verifies with the reset secret and expires in 15 minutes", () => {
  const token = generateResetToken(user);
  const decoded = jwt.verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET);

  assert.equal(decoded.id, 42);
  assert.equal(decoded.exp - decoded.iat, 15 * 60);
});
