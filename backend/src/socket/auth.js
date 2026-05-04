import { verifyAccessToken } from "../utils/generateToken.js";
import { validateApiKey } from "../utils/apiKey.js";
import redis from "../config/redis.js";

/**
 * Socket.IO auth middleware.
 * Agents connect with JWT, widget customers connect with API key.
 */
export async function socketAuth(socket, next) {
  try {
    const { token, apiKey, sessionToken } = socket.handshake.auth;

    // Agent connection - JWT auth
    if (token) {
      const decoded = verifyAccessToken(token);

      // Check Redis blacklist
      if (redis) {
        const bl = await redis.get(`bl:${decoded.jti}`);
        if (bl) return next(new Error("Token revoked"));
      }

      socket.user = {
        userId:   decoded.userId,
        tenantId: decoded.tenantId,
        role:     decoded.role,
        type:     "agent",
      };
      return next();
    }

    // Widget connection - API key auth
    if (apiKey) {
      const tenant = await validateApiKey(apiKey);
      if (!tenant) return next(new Error("Invalid API key"));

      socket.user = {
        tenantId:     tenant._id.toString(),
        sessionToken: sessionToken || `sess_${Date.now()}`,
        type:         "customer",
      };
      return next();
    }

    next(new Error("No auth credentials"));
  } catch (err) {
    next(new Error(`Auth failed: ${err.message}`));
  }
}
