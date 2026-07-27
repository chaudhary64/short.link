import { verifyAccessToken } from "../utils/tokens.js";

const authenticateMiddleware = (req, res, next) => {
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

  req.user = decoded;

  next();
};

export default authenticateMiddleware;
