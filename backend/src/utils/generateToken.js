import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
} from "../config/env.js";

// Shared sign helper - every token gets a unique jti for Redis blacklisting
const sign = (payload, secret, expiresIn) =>
  jwt.sign({ ...payload, jti: uuid() }, secret, { expiresIn });

/**
 * Access token - short-lived (15m), sent in response body.
 * Client stores this in memory only, never localStorage.
 */
export const signAccessToken = (payload) =>
  sign(payload, JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRY);

/**
 * Refresh token - long-lived (7d), delivered as an httpOnly cookie.
 * Used to get a new access token without re-logging in.
 */
export const signRefreshToken = (payload) =>
  sign(payload, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRY);

// Both verify functions throw on invalid or expired tokens.
// Those errors bubble up and are caught by the global errorHandler.
export const verifyAccessToken  = (token) => jwt.verify(token, JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, JWT_REFRESH_SECRET);
