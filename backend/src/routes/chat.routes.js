import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import validate from "../middleware/validate.js";
import { sendMessageSchema } from "../middleware/schemas.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.use(asyncHandler(requireAuth), requireTenant);

router.post("/:ticketId/messages", validate(sendMessageSchema), asyncHandler(sendMessage));
router.get("/:ticketId/messages",  asyncHandler(getMessages));

export default router;
