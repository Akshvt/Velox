import { http } from "./_http";

/**
 * Public widget endpoints - backend/src/routes/widget.routes.js
 * Rate limited (30 req/min/IP). Uses tenant apiKey, NOT a user JWT.
 *
 *   GET  /widget/config/:apiKey            -> { tenant settings, branding }
 *   POST /widget/session                   body: { apiKey, customerName?, customerEmail? }
 *                                          -> { sessionToken, ticketId? }
 *
 * After session creation, the embed connects to Socket.IO using the returned
 * sessionToken via `auth: { token: sessionToken }`.
 */
export const widget = {
  getConfig: (apiKey) => http.get(`/widget/config/${apiKey}`),
  createSession: (body) => http.post("/widget/session", body),
  // Creates a real ticket from the embedded chat.
  // body: { apiKey, content, customerName?, customerEmail?, subject?, transcript? }
  createTicket: (body) => http.post("/widget/ticket", body),
};
