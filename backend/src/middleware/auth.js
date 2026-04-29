import { verifyAccessToken } from "../utils/generateToken.js";
import redis from "../config/redis.js";

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  const decoded = verifyAccessToken(token); // throws → caught by errorHandler

  if (redis && await redis.get(`bl:${decoded.jti}`))
    return res.status(401).json({ success: false, message: "Token revoked" });

  req.user = { userId: decoded.userId, tenantId: decoded.tenantId, role: decoded.role };
  next();
}
