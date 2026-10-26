import assert from "node:assert/strict";
import test from "node:test";

import * as validation from "../validations/auth.validation.js";

function invoke(middleware, body) {
  const req = { body };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  let nextCalls = 0;

  middleware(req, res, () => {
    nextCalls += 1;
  });

  return { req, res, nextCalls };
}

test("signup reports a missing name, email, and password", () => {
  const { res, nextCalls } = invoke(validation.validateSignup, {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Validation failed");
  assert.deepEqual(res.body.errors, {
    name: ["Name is required"],
    email: ["Email is required"],
    password: ["Password is required"],
  });
  assert.equal(nextCalls, 0);
});

test("signup rejects an invalid name, email, and password", () => {
  const { res, nextCalls } = invoke(validation.validateSignup, {
    name: "A",
    email: "not-an-email",
    password: "1234567",
  });

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body.errors, {
    name: ["Name must be at least 2 characters"],
    email: ["Invalid email address"],
    password: ["Password must be at least 8 characters"],
  });
  assert.equal(nextCalls, 0);
});

test("signup accepts valid input but does not apply trim to req.body", () => {
  const { req, res, nextCalls } = invoke(validation.validateSignup, {
    name: "  Alice ",
    email: " alice@example.com ",
    password: "password123",
  });

  assert.equal(res.statusCode, null);
  assert.equal(nextCalls, 1);
  // Suspected defect: validateSignup does not assign result.data back to
  // req.body, so the controller receives the untrimmed values.
  assert.equal(req.body.name, "  Alice ");
  assert.equal(req.body.email, " alice@example.com ");
});

test("login reports a missing password and rejects a bad email", () => {
  const missingPassword = invoke(validation.validateLogin, {
    email: "alice@example.com",
  });
  assert.equal(missingPassword.res.statusCode, 400);
  assert.deepEqual(missingPassword.res.body.errors, {
    password: ["Password is required"],
  });

  const badEmail = invoke(validation.validateLogin, {
    email: "not-an-email",
    password: "password123",
  });
  assert.equal(badEmail.res.statusCode, 400);
  assert.deepEqual(badEmail.res.body.errors, {
    email: ["Invalid email address"],
  });
});

test("login accepts valid input and leaves trim unapplied to req.body", () => {
  const { req, res, nextCalls } = invoke(validation.validateLogin, {
    email: " alice@example.com ",
    password: " password123 ",
  });

  assert.equal(res.statusCode, null);
  assert.equal(nextCalls, 1);
  // Same dead transform as signup: the schema trims, but req.body is not
  // replaced, so the controller still sees the surrounding spaces.
  assert.equal(req.body.email, " alice@example.com ");
  assert.equal(req.body.password, " password123 ");
});

test("update enforces the 2-50 character name bounds", () => {
  for (const name of ["A", "x".repeat(51)]) {
    const { res, nextCalls } = invoke(validation.validateUpdateUser, { name });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, "Validation failed");
    assert.equal(nextCalls, 0);
  }
});

test("update trims the name and replaces req.body", () => {
  const { req, res, nextCalls } = invoke(validation.validateUpdateUser, {
    name: "  Bob ",
  });

  assert.equal(res.statusCode, null);
  assert.equal(nextCalls, 1);
  assert.equal(req.body.name, "Bob");
});

test("reset password requires matching passwords of at least 8 characters", () => {
  const mismatch = invoke(validation.validateResetPassword, {
    password: "password123",
    confirmPassword: "password124",
  });
  assert.equal(mismatch.res.statusCode, 400);
  assert.deepEqual(mismatch.res.body.errors, {
    confirmPassword: ["Passwords do not match"],
  });

  const tooShort = invoke(validation.validateResetPassword, {
    password: "short",
    confirmPassword: "short",
  });
  assert.equal(tooShort.res.statusCode, 400);
  assert.deepEqual(tooShort.res.body.errors, {
    password: ["Password must be at least 8 characters"],
  });

  const valid = invoke(validation.validateResetPassword, {
    password: "password123",
    confirmPassword: "password123",
  });
  assert.equal(valid.res.statusCode, null);
  assert.equal(valid.nextCalls, 1);
});

test("change password requires the current password and a new one of 8+ characters", () => {
  const missingCurrent = invoke(validation.validateChangePassword, {
    newPassword: "password123",
  });
  assert.equal(missingCurrent.res.statusCode, 400);
  assert.deepEqual(missingCurrent.res.body.errors, {
    currentPassword: ["Current password is required"],
  });

  const shortNew = invoke(validation.validateChangePassword, {
    currentPassword: "old-password",
    newPassword: "short",
  });
  assert.equal(shortNew.res.statusCode, 400);
  assert.deepEqual(shortNew.res.body.errors, {
    newPassword: ["New password must be at least 8 characters"],
  });

  const valid = invoke(validation.validateChangePassword, {
    currentPassword: "old-password",
    newPassword: "password123",
  });
  assert.equal(valid.res.statusCode, null);
  assert.equal(valid.nextCalls, 1);
});

test("set password rejects values shorter than 8 characters", () => {
  const tooShort = invoke(validation.validateSetPassword, {
    newPassword: "short",
  });
  assert.equal(tooShort.res.statusCode, 400);
  assert.deepEqual(tooShort.res.body.errors, {
    newPassword: ["New password must be at least 8 characters"],
  });

  const valid = invoke(validation.validateSetPassword, {
    newPassword: "password123",
  });
  assert.equal(valid.res.statusCode, null);
  assert.equal(valid.nextCalls, 1);
});

test("forgot password rejects a malformed email and accepts a valid one", () => {
  const invalid = invoke(validation.validateForgotPassword, {
    email: "not-an-email",
  });
  assert.equal(invalid.res.statusCode, 400);
  assert.deepEqual(invalid.res.body.errors, {
    email: ["Invalid email address"],
  });

  const valid = invoke(validation.validateForgotPassword, {
    email: "alice@example.com",
  });
  assert.equal(valid.res.statusCode, null);
  assert.equal(valid.nextCalls, 1);
});

test("request email change rejects a malformed address and accepts a valid one", () => {
  const invalid = invoke(validation.validateRequestEmailChange, {
    newEmail: "not-an-email",
  });
  assert.equal(invalid.res.statusCode, 400);
  assert.deepEqual(invalid.res.body.errors, {
    newEmail: ["Invalid email address"],
  });

  const valid = invoke(validation.validateRequestEmailChange, {
    newEmail: "new@example.com",
  });
  assert.equal(valid.res.statusCode, null);
  assert.equal(valid.nextCalls, 1);
});

test("email-change OTP must be exactly 6 characters", () => {
  const tooShort = invoke(validation.validateVerifyEmailChange, { otp: "12345" });
  assert.equal(tooShort.res.statusCode, 400);
  assert.deepEqual(tooShort.res.body.errors, {
    otp: ["OTP must be 6 characters"],
  });

  // Suspected gap: only the length is checked, so six letters are accepted.
  const letters = invoke(validation.validateVerifyEmailChange, {
    otp: "abcdef",
  });
  assert.equal(letters.res.statusCode, null);
  assert.equal(letters.nextCalls, 1);
});

test("resend code requires an email", () => {
  const { res, nextCalls } = invoke(validation.validateResendCode, {});

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body.errors, { email: ["Email is required"] });
  assert.equal(nextCalls, 0);
});

test("verification OTP requires an email and 6 characters", () => {
  const missingOtp = invoke(validation.validateVerifyOtp, {
    email: "alice@example.com",
  });
  assert.equal(missingOtp.res.statusCode, 400);
  assert.deepEqual(missingOtp.res.body.errors, {
    otp: ["OTP is required"],
  });

  const missingEmail = invoke(validation.validateVerifyOtp, { otp: "123456" });
  assert.equal(missingEmail.res.statusCode, 400);
  assert.deepEqual(missingEmail.res.body.errors, {
    email: ["Email is required"],
  });

  // Suspected gap: numeric OTPs are not enforced, only the length.
  const letters = invoke(validation.validateVerifyOtp, {
    email: "alice@example.com",
    otp: "abcdef",
  });
  assert.equal(letters.res.statusCode, null);
  assert.equal(letters.nextCalls, 1);
});
