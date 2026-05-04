import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import { getIO } from "../socket/index.js";
import { classifyMessage, autoReply } from "../services/ai.service.js";
import { routeTicket } from "../services/routing.service.js";

/**
 * GET /api/tickets
 * Paginated list with filters. Always scoped to req.tenant.
 */
export const listTickets = async (req, res) => {
  const { status, assignedTo, priority, category, page = 1, limit = 20 } = req.query;

  const filter = { tenantId: req.tenant };
  if (status)     filter.status     = status;
  if (priority)   filter.priority   = priority;
  if (category)   filter.category   = category;
  if (assignedTo) filter.assignedTo = assignedTo === "unassigned" ? null : assignedTo;

  const skip  = (page - 1) * limit;
  const total = await Ticket.countDocuments(filter);
  const tickets = await Ticket.find(filter)
    .populate("assignedTo", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    tickets,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
};

/**
 * POST /api/tickets
 * Creates ticket + first message, then runs AI classify -> autoReply/route pipeline.
 */
export const createTicket = async (req, res) => {
  const { subject, body, customerName, customerEmail, priority, category } = req.body;

  const ticket = await Ticket.create({
    tenantId: req.tenant,
    customer: { name: customerName, email: customerEmail },
    subject,
    body,
    priority: priority || "medium",
    category: category || undefined,
  });

  // Persist the first message
  await Message.create({
    tenantId:   req.tenant,
    ticketId:   ticket._id,
    senderType: "customer",
    content:    body,
  });

  // --- AI Pipeline (non-blocking - don't fail the request if AI errors) ---
  try {
    // Step 1: Classify the message
    const classification = await classifyMessage(req.tenant, body);
    const updates = {
      category:     classification.intent || category,
      priority:     classification.priority || priority || "medium",
      aiConfidence: classification.confidence || 0,
      sentiment:    classification.sentiment || "neutral",
    };

    // Step 2: If confidence is high, try auto-reply
    if (classification.confidence >= 0.7) {
      const aiResult = await autoReply(req.tenant, ticket._id);
      if (aiResult.reply && !aiResult.escalate) {
        await Message.create({
          tenantId:   req.tenant,
          ticketId:   ticket._id,
          senderType: "ai",
          content:    aiResult.reply,
        });
        updates.autoReplied = true;
      }
    }

    // Step 3: Route to an agent if not auto-resolved
    if (!updates.autoReplied) {
      const agent = await routeTicket(req.tenant, classification.intent);
      if (agent) updates.assignedTo = agent._id;
      updates.status = "open";
    }

    await Ticket.findByIdAndUpdate(ticket._id, { $set: updates });
    Object.assign(ticket, updates);
  } catch (err) {
    console.warn("AI pipeline error (non-fatal):", err.message);
  }

  // Broadcast new ticket to all tenant agents
  try {
    const io = getIO();
    io.to(`tenant:${req.tenant}`).emit("ticket:new", { ticket });
  } catch { /* Socket not initialised yet */ }

  res.status(201).json({ success: true, ticket });
};

/**
 * GET /api/tickets/:id
 */
export const getTicket = async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, tenantId: req.tenant })
    .populate("assignedTo", "name email role")
    .populate("notes.author", "name email")
    .lean();

  if (!ticket)
    return res.status(404).json({ success: false, message: "Ticket not found" });

  res.json({ success: true, ticket });
};

/**
 * PATCH /api/tickets/:id
 */
export const updateTicket = async (req, res) => {
  const { status, priority, assignedTo, category } = req.body;
  const updates = {};

  if (status)     updates.status     = status;
  if (priority)   updates.priority   = priority;
  if (category)   updates.category   = category;
  if (assignedTo !== undefined) updates.assignedTo = assignedTo || null;

  if (status === "resolved") updates.resolvedAt = new Date();
  if (status === "closed")   updates.closedAt   = new Date();

  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenant },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("assignedTo", "name email role").lean();

  if (!ticket)
    return res.status(404).json({ success: false, message: "Ticket not found" });

  try {
    const io = getIO();
    io.to(`tenant:${req.tenant}`).emit("ticket:updated", { ticket });
    if (assignedTo) io.to(`tenant:${req.tenant}`).emit("ticket:assigned", { ticket, agentId: assignedTo });
  } catch { /* ignore */ }

  res.json({ success: true, ticket });
};

/**
 * POST /api/tickets/:id/notes
 */
export const addNote = async (req, res) => {
  const { content } = req.body;

  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenant },
    { $push: { notes: { author: req.user.userId, content } } },
    { new: true }
  ).populate("notes.author", "name email");

  if (!ticket)
    return res.status(404).json({ success: false, message: "Ticket not found" });

  res.json({ success: true, notes: ticket.notes });
};

/**
 * DELETE /api/tickets/:id
 */
export const deleteTicket = async (req, res) => {
  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenant },
    { $set: { status: "closed", closedAt: new Date() } },
    { new: true }
  );

  if (!ticket)
    return res.status(404).json({ success: false, message: "Ticket not found" });

  res.json({ success: true, message: "Ticket closed" });
};
