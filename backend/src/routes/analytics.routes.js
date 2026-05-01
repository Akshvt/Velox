import { Router } from "express";
import { overview, trends, agents, categories } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { requireRole } from "../middleware/rbac.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

// All analytics routes: admin only
router.use(asyncHandler(requireAuth), requireTenant, requireRole("admin"));

router.get("/overview",   asyncHandler(overview));
router.get("/trends",     asyncHandler(trends));
router.get("/agents",     asyncHandler(agents));
router.get("/categories", asyncHandler(categories));

export default router;
