import { verifyAccessToken } from "../utils/tokens.js";
import { getSessionById } from "../repositories/session.repository.js";
import {
  getApiKeyByHash,
  touchApiKey,
} from "../repositories/apiKey.repository.js";
import { evaluateApiKey, hashApiKey, isApiKeyToken } from "../utils/apiKey.js";

// Two credential types reach this middleware: short-lived JWT access tokens
// from the browser, and long-lived API keys from anything that is not a
// browser (agents, scripts). API keys are recognised by their prefix before
// any JWT verification is attempted, so an `sk_live_` string never has to
// survive jwt.verify. Dependencies are injectable so the rejection paths can
// be tested without PostgreSQL.
function createAuthenticateMiddleware({
  lookupSession = getSessionById,
  lookupApiKey = getApiKeyByHash,
  markApiKeyUsed = touchApiKey,
} = {}) {
  return async function authenticateMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (isApiKeyToken(token)) {
      const record = await lookupApiKey(hashApiKey(token));
      const evaluation = evaluateApiKey(record);

      if (!evaluation.ok) {
        return res.status(401).json({ message: evaluation.message });
      }

      req.user = { id: record.user_id };
      req.apiKey = { id: record.id, scopes: record.scopes };

      // Usage timestamps are diagnostic, not authorization: a failed update
      // must never turn a valid request into an error.
      markApiKeyUsed(record.id).catch(() => {});

      return next();
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token" });
    }

    if (!decoded.sid) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No session bound to token" });
    }

    const session = await lookupSession(decoded.sid);

    if (!session || session.user_id !== decoded.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Session has been revoked" });
    }

    req.user = decoded;

    next();
  };
}

const authenticateMiddleware = createAuthenticateMiddleware();

export { createAuthenticateMiddleware };
export default authenticateMiddleware;
