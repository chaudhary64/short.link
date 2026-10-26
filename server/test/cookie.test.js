import assert from "node:assert/strict";
import test from "node:test";

// cookieOptions is computed at module load, so import fresh instances under
// distinct query strings for each NODE_ENV value.
process.env.NODE_ENV = "production";
const { cookieOptions: productionCookieOptions } = await import(
  "../utils/cookie.js?env=production"
);

process.env.NODE_ENV = "development";
const { cookieOptions: developmentCookieOptions } = await import(
  "../utils/cookie.js?env=development"
);

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

test("production refresh cookies are httpOnly, secure, and SameSite=None", () => {
  assert.deepEqual(productionCookieOptions, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: SEVEN_DAYS_MS,
  });
});

test("development refresh cookies are httpOnly, insecure, and SameSite=Lax", () => {
  assert.deepEqual(developmentCookieOptions, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: SEVEN_DAYS_MS,
  });
});
