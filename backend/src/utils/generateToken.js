import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY } from "../config/env.js";

const sign = (payload, secret, expiresIn) =>
  jwt.sign({ ...payload, jti: uuid() }, secret, { expiresIn });

export const signAccessToken  = (p) => sign(p, JWT_ACCESS_SECRET,  JWT_ACCESS_EXPIRY);
export const signRefreshToken = (p) => sign(p, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRY);
export const verifyAccessToken  = (t) => jwt.verify(t, JWT_ACCESS_SECRET);
export const verifyRefreshToken = (t) => jwt.verify(t, JWT_REFRESH_SECRET);
