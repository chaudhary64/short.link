import assert from "node:assert/strict";
import test from "node:test";

import * as validation from "../validations/links.validation.js";

function invoke(middleware, { body = {}, params = {}, query = {} } = {}) {
  const req = { body, params, query };
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

test("create link reports a missing originalUrl", () => {
  const { res, nextCalls } = invoke(validation.validateLink, { body: {} });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Validation failed");
  assert.deepEqual(res.body.errors, { originalUrl: ["URL is required"] });
  assert.equal(nextCalls, 0);
});

test("create link rejects malformed URLs", () => {
  const { res } = invoke(validation.validateLink, {
    body: { originalUrl: "not a url" },
  });

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body.errors, {
    originalUrl: [
      "Invalid URL format",
      "URL must start with http:// or https://",
    ],
  });
});

test("create link rejects non-http protocols", () => {
  for (const originalUrl of [
    "ftp://example.com/file",
    "javascript:alert(1)",
    "data:text/html,hi",
  ]) {
    const { res, nextCalls } = invoke(validation.validateLink, {
      body: { originalUrl },
    });

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body.errors, {
      originalUrl: ["URL must start with http:// or https://"],
    });
    assert.equal(nextCalls, 0);
  }
});

test("create link accepts http and https and replaces req.body with trimmed values", () => {
  const http = invoke(validation.validateLink, {
    body: { originalUrl: "  http://example.com/a  " },
  });
  assert.equal(http.res.statusCode, null);
  assert.equal(http.nextCalls, 1);
  assert.equal(http.req.body.originalUrl, "http://example.com/a");

  const https = invoke(validation.validateLink, {
    body: { originalUrl: "https://example.com/a" },
  });
  assert.equal(https.res.statusCode, null);
  assert.equal(https.nextCalls, 1);
  assert.equal(https.req.body.originalUrl, "https://example.com/a");
});

test("create link turns an empty shortCode into undefined", () => {
  const { req, res, nextCalls } = invoke(validation.validateLink, {
    body: { originalUrl: "https://example.com", shortCode: "" },
  });

  assert.equal(res.statusCode, null);
  assert.equal(nextCalls, 1);
  assert.equal(req.body.shortCode, undefined);
});

test("create link enforces the 21 character shortCode limit", () => {
  const atLimit = invoke(validation.validateLink, {
    body: {
      originalUrl: "https://example.com",
      shortCode: "a".repeat(21),
    },
  });
  assert.equal(atLimit.res.statusCode, null);
  assert.equal(atLimit.nextCalls, 1);
  assert.equal(atLimit.req.body.shortCode, "a".repeat(21));

  const overLimit = invoke(validation.validateLink, {
    body: {
      originalUrl: "https://example.com",
      shortCode: "a".repeat(22),
    },
  });
  assert.equal(overLimit.res.statusCode, 400);
  assert.deepEqual(overLimit.res.body.errors, {
    shortCode: ["Custom short code must be 21 characters or fewer"],
  });
});

test("create link restricts shortCode to letters, numbers, dashes, and underscores", () => {
  const invalid = invoke(validation.validateLink, {
    body: { originalUrl: "https://example.com", shortCode: "bad code!" },
  });
  assert.equal(invalid.res.statusCode, 400);
  assert.deepEqual(invalid.res.body.errors, {
    shortCode: [
      "Custom short code can only contain letters, numbers, dashes, and underscores",
    ],
  });

  for (const shortCode of ["a_b-c", "___", "---"]) {
    const valid = invoke(validation.validateLink, {
      body: { originalUrl: "https://example.com", shortCode },
    });
    assert.equal(valid.res.statusCode, null);
    assert.equal(valid.nextCalls, 1);
    assert.equal(valid.req.body.shortCode, shortCode);
  }
});

test("edit link replaces the body with trimmed values and accepts a non-empty id", () => {
  const { req, res, nextCalls } = invoke(validation.validateEditLink, {
    body: { originalUrl: "  https://example.com/x  ", shortCode: " ok " },
    params: { id: " 12 " },
  });

  assert.equal(res.statusCode, null);
  assert.equal(nextCalls, 1);
  assert.equal(req.body.originalUrl, "https://example.com/x");
  assert.equal(req.body.shortCode, "ok");
  // Only the body is replaced; params are validated but left untouched.
  assert.equal(req.params.id, " 12 ");
});

test("edit link validates params.id after the body", () => {
  const missing = invoke(validation.validateEditLink, {
    body: { originalUrl: "https://example.com" },
    params: {},
  });
  assert.equal(missing.res.statusCode, 400);
  assert.deepEqual(missing.res.body.errors, {
    id: ["Invalid input: expected string, received undefined"],
  });

  const blank = invoke(validation.validateEditLink, {
    body: { originalUrl: "https://example.com" },
    params: { id: "  " },
  });
  assert.equal(blank.res.statusCode, 400);
  assert.deepEqual(blank.res.body.errors, { id: ["id is required"] });
});

test("edit link reports body errors before checking params.id", () => {
  const { res } = invoke(validation.validateEditLink, {
    body: { originalUrl: "javascript:alert(1)" },
    params: {},
  });

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body.errors, {
    originalUrl: ["URL must start with http:// or https://"],
  });
  assert.equal(res.body.errors.id, undefined);
});

test("update status accepts only active and disabled, checking status before params", () => {
  const invalidStatus = invoke(validation.validateUpdateStatus, {
    body: { status: "paused" },
    params: {},
  });
  assert.equal(invalidStatus.res.statusCode, 400);
  assert.deepEqual(invalidStatus.res.body.errors, {
    status: ["status must be 'active' or 'disabled'"],
  });
  assert.equal(invalidStatus.res.body.errors.id, undefined);

  const missingId = invoke(validation.validateUpdateStatus, {
    body: { status: "active" },
    params: {},
  });
  assert.equal(missingId.res.statusCode, 400);
  assert.deepEqual(missingId.res.body.errors, {
    id: ["Invalid input: expected string, received undefined"],
  });

  for (const status of ["active", "disabled"]) {
    const valid = invoke(validation.validateUpdateStatus, {
      body: { status },
      params: { id: "9" },
    });
    assert.equal(valid.res.statusCode, null);
    assert.equal(valid.nextCalls, 1);
    assert.deepEqual(valid.req.body, { status });
  }
});

test("check alias writes the trimmed alias to validatedQuery without changing req.query", () => {
  const { req, res, nextCalls } = invoke(validation.validateCheckAlias, {
    query: { alias: "  My_Alias " },
  });

  assert.equal(res.statusCode, null);
  assert.equal(nextCalls, 1);
  assert.deepEqual(req.validatedQuery, { alias: "My_Alias" });
  // The contract is req.validatedQuery, not an in-place rewrite of req.query.
  assert.equal(req.query.alias, "  My_Alias ");
});

test("check alias enforces the length and character rules", () => {
  const tooLong = invoke(validation.validateCheckAlias, {
    query: { alias: "a".repeat(22) },
  });
  assert.equal(tooLong.res.statusCode, 400);
  assert.deepEqual(tooLong.res.body.errors, {
    alias: ["Alias must be 21 characters or fewer"],
  });

  const invalidChars = invoke(validation.validateCheckAlias, {
    query: { alias: "bad alias" },
  });
  assert.equal(invalidChars.res.statusCode, 400);
  assert.deepEqual(invalidChars.res.body.errors, {
    alias: [
      "Alias can only contain letters, numbers, dashes, and underscores",
    ],
  });

  const empty = invoke(validation.validateCheckAlias, { query: { alias: "" } });
  assert.equal(empty.res.statusCode, 400);
  assert.deepEqual(empty.res.body.errors, {
    alias: [
      "alias is required",
      "Alias can only contain letters, numbers, dashes, and underscores",
    ],
  });
});

test("convert guest requires both short_code and a 16 character fingerprint", () => {
  const missing = invoke(validation.validateConvertGuest, { body: {} });
  assert.equal(missing.res.statusCode, 400);
  assert.deepEqual(missing.res.body.errors, {
    short_code: ["short_code is required"],
    fingerprint: ["fingerprint is required"],
  });

  for (const fingerprint of ["0123456789abcde", "0123456789abcdefg"]) {
    const wrongLength = invoke(validation.validateConvertGuest, {
      body: { short_code: "abc", fingerprint },
    });
    assert.equal(wrongLength.res.statusCode, 400);
    assert.deepEqual(wrongLength.res.body.errors, {
      fingerprint: ["Invalid fingerprint format"],
    });
  }

  const valid = invoke(validation.validateConvertGuest, {
    body: { short_code: " abc ", fingerprint: "0123456789abcdef" },
  });
  assert.equal(valid.res.statusCode, null);
  assert.equal(valid.nextCalls, 1);
  assert.deepEqual(valid.req.body, {
    short_code: "abc",
    fingerprint: "0123456789abcdef",
  });

  const blankCode = invoke(validation.validateConvertGuest, {
    body: { short_code: "   ", fingerprint: "0123456789abcdef" },
  });
  assert.equal(blankCode.res.statusCode, 400);
  assert.deepEqual(blankCode.res.body.errors, {
    short_code: ["short_code is required"],
  });
});

// validateEditLink reads idParamSchema, which is declared later in the module.
// These tests exercise the handler after module evaluation, covering that
// temporal-dead-zone dependency; they would fail if the schema moved or the
// handler were invoked during initialization.
