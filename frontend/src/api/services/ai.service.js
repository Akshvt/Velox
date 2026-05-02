import { http } from "./_http";

/**
 * AI endpoints — backend/src/routes/ai.routes.js (auth + tenant required).
 *
 *   POST /ai/suggest-reply        body: { ticketId }   -> { suggestion }
 *   POST /ai/summarize/:ticketId                       -> { summary }
 *
 * Powered server-side by LangChain + Mistral. Falls back to canned responses
 * when MISTRAL_API_KEY is not configured (see backend/src/services/ai.service.js).
 */
export const ai = {
  suggestReply: (ticketId) => http.post("/ai/suggest-reply", { ticketId }),
  summarize: (ticketId) => http.post(`/ai/summarize/${ticketId}`),
};
