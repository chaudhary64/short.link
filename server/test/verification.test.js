import assert from "node:assert/strict";
import test from "node:test";

// The mailer validates its configuration at import time, so supply harmless
// values before loading the service. createTransport does not open a socket.
process.env.SMTP_HOST = "localhost";
process.env.SMTP_PORT = "587";
process.env.SMTP_USER = "test-user";
process.env.SMTP_PASSWORD = "test-password";

const { generateOtp } = await import("../services/verification.service.js");

test("generateOtp returns a six-digit numeric string in the 100000-999999 range", () => {
  for (let i = 0; i < 1000; i += 1) {
    const otp = generateOtp();

    assert.match(otp, /^[0-9]{6}$/);
    const value = Number(otp);
    assert.ok(value >= 100000 && value <= 999999);
  }
});

// Suspected defect: generateOtp uses Math.random, which is not a
// cryptographically secure source for a login verification code. This test
// only pins the current output shape; it cannot prove predictability.
