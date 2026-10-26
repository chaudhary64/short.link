import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { hashRefreshToken } from "../repositories/session.repository.js";

const TOKEN = "refresh-token-example";

test("hashRefreshToken returns 64 lowercase hex characters and never the raw token", () => {
  const hash = hashRefreshToken(TOKEN);

  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(hash.length, 64);
  assert.notEqual(hash, TOKEN);
});

test("hashRefreshToken is deterministic for the same token", () => {
  assert.equal(hashRefreshToken(TOKEN), hashRefreshToken(TOKEN));
});

test("hashRefreshToken produces a different digest for different tokens", () => {
  const hash = hashRefreshToken(TOKEN);

  assert.notEqual(hash, hashRefreshToken(`${TOKEN}-other`));
  assert.notEqual(hash, hashRefreshToken("refresh-token-examplf"));
});

test("hashRefreshToken matches an independently computed SHA-256", () => {
  const expected = createHash("sha256").update(TOKEN).digest("hex");

  assert.equal(hashRefreshToken(TOKEN), expected);
});
