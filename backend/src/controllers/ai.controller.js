import { suggestReply, summarizeTicket } from "../services/ai.service.js";

/**
 * POST /api/ai/suggest-reply
 * Agent clicks "AI Suggest" - returns a draft reply based on conversation + FAQs.
 */
export const suggestReplyHandler = async (req, res) => {
  const { ticketId } = req.body;

  if (!ticketId)
    return res.status(400).json({ success: false, message: "ticketId is required" });

  const result = await suggestReply(req.tenant, ticketId);
  res.json({ success: true, ...result });
};

/**
 * POST /api/ai/summarize/:ticketId
 * Agent clicks "AI Summarize" - returns 2-3 sentence summary.
 */
export const summarizeHandler = async (req, res) => {
  const result = await summarizeTicket(req.tenant, req.params.ticketId);
  res.json({ success: true, ...result });
};
