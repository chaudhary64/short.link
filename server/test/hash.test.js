import assert from "node:assert/strict";
import test from "node:test";

import { comparePassword, hashPassword } from "../utils/hash.js";

const PASSWORD = "correct horse battery staple";
const hashed = await hashPassword(PASSWORD);

test("hashPassword returns a bcrypt hash rather than the plaintext", () => {
  assert.notEqual(hashed, PASSWORD);
  assert.match(hashed, /^\$2[aby]\$10\$/);
  assert.equal(hashed.length, 60);
});

test("comparePassword accepts the correct password and rejects a wrong one", async () => {
  assert.equal(await comparePassword(PASSWORD, hashed), true);
  assert.equal(await comparePassword("wrong password", hashed), false);
});

test("hashing the same password twice produces different salts and both verify", async () => {
  const again = await hashPassword(PASSWORD);

  assert.notEqual(again, hashed);
  assert.equal(await comparePassword(PASSWORD, again), true);
  assert.equal(await comparePassword(PASSWORD, hashed), true);
});

test("bcrypt ignores bytes past 72, so long passwords collide", async () => {
  // Suspected gap: the signup schema has no maximum password length, and
  // bcrypt truncates at 72 bytes. These two different passwords verify
  // against the same hash.
  const base = "a".repeat(72);
  const longHash = await hashPassword(`${base}X`);

  assert.equal(await comparePassword(`${base}Y`, longHash), true);
});
