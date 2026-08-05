import { verifyAccessToken } from "../utils/tokens.js";
import { getSessionById } from "../repositories/session.repository.js";

const authenticateMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }

  // Access tokens are bound to a session row via the `sid` claim. If the
  // row is gone, the session was revoked (or rotated away) — reject the
  // request immediately instead of letting the token live out its full
  // 15-minute lifetime.
  if (!decoded.sid) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No session bound to token" });
  }

  const session = await getSessionById(decoded.sid);

  if (!session || session.user_id !== decoded.id) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Session has been revoked" });
  }

  req.user = decoded;

  next();
};

export default authenticateMiddleware;
