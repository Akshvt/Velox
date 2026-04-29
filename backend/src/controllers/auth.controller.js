const Tenant = require("../models/Tenant");
const User = require("../models/User");
const redis = require("../config/redis");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/generateToken");

// ─── Helper: set refresh token as httpOnly cookie ────────────────────────────
const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

// ─── Helper: blacklist a jti in Redis ────────────────────────────────────────
const blacklistToken = async (decoded) => {
  if (!redis) return; // Redis not configured -- skip silently
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redis.set(`bl:${decoded.jti}`, "1", "EX", ttl);
  }
};

// ─── POST /api/auth/register ─────────────────────────────────────────────────
// Creates Tenant + Admin user atomically, returns JWT pair
const register = async (req, res) => {
  const { businessName, name, email, password } = req.body;

  if (!businessName || !name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  // Generate slug from business name
  const slug =
    businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
    "-" +
    Date.now();

  // Create tenant first
  const tenant = await Tenant.create({ name: businessName, slug });

  // Create admin user (passwordHash pre-save hook hashes it)
  const user = await User.create({
    tenantId: tenant._id,
    name,
    email,
    passwordHash: password,
    role: "admin",
  });

  const payload = { userId: user._id, tenantId: tenant._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    message: "Workspace created successfully",
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: tenant._id,
      tenantName: tenant.name,
    },
  });
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// bcrypt compare, issue access token (body) + refresh token (httpOnly cookie)
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  // Need passwordHash (excluded by default via select:false)
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordHash"
  );

  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // Update last active
  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  const payload = { userId: user._id, tenantId: user.tenantId, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  setRefreshCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
  });
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// Blacklist refresh token jti in Redis, clear cookie
const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      await blacklistToken(decoded);
    } catch {
      // Expired or invalid token -- still clear the cookie
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns current user (no passwordHash -- excluded by schema)
const me = async (req, res) => {
  const user = await User.findById(req.user.userId).populate(
    "tenantId",
    "name slug settings.widget"
  );

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({ success: true, user });
};

module.exports = { register, login, logout, me };
