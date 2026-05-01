import FAQ from "../models/FAQ.js";
import Message from "../models/Message.js";
import Ticket from "../models/Ticket.js";
import { classifyPrompt, autoReplyPrompt, suggestReplyPrompt, summarizePrompt } from "../utils/prompts.js";

let ChatMistralAI = null;
let llm = null;

// Lazy-load LangChain + Mistral - falls back to stubs if not installed or no key
async function getLLM() {
  if (llm) return llm;

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.warn("MISTRAL_API_KEY not set - AI service running in stub mode");
    return null;
  }

  try {
    const mod = await import("@langchain/mistralai");
    ChatMistralAI = mod.ChatMistralAI;
    llm = new ChatMistralAI({
      model: "mistral-small-latest",
      apiKey,
      temperature: 0.3,
    });
    console.log("LangChain + Mistral AI initialised");
    return llm;
  } catch (err) {
    console.warn("LangChain/Mistral not available:", err.message);
    return null;
  }
}

/** Invoke the LLM with a prompt string. Returns the text response. */
async function invoke(prompt) {
  const model = await getLLM();
  if (!model) return null;

  const response = await model.invoke(prompt);
  return response.content;
}

/**
 * Classify a customer message - returns { intent, confidence, sentiment, priority }.
 */
export async function classifyMessage(tenantId, message) {
  const faqs = await FAQ.find({ tenantId, isActive: true }).distinct("category");
  const categories = faqs.length ? faqs : ["billing", "technical", "account", "general"];

  const prompt = classifyPrompt("Velox", categories, message);
  const raw = await invoke(prompt);

  if (!raw) {
    // Stub fallback
    return { intent: "general", confidence: 0.6, sentiment: "neutral", priority: "medium" };
  }

  try {
    // Extract JSON from response (handles markdown code blocks)
    const jsonStr = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    return { intent: "general", confidence: 0.5, sentiment: "neutral", priority: "medium" };
  }
}

/**
 * Auto-reply using FAQ context. Returns { reply } or { escalate: true }.
 */
export async function autoReply(tenantId, ticketId) {
  const messages = await Message.find({ tenantId, ticketId }).sort({ createdAt: -1 }).limit(5);
  const faqs = await FAQ.find({ tenantId, isActive: true });

  const prompt = autoReplyPrompt("Velox", "professional", faqs, messages.reverse());
  const raw = await invoke(prompt);

  if (!raw) {
    return { escalate: true, reason: "AI not configured" };
  }

  // Check if AI wants to escalate
  try {
    const parsed = JSON.parse(raw);
    if (parsed.escalate) return parsed;
  } catch { /* not JSON - it's a real reply */ }

  return { reply: raw };
}

/**
 * Suggest a reply draft for the agent.
 */
export async function suggestReply(tenantId, ticketId) {
  const ticket = await Ticket.findOne({ _id: ticketId, tenantId });
  if (!ticket) throw new Error("Ticket not found");

  const messages = await Message.find({ tenantId, ticketId }).sort({ createdAt: 1 });
  const faqs = await FAQ.find({ tenantId, isActive: true });

  const prompt = suggestReplyPrompt("Velox", messages, faqs, ticket);
  const raw = await invoke(prompt);

  if (!raw) {
    return { suggestion: "Thank you for reaching out. Let me look into this for you and get back shortly." };
  }

  return { suggestion: raw };
}

/**
 * Summarize a ticket's conversation in 2-3 sentences.
 */
export async function summarizeTicket(tenantId, ticketId) {
  const messages = await Message.find({ tenantId, ticketId }).sort({ createdAt: 1 });

  if (!messages.length) return { summary: "No messages in this ticket yet." };

  const prompt = summarizePrompt(messages);
  const raw = await invoke(prompt);

  if (!raw) {
    return { summary: `Ticket has ${messages.length} messages. Customer: ${messages[0]?.content?.slice(0, 100)}...` };
  }

  // Save summary to ticket
  await Ticket.findByIdAndUpdate(ticketId, { aiSummary: raw });

  return { summary: raw };
}
