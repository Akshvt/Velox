import { Router } from "express";
import {
  listTickets, createTicket, getTicket,
  updateTicket, addNote, deleteTicket,
} from "../controllers/ticket.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { requireRole } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import { createTicketSchema, updateTicketSchema, addNoteSchema } from "../middleware/schemas.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.use(asyncHandler(requireAuth), requireTenant);

router.get("/",       asyncHandler(listTickets));
router.post("/",      validate(createTicketSchema), asyncHandler(createTicket));
router.get("/:id",    asyncHandler(getTicket));
router.patch("/:id",  validate(updateTicketSchema), asyncHandler(updateTicket));
router.post("/:id/notes", validate(addNoteSchema), asyncHandler(addNote));
router.delete("/:id", requireRole("admin"), asyncHandler(deleteTicket));

export default router;
