import { http } from "./_http";

/**
 * Backend:
 *   chat.routes.js:
 *     GET    /chat/:ticketId/messages
 *     POST   /chat/:ticketId/messages   body: { content, senderType? }
 *   ai.routes.js:
 *     POST   /ai/suggest-reply          body: { ticketId }
 *     POST   /ai/summarize/:ticketId
 *   widget.routes.js (public, rate-limited):
 *     GET    /widget/config/:apiKey
 *     POST   /widget/session            body: { apiKey, customerName?, customerEmail? }
 *
 * Realtime sends are preferred over POST: emit `chat:send` over the socket.
 * The HTTP send remains here for non-socket clients and as a fallback.
 *
 * `conversationId` here == `ticketId` on the backend.
 */
export const chat = {
  history: (ticketId) => http.get(`/chat/${ticketId}/messages`),
  /** body: { content, senderType? }  senderType defaults to "agent" on backend */
  send: (ticketId, body) => http.post(`/chat/${ticketId}/messages`, body),

  // Widget session lifecycle (public — apiKey-based)
  startSession: (body) => http.post("/widget/session", body),
  /** No backend endpoint yet — placeholder so callers don't crash. */
  endSession: (_sessionId) =>
    Promise.resolve({ success: true, notImplemented: true }),
  /** Manual escalation isn't a REST endpoint; backend escalates via routing. */
  escalate: (_sessionId, _body) =>
    Promise.resolve({ success: true, notImplemented: true }),

  // AI helpers (mounted under /ai/*)
  aiSuggest: ({ ticketId }) => http.post("/ai/suggest-reply", { ticketId }),
  aiSummarize: (ticketId) => http.post(`/ai/summarize/${ticketId}`),
};
