import mongoose from "mongoose";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import redis from "../config/redis.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/generateToken.js";
import { NODE_ENV } from "../config/env.js";

// Refresh token cookie settings - httpOnly so JS can't read it
const COOKIE_OPTS = {
  httpOnly: true,
  secure:   NODE_ENV === "production",
  sameSite: "strict",
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// Signs both tokens in one call - keeps register and login DRY
const tokenPair = (payload) => ({
  accessToken:  signAccessToken(payload),
  refreshToken: signRefreshToken(payload),
});

// Adds a token's jti to Redis so it can't be used again after logout.
// Skips silently if Redis isn't configured.
const blacklist = async (token) => {
  if (!redis || !token) return;
  try {
    const decoded = verifyRefreshToken(token);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) await redis.set(`bl:${decoded.jti}`, "1", "EX", ttl);
  } catch {
    // Token already expired - nothing to blacklist
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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Slug is derived from the business name - timestamp suffix keeps it unique
    const slug = `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const [tenant] = await Tenant.create([{ name: businessName, slug }], { session });

    // passwordHash field runs through bcrypt in the User pre-save hook
    const [user] = await User.create([{
      tenantId:     tenant._id,
      name,
      email,
      passwordHash: password,
      role:         "admin",
    }], { session });

    await session.commitTransaction();
    session.endSession();

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
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * POST /api/auth/login
 * Validates credentials and issues a fresh token pair.
 * Returns 401 for both "user not found" and "wrong password" - intentionally
 * vague so you can't enumerate valid emails.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password are required" });

  // passwordHash is excluded by default - must explicitly select it
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");

  if (!user || !user.isActive)
    return res.status(401).json({ success: false, message: "Invalid credentials" });

  const passwordMatch = await user.comparePassword(password);

  if (!passwordMatch)
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
 * POST /api/auth/refresh
 * Validates the httpOnly refresh token cookie, blacklists its jti in Redis,
 * then issues a brand-new token pair (rotation).
 */
export const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token)
    return res.status(401).json({ success: false, message: "No refresh token" });

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }

  // Check blacklist before issuing new tokens
  if (redis) {
    const isBlacklisted = await redis.get(`bl:${decoded.jti}`);
    if (isBlacklisted)
      return res.status(401).json({ success: false, message: "Token revoked" });
  }

  // Blacklist the old token (rotation - old jti is invalid from now on)
  await blacklist(token);

  const payload = { userId: decoded.userId, tenantId: decoded.tenantId, role: decoded.role };
  const { accessToken, refreshToken } = tokenPair(payload);

  res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
  res.json({ success: true, accessToken });
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

/**
 * PUT /api/auth/profile
 * Updates the current user's name and/or email.
 * Email uniqueness within the tenant is enforced by the DB unique index.
 */
export const updateProfile = async (req, res) => {
  const { name, email } = req.body;

  if (!name && !email)
    return res.status(400).json({ success: false, message: "Provide name or email to update" });

  const updates = {};
  if (name)  updates.name  = name.trim();
  if (email) updates.email = email.toLowerCase().trim();

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

/**
 * PUT /api/auth/password
 * Validates the current password then hashes and saves the new one.
 * The pre-save hook on User handles the bcrypt hashing.
 */
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ success: false, message: "currentPassword and newPassword are required" });

  if (newPassword.length < 8)
    return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });

  const user = await User.findById(req.user.userId).select("+passwordHash");

  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  const valid = await user.comparePassword(currentPassword);
  if (!valid)
    return res.status(401).json({ success: false, message: "Current password is incorrect" });

  // Setting passwordHash triggers the pre-save bcrypt hook
  user.passwordHash = newPassword;
  await user.save();

  res.json({ success: true, message: "Password updated" });
};
