import crypto from "node:crypto";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";

const SALT = process.env.VISITOR_HASH_SALT || "short-link-visitor-salt";

/**
 * Best-effort client info for a redirect request. Never throws — every
 * field degrades to null so analytics recording can never break a redirect.
 */
export function getClientInfo(req) {
  try {
    const uaHeader = req.headers["user-agent"] || "";
    const ua = new UAParser(uaHeader);
    const browser = ua.getBrowser();
    const os = ua.getOS();
    const device = ua.getDevice();

    let deviceType = "desktop";
    if (device.type === "tablet") deviceType = "tablet";
    else if (device.type === "mobile" || device.type === "wearable") deviceType = "mobile";
    else if (device.type === "smarttv") deviceType = "smarttv";
    else if (device.type === "console") deviceType = "console";
    else if (device.type === "embedded") deviceType = "embedded";

    const ip = getClientIp(req);

    const geo = ip && ip !== "127.0.0.1" && ip !== "::1" ? geoip.lookup(ip) : null;

    return {
      browser: browser.name || null,
      os: os.name || null,
      device_type: deviceType,
      country: geo?.country || null,
      city: geo?.city || null,
      visitor_hash: hashIp(ip),
    };
  } catch (error) {
    console.error("[clientInfo] Failed to parse client info:", error);
    return {
      browser: null,
      os: null,
      device_type: null,
      country: null,
      city: null,
      visitor_hash: null,
    };
  }
}

/**
 * Device + location info captured when a login session is created.
 * Best-effort — every field degrades to null so session creation can
 * never fail because of client-info parsing.
 */
export function getSessionClientInfo(req) {
  const uaHeader = String(req.headers["user-agent"] || "unknown").slice(0, 255);

  try {
    const ua = new UAParser(uaHeader);
    const browser = ua.getBrowser();
    const os = ua.getOS();
    const device = ua.getDevice();

    let deviceType = "desktop";
    if (device.type === "tablet") deviceType = "tablet";
    else if (device.type === "mobile" || device.type === "wearable") deviceType = "mobile";

    const ip = getClientIp(req);
    const geo = ip && ip !== "127.0.0.1" && ip !== "::1" ? geoip.lookup(ip) : null;

    return {
      user_agent: uaHeader,
      browser: browser.name || null,
      os: os.name || null,
      device_type: deviceType,
      country: geo?.country || null,
      city: geo?.city || null,
    };
  } catch (error) {
    console.error("[clientInfo] Failed to parse session client info:", error);
    return {
      user_agent: uaHeader,
      browser: null,
      os: null,
      device_type: null,
      country: null,
      city: null,
    };
  }
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = String(forwarded).split(",")[0].trim();
    if (first) return first;
  }
  return req.socket?.remoteAddress || null;
}

function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash("sha256").update(`${SALT}:${ip}`).digest("hex");
}
