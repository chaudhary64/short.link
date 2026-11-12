import { hasScope } from "../utils/apiKey.js";

// Scope checks only apply to API keys. A browser session authenticated with a
// JWT is the account owner and keeps full access, which is what every existing
// client route already assumes.
export default function requireScope(scope) {
  return function scopeMiddleware(req, res, next) {
    if (!req.apiKey) return next();

    if (!hasScope(req.apiKey, scope)) {
      return res.status(403).json({
        message: `Forbidden: API key is missing the "${scope}" scope`,
      });
    }

    next();
  };
}
