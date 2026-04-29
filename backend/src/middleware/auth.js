const { verifyAccessToken } = require("../utils/generateToken");
const redis = require("../config/redis");

/**
 * requireAuth middleware
 * Expects: Authorization: Bearer <accessToken>
 * Attaches req.user = { userId, tenantId, role }
 */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  const decoded = verifyAccessToken(token); // throws on invalid/expired -- caught by errorHandler

  // Check Redis blacklist (if Redis is running)
  if (redis) {
    const isBlacklisted = await redis.get(`bl:${decoded.jti}`);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: "Token has been revoked" });
    }
  }

  req.user = {
    userId: decoded.userId,
    tenantId: decoded.tenantId,
    role: decoded.role,
  };

  next();
};

module.exports = { requireAuth };
