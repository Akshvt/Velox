const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
} = require("../config/env");

/**
 * Sign an access token.
 * Payload: { userId, tenantId, role }
 * Short-lived (15m), stored in-memory on the client (never localStorage).
 */
const signAccessToken = (payload) => {
  return jwt.sign(
    { ...payload, jti: uuidv4(), type: "access" },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }
  );
};

/**
 * Sign a refresh token.
 * Payload: { userId, tenantId, role }
 * Long-lived (7d), delivered as httpOnly Secure cookie.
 */
const signRefreshToken = (payload) => {
  return jwt.sign(
    { ...payload, jti: uuidv4(), type: "refresh" },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }
  );
};

/**
 * Verify an access token. Throws on invalid/expired.
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_ACCESS_SECRET);
};

/**
 * Verify a refresh token. Throws on invalid/expired.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
