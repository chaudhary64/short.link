import assert from "node:assert/strict";
import test from "node:test";

import jwt from "jsonwebtoken";

import authenticateMiddleware from "../middlewares/authenticate.middleware.js";

process.env.ACCESS_TOKEN_SECRET = "test-access-secret";

const USER_ID = 7;

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

async function runMiddleware(headers) {
  const req = { headers };
  const res = createResponse();
  let nextCalls = 0;

  await authenticateMiddleware(req, res, () => {
    nextCalls += 1;
  });

  return { req, res, nextCalls };
}

function signAccessToken(payload, options = {}) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
    ...options,
  });
}

test("rejects a request with no authorization header", async () => {
  const { req, res, nextCalls } = await runMiddleware({});

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Unauthorized: No token provided" });
  assert.equal(nextCalls, 0);
  assert.equal(req.user, undefined);
});

test("rejects non-Bearer and malformed Bearer headers", async () => {
  for (const authorization of ["Basic abc", "Bearer", "Token abc"]) {
    const { res, nextCalls } = await runMiddleware({ authorization });

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { message: "Unauthorized: No token provided" });
    assert.equal(nextCalls, 0);
  }
});

test("rejects an empty, garbage, expired, or wrongly signed bearer token", async () => {
  const tokens = [
    "",
    "not-a-jwt",
    signAccessToken({ id: USER_ID, sid: "session-1" }, { expiresIn: -1 }),
    jwt.sign({ id: USER_ID, sid: "session-1" }, "wrong-secret"),
  ];

  for (const token of tokens) {
    const { res, nextCalls } = await runMiddleware({
      authorization: `Bearer ${token}`,
    });

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, {
      message: "Unauthorized: Invalid or expired token",
    });
    assert.equal(nextCalls, 0);
  }
});

test("rejects a valid token that has no session id", async () => {
  const token = signAccessToken({ id: USER_ID });
  const { res, nextCalls } = await runMiddleware({
    authorization: `Bearer ${token}`,
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    message: "Unauthorized: No session bound to token",
  });
  assert.equal(nextCalls, 0);
});

// The success path and the revoked-session path both call getSessionById, so
// they need a database (or module-level mocking) and are not unit-tested here.
