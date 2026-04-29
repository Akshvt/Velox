import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import redis from "../config/redis.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/generateToken.js";
import { NODE_ENV } from "../config/env.js";

// Refresh token cookie settings — httpOnly so JS can't read it
const COOKIE_OPTS = {
  httpOnly: true,
  secure:   NODE_ENV === "production",
  sameSite: "strict",
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// Signs both tokens in one call — keeps register and login DRY
const tokenPair = (payload) => ({
  accessToken:  signAccessToken(payload),
  refreshToken: signRefreshToken(payload),
});

// Adds a token's jti to Redis so it can't be used again after logout.
// Skips silently if Redis isn't configured.
const blacklist = async (token) => {
  if (!redis) return;
  try {
    const decoded = verifyRefreshToken(token);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) await redis.set(`bl:${decoded.jti}`, "1", "EX", ttl);
  } catch {
    // Token already expired — nothing to blacklist
  }
};

/**
 * POST /api/auth/register
 * Creates a new business workspace (Tenant) and the first admin account.
 * Returns an access token in the body and a refresh token as an httpOnly cookie.
 */
export const register = async (req, res) => {
  const { businessName, name, email, password } = req.body;

  if (!businessName || !name || !email || !password)
    return res.status(400).json({ success: false, message: "All fields are required" });

  if (password.length < 8)
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });

  // Slug is derived from the business name — timestamp suffix keeps it unique
  const slug   = `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
  const tenant = await Tenant.create({ name: businessName, slug });

  // passwordHash field runs through bcrypt in the User pre-save hook
  const user = await User.create({
    tenantId:     tenant._id,
    name,
    email,
    passwordHash: password,
    role:         "admin",
  });

  const { accessToken, refreshToken } = tokenPair({
    userId:   user._id,
    tenantId: tenant._id,
    role:     user.role,
  });

  res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
  res.status(201).json({
    success: true,
    accessToken,
    user: {
      id:       user._id,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      tenantId: tenant._id,
    },
  });
};

/**
 * POST /api/auth/login
 * Validates credentials and issues a fresh token pair.
 * Returns 401 for both "user not found" and "wrong password" — intentionally
 * vague so you can't enumerate valid emails.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password are required" });

  // passwordHash is excluded by default — must explicitly select it
  const user  = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  const valid = user?.isActive && await user.comparePassword(password);

  if (!valid)
    return res.status(401).json({ success: false, message: "Invalid credentials" });

  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = tokenPair({
    userId:   user._id,
    tenantId: user.tenantId,
    role:     user.role,
  });

  res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
  res.json({
    success: true,
    accessToken,
    user: {
      id:       user._id,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      tenantId: user.tenantId,
    },
  });
};

/**
 * POST /api/auth/logout
 * Blacklists the refresh token in Redis so it can't be used to get new tokens,
 * then clears the cookie from the browser.
 */
export const logout = async (req, res) => {
  await blacklist(req.cookies?.refreshToken);
  res.clearCookie("refreshToken", COOKIE_OPTS);
  res.json({ success: true, message: "Logged out" });
};

/**
 * GET /api/auth/me
 * Returns the current user with their tenant's name, slug and widget settings.
 * passwordHash is excluded automatically by the schema (select: false).
 */
export const me = async (req, res) => {
  const user = await User.findById(req.user.userId)
    .populate("tenantId", "name slug settings.widget");

  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  res.json({ success: true, user });
};
