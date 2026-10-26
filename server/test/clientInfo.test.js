import assert from "node:assert/strict";
import test from "node:test";

import { getClientInfo } from "../utils/clientInfo.js";

const IPHONE_SAFARI_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const WINDOWS_CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function fakeRequest({ userAgent = "", remoteAddress = "::1", headers = {} } = {}) {
  return {
    headers: { "user-agent": userAgent, ...headers },
    socket: { remoteAddress },
  };
}

test("iPhone Safari is detected as mobile on iOS", () => {
  const info = getClientInfo(fakeRequest({ userAgent: IPHONE_SAFARI_UA }));

  assert.equal(info.device_type, "mobile");
  assert.equal(info.os, "iOS");
  assert.equal(info.browser, "Mobile Safari");
});

test("Windows Chrome is detected as desktop", () => {
  const info = getClientInfo(fakeRequest({ userAgent: WINDOWS_CHROME_UA }));

  assert.equal(info.device_type, "desktop");
  assert.equal(info.os, "Windows");
  assert.equal(info.browser, "Chrome");
});

test("loopback IP 127.0.0.1 yields no country", () => {
  const info = getClientInfo(
    fakeRequest({ userAgent: WINDOWS_CHROME_UA, remoteAddress: "127.0.0.1" }),
  );

  assert.equal(info.country, null);
  assert.equal(info.city, null);
});

test("visitor_hash is stable for the same IP and differs for another IP", () => {
  const first = getClientInfo(fakeRequest({ remoteAddress: "203.0.113.10" }));
  const second = getClientInfo(fakeRequest({ remoteAddress: "203.0.113.10" }));
  const other = getClientInfo(fakeRequest({ remoteAddress: "203.0.113.11" }));

  assert.equal(first.visitor_hash, second.visitor_hash);
  assert.notEqual(first.visitor_hash, other.visitor_hash);
});

test("empty user-agent falls back to desktop", () => {
  // Suspected defect: with no user-agent at all the helper still reports
  // device_type "desktop" instead of something unknown/null. The assertions
  // below pin the current behavior, not necessarily the desired behavior.
  const info = getClientInfo(fakeRequest({ userAgent: "" }));

  assert.equal(info.browser, null);
  assert.equal(info.os, null);
  assert.equal(info.device_type, "desktop");
  assert.equal(info.country, null);
});

test("client-supplied X-Forwarded-For decides the returned country", () => {
  const withoutForwardedFor = getClientInfo(
    fakeRequest({ userAgent: WINDOWS_CHROME_UA, remoteAddress: "::1" }),
  );
  const withForwardedFor = getClientInfo(
    fakeRequest({
      userAgent: WINDOWS_CHROME_UA,
      remoteAddress: "::1",
      headers: { "x-forwarded-for": "8.8.8.8" },
    }),
  );

  assert.equal(withoutForwardedFor.country, null);
  assert.equal(withForwardedFor.country, "US");
  assert.notEqual(
    withoutForwardedFor.visitor_hash,
    withForwardedFor.visitor_hash,
  );
});
