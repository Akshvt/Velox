import Message from "../models/Message.js";
import Ticket from "../models/Ticket.js";
import { getIO } from "../socket/index.js";

/**
 * POST /api/chat/:ticketId/messages
 * Persist a message and broadcast it via Socket.IO to the ticket room.
 */
export const sendMessage = async (req, res) => {
  const { ticketId } = req.params;
  const { content, senderType = "agent" } = req.body;

  if (!content)
    return res.status(400).json({ success: false, message: "Message content is required" });

  // Verify ticket exists and belongs to this tenant
  const ticket = await Ticket.findOne({ _id: ticketId, tenantId: req.tenant });
  if (!ticket)
    return res.status(404).json({ success: false, message: "Ticket not found" });

  const message = await Message.create({
    tenantId:   req.tenant,
    ticketId,
    senderType,
    senderId:   senderType === "agent" ? req.user.userId : null,
    content,
  });

  // Update ticket's last activity
  ticket.lastMessageAt = new Date();
  if (ticket.status === "open" && senderType === "agent") ticket.status = "in_progress";
  await ticket.save();

  // Broadcast to everyone in the ticket room
  try {
    const io = getIO();
    io.to(`ticket:${ticketId}`).emit("chat:message", { message });
  } catch { /* Socket not ready */ }

  res.status(201).json({ success: true, message });
};

/**
 * GET /api/chat/:ticketId/messages
 * Paginated history sorted ascending (oldest first).
 */
export const getMessages = async (req, res) => {
  const { ticketId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Verify ticket belongs to tenant
  const ticket = await Ticket.findOne({ _id: ticketId, tenantId: req.tenant });
  if (!ticket)
    return res.status(404).json({ success: false, message: "Ticket not found" });

  const skip  = (page - 1) * limit;
  const total = await Message.countDocuments({ tenantId: req.tenant, ticketId });
  const messages = await Message.find({ tenantId: req.tenant, ticketId })
    .populate("senderId", "name email")
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    messages,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
};
