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
