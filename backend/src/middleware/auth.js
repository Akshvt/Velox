import { verifyAccessToken } from "../utils/generateToken.js";
import redis from "../config/redis.js";

/**
 * Protects any route that requires a logged-in user.
 * Expects: Authorization: Bearer <accessToken>
 * Attaches req.user = { userId, tenantId, role } on success.
 */
export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ success: false, message: "No token provided" });

  // Throws JsonWebTokenError or TokenExpiredError - caught by global errorHandler
  const decoded = verifyAccessToken(token);

  // Check if this token was manually invalidated (e.g. after logout)
  if (redis) {
    const isBlacklisted = await redis.get(`bl:${decoded.jti}`);
    if (isBlacklisted)
      return res.status(401).json({ success: false, message: "Token revoked" });
  }

  req.user = {
    userId:   decoded.userId,
    tenantId: decoded.tenantId,
    role:     decoded.role,
  };

  next();
}
