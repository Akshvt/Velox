import { Router } from "express";
import {
  listUsers, inviteUser, updateUserRole, updateUserStatus,
  listFAQs, createFAQ, updateFAQ, deleteFAQ,
  getSettings, updateAISettings, updateWidgetSettings, updateRoutingSettings,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { requireRole } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import {
  inviteUserSchema, updateRoleSchema, updateStatusSchema,
  createFAQSchema, updateFAQSchema,
  aiSettingsSchema, widgetSettingsSchema, routingSettingsSchema,
} from "../middleware/schemas.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

// All admin routes require auth + tenant + admin role
router.use(asyncHandler(requireAuth), requireTenant, requireRole("admin"));

// Users
router.get("/users",              asyncHandler(listUsers));
router.post("/users/invite",      validate(inviteUserSchema), asyncHandler(inviteUser));
router.patch("/users/:id/role",   validate(updateRoleSchema), asyncHandler(updateUserRole));
router.patch("/users/:id/status", validate(updateStatusSchema), asyncHandler(updateUserStatus));

// FAQs
router.get("/faqs",         asyncHandler(listFAQs));
router.post("/faqs",        validate(createFAQSchema), asyncHandler(createFAQ));
router.put("/faqs/:id",     validate(updateFAQSchema), asyncHandler(updateFAQ));
router.delete("/faqs/:id",  asyncHandler(deleteFAQ));

// Settings
router.get("/settings",           asyncHandler(getSettings));
router.put("/settings/ai",        validate(aiSettingsSchema), asyncHandler(updateAISettings));
router.put("/settings/widget",    validate(widgetSettingsSchema), asyncHandler(updateWidgetSettings));
router.put("/settings/routing",   validate(routingSettingsSchema), asyncHandler(updateRoutingSettings));

export default router;
