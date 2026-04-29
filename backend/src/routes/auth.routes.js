import { Router } from "express";
import { register, login, logout, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

// Public routes — no token needed
router.post("/register", asyncHandler(register));
router.post("/login",    asyncHandler(login));

// Protected routes — requireAuth verifies the Bearer token first
router.post("/logout", asyncHandler(requireAuth), asyncHandler(logout));
router.get("/me",      asyncHandler(requireAuth), asyncHandler(me));

export default router;
