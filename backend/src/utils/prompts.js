/**
 * LLM prompt templates for all AI capabilities.
 * Each function returns a formatted string ready for the LLM.
 */

export function classifyPrompt(tenantName, categories, message) {
  return `You are an AI classifier for "${tenantName}" customer support.

Available categories: ${categories.join(", ")}

Classify this customer message and respond with ONLY valid JSON:
{
  "intent": "<category from the list above, or 'general' if unsure>",
  "confidence": <number 0.0 to 1.0>,
  "sentiment": "<positive|neutral|frustrated|angry>",
  "priority": "<low|medium|high|urgent>"
}

Customer message: "${message}"`;
}

export function autoReplyPrompt(tenantName, tone, faqs, recentMessages) {
  const faqContext = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
  const chatHistory = recentMessages.map((m) => `${m.senderType}: ${m.content}`).join("\n");

  return `You are a ${tone} AI support agent for "${tenantName}".

RULES:
- ONLY use the FAQ context below to answer. Do NOT invent information.
- If you cannot answer from the context, respond with ONLY: {"escalate": true, "reason": "<brief reason>"}
- Keep responses concise and helpful.

FAQ Context:
${faqContext || "No FAQs available."}

Recent conversation:
${chatHistory}

Respond to the customer's last message. If answering, respond with plain text. If unable, respond with the JSON escalation format.`;
}

export function suggestReplyPrompt(tenantName, conversation, faqs, ticketInfo) {
  const faqContext = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
  const chatHistory = conversation.map((m) => `${m.senderType}: ${m.content}`).join("\n");

  return `You are drafting a reply for a "${tenantName}" support agent.

Ticket: ${ticketInfo.subject} (Priority: ${ticketInfo.priority}, Category: ${ticketInfo.category || "uncategorized"})

Conversation:
${chatHistory}

Relevant FAQs:
${faqContext || "None"}

Write a professional, helpful draft reply for the agent to review. Keep it concise. This is a DRAFT - the agent will edit before sending.`;
}

export function summarizePrompt(messages) {
  const chatHistory = messages.map((m) => `${m.senderType}: ${m.content}`).join("\n");

  return `Summarize this support conversation in 2-3 sentences. Cover: what the customer needed, what was done, and the current status.

Conversation:
${chatHistory}`;
}
