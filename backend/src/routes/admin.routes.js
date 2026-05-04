import { Router } from "express";
import {
  listUsers, inviteUser, updateUserRole, updateUserStatus,
  listFAQs, createFAQ, updateFAQ, deleteFAQ,
  getSettings, updateAISettings, updateWidgetSettings, updateRoutingSettings,
} from "../controllers/admin.controller.js";
import {
  listKbArticles, getKbArticle, createKbArticle, updateKbArticle, deleteKbArticle
} from "../controllers/kb.controller.js";
import {
  listReports, createReport, deleteReport, exportReport, scheduleReport
} from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { requireRole } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import {
  inviteUserSchema, updateRoleSchema, updateStatusSchema,
  createFAQSchema, updateFAQSchema,
  createKBSchema, updateKBSchema, createReportSchema,
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

// KB Articles
router.get("/kb",           asyncHandler(listKbArticles));
router.get("/kb/:id",       asyncHandler(getKbArticle));
router.post("/kb",          validate(createKBSchema), asyncHandler(createKbArticle));
router.put("/kb/:id",       validate(updateKBSchema), asyncHandler(updateKbArticle));
router.delete("/kb/:id",    asyncHandler(deleteKbArticle));

// Reports
router.get("/reports",      asyncHandler(listReports));
router.post("/reports",     validate(createReportSchema), asyncHandler(createReport));
router.delete("/reports/:id", asyncHandler(deleteReport));
router.get("/reports/:id/export", asyncHandler(exportReport));
router.post("/reports/:id/schedule", asyncHandler(scheduleReport));

// Settings
router.get("/settings",           asyncHandler(getSettings));
router.put("/settings/ai",        validate(aiSettingsSchema), asyncHandler(updateAISettings));
router.put("/settings/widget",    validate(widgetSettingsSchema), asyncHandler(updateWidgetSettings));
router.put("/settings/routing",   validate(routingSettingsSchema), asyncHandler(updateRoutingSettings));

export default router;
