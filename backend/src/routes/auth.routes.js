import { Router } from "express";
import {
  register, login, refresh, logout,
  me, updateProfile, updatePassword,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { slidingWindowLimiter } from "../middleware/rateLimiter.js";
import validate from "../middleware/validate.js";
import { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema } from "../middleware/schemas.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

// Strict rate limiter for auth: 5 requests per minute per IP
router.use(slidingWindowLimiter(5));

// Public
router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login",    validate(loginSchema),    asyncHandler(login));
router.post("/refresh",  asyncHandler(refresh));

// Protected
router.post("/logout",   asyncHandler(requireAuth), asyncHandler(logout));
router.get("/me",        asyncHandler(requireAuth), asyncHandler(me));
router.put("/profile",   asyncHandler(requireAuth), validate(updateProfileSchema), asyncHandler(updateProfile));
router.put("/password",  asyncHandler(requireAuth), validate(updatePasswordSchema), asyncHandler(updatePassword));

export default router;
