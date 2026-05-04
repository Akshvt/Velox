import { Router } from "express";
import { suggestReplyHandler, summarizeHandler } from "../controllers/ai.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import validate from "../middleware/validate.js";
import { suggestReplySchema } from "../middleware/schemas.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.use(asyncHandler(requireAuth), requireTenant);

router.post("/suggest-reply",       validate(suggestReplySchema), asyncHandler(suggestReplyHandler));
router.post("/summarize/:ticketId", asyncHandler(summarizeHandler));

export default router;
