import { Router } from "express";
import { getWidgetConfig, createSession, createTicket } from "../controllers/widget.controller.js";
import validate from "../middleware/validate.js";
import { widgetSessionSchema, widgetTicketSchema } from "../middleware/schemas.js";
import { slidingWindowLimiter } from "../middleware/rateLimiter.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

// Public routes - rate limited to prevent abuse
router.use(slidingWindowLimiter(30));

router.get("/config/:apiKey", asyncHandler(getWidgetConfig));
router.post("/session",       validate(widgetSessionSchema), asyncHandler(createSession));
router.post("/ticket",        validate(widgetTicketSchema), asyncHandler(createTicket));

export default router;
