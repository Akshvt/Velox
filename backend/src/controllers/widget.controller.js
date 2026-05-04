import Tenant from "../models/Tenant.js";
import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import { getIO } from "../socket/index.js";
import crypto from "crypto";
import { processIncomingCustomerMessage } from "../services/conversation.service.js";

/**
 * GET /api/widget/config/:apiKey
 * Public - returns widget display config for the embed script.
 */
export const getWidgetConfig = async (req, res) => {
  const tenant = await Tenant.findOne({ apiKey: req.params.apiKey });
  if (!tenant)
    return res.status(404).json({ success: false, message: "Invalid API key" });

  res.json({
    success: true,
    config: {
      tenantId:    tenant._id,
      name:        tenant.name,
      accentColor: tenant.settings?.widget?.accentColor || "#00E676",
      greeting:    tenant.settings?.widget?.greeting || "Hi! How can we help?",
      aiEnabled:   tenant.settings?.ai?.enabled ?? true,
    },
  });
};

/**
 * POST /api/widget/session
 * Creates or resumes a customer chat session.
 * Returns a sessionToken for the widget to use on Socket.IO connections.
 */
export const createSession = async (req, res) => {
  const { apiKey, customerName, customerEmail, sessionToken } = req.body;

  if (!apiKey)
    return res.status(400).json({ success: false, message: "apiKey is required" });

  const tenant = await Tenant.findOne({ apiKey });
  if (!tenant)
    return res.status(404).json({ success: false, message: "Invalid API key" });

  // Resume existing session or create new one
  const token = sessionToken || `sess_${crypto.randomBytes(16).toString("hex")}`;

  res.json({
    success: true,
    session: {
      sessionToken: token,
      tenantId:     tenant._id,
      greeting:     tenant.settings?.widget?.greeting || "Hi! How can we help?",
    },
  });
};

/**
 * POST /api/widget/ticket
 * Creates a real ticket from the embedded chat.
 */
export const createTicket = async (req, res) => {
  const { apiKey, content, customerName, customerEmail, subject, transcript } = req.body;

  if (!apiKey)
    return res.status(400).json({ success: false, message: "apiKey is required" });

  const tenant = await Tenant.findOne({ apiKey });
  if (!tenant)
    return res.status(404).json({ success: false, message: "Invalid API key" });

  const ticketSubject = subject || `Chat from ${customerName || 'Guest'} - ${new Date().toLocaleDateString()}`;
  const ticketBody = content || "Created ticket via widget.";

  const ticket = new Ticket({
    tenantId: tenant._id,
    subject: ticketSubject,
    customer: {
      name:  customerName || "Guest",
      email: customerEmail || "guest@example.com",
    },
    body: ticketBody,
    status: "open",
    priority: "medium",
    lastMessageAt: new Date()
  });

  await ticket.save();

  // Save the first message (the content of the user's issue)
  const initialMessage = new Message({
    ticketId: ticket._id,
    tenantId: tenant._id,
    senderType: "customer",
    content: ticketBody,
  });
  await initialMessage.save();

  const responseMessages = [initialMessage];

  try {
    const pipelineResult = await processIncomingCustomerMessage({
      tenantId: tenant._id,
      ticketId: ticket._id,
      body: ticketBody,
      ticket,
      category: ticket.category,
      priority: ticket.priority,
    });

    responseMessages.push(...pipelineResult.aiMessages);
    Object.assign(ticket, pipelineResult.updates);
  } catch (err) {
    console.warn("Widget AI pipeline error (non-fatal):", err.message);
  }

  if (transcript && transcript.length > 0) {
    const transcriptText = transcript.map(t => `[${t.sender}]: ${t.text}`).join('\n');
    const note = new Message({
      ticketId: ticket._id,
      tenantId: tenant._id,
      senderType: "ai",
      content: `Chat Transcript:\n${transcriptText}`,
    });
    await note.save();
  }

  // Broadcast new ticket to all tenant agents
  try {
    const io = getIO();
    io.to(`tenant:${tenant._id}`).emit("ticket:new", { ticket });
  } catch { /* Socket not initialised yet */ }

  res.status(201).json({ success: true, ticket, messages: responseMessages });
};
