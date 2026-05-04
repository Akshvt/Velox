import Message from "../models/Message.js";
import Ticket from "../models/Ticket.js";
import { classifyMessage, autoReply } from "./ai.service.js";
import { routeTicket } from "./routing.service.js";

/**
 * Runs the shared AI pipeline for an incoming customer message.
 * Returns the applied ticket updates plus any AI messages that were created.
 */
export async function processIncomingCustomerMessage({
  tenantId,
  ticketId,
  body,
  ticket,
  category,
  priority,
}) {
  const classification = await classifyMessage(tenantId, body);
  const updates = {
    category: classification.intent || category,
    priority: classification.priority || priority || "medium",
    aiConfidence: classification.confidence || 0,
    sentiment: classification.sentiment || "neutral",
  };

  const aiMessages = [];

  if (classification.confidence >= 0.7) {
    const aiResult = await autoReply(tenantId, ticketId);
    if (aiResult.reply && !aiResult.escalate) {
      const aiMessage = await Message.create({
        tenantId,
        ticketId,
        senderType: "ai",
        content: aiResult.reply,
        isAutoReply: true,
      });
      aiMessages.push(aiMessage);
      updates.autoReplied = true;
    }
  }

  if (!updates.autoReplied) {
    const agent = await routeTicket(tenantId, classification.intent);
    if (agent) updates.assignedTo = agent._id;
    updates.status = "open";
  }

  await Ticket.findByIdAndUpdate(ticketId, { $set: updates });
  if (ticket) Object.assign(ticket, updates);

  return { classification, updates, aiMessages };
}
