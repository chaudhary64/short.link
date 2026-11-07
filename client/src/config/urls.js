const clean = (value = "") => value.trim().replace(/\/+$/, "");

/**
 * Base URL for API requests.
 *
 * Left empty in development so requests stay same-origin and the Vite dev
 * server proxies them to the real backend (see `server.proxy` in
 * vite.config.js). The deployed API only advertises CORS for its own app
 * origins, so calling it directly from a different localhost port is blocked.
 *
 * In a production build this must be the absolute API origin.
 */
export const API_BASE_URL = clean(import.meta.env.VITE_API_BASE_URL);

/** Public origin where short codes actually resolve. Independent of the API base. */
export const SHORTLINK_BASE_URL =
  clean(import.meta.env.VITE_SHORTLINK_BASE_URL) || API_BASE_URL;

/** Hostname shown in front of a code, e.g. `short.link` in `short.link/abc`. */
export const SHORTLINK_HOST = SHORTLINK_BASE_URL.replace(/^https?:\/\//, "");

/** Full shareable URL for a short code. */
export const shortLinkUrl = (code = "") =>
  `${SHORTLINK_BASE_URL}/${String(code).replace(/^\/+/, "")}`;
