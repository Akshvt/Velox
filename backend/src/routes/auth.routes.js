import { Router } from "express";
import { register, login, logout, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Public routes — no token needed
router.post("/register", register);
router.post("/login",    login);

// Protected routes — requireAuth verifies the Bearer token first
router.post("/logout", requireAuth, logout);
router.get("/me",      requireAuth, me);

export default router;
