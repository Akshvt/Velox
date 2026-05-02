import { http } from "./_http";

/**
 * Backend: backend/src/routes/ticket.routes.js (auth + tenant required)
 *
 *   GET    /tickets?status&priority&category&assignedTo&page&limit
 *   POST   /tickets        body: { subject, body, customerName, customerEmail, priority?, category? }
 *   GET    /tickets/:id
 *   PATCH  /tickets/:id    body: { status?, priority?, assignedTo?, category? }
 *   POST   /tickets/:id/notes  body: { content }
 *   DELETE /tickets/:id    (admin only)
 *
 * Response shapes:
 *   list -> { success, tickets, pagination: { page, limit, total, pages } }
 *   one  -> { success, ticket }
 *
 * assign/resolve/reopen are convenience wrappers over PATCH /tickets/:id;
 * stats is sourced from /analytics/overview (no /tickets/stats route exists).
 */
export const tickets = {
  list: (params) => http.get("/tickets", { params }),
  get: (id) => http.get(`/tickets/${id}`),
  create: (body) => http.post("/tickets", body),
  update: (id, body) => http.patch(`/tickets/${id}`, body),
  remove: (id) => http.del(`/tickets/${id}`),

  // Convenience wrappers — all map to PATCH /tickets/:id
  assign: (id, agentId) =>
    http.patch(`/tickets/${id}`, { assignedTo: agentId || null }),
  resolve: (id) => http.patch(`/tickets/${id}`, { status: "resolved" }),
  reopen: (id) => http.patch(`/tickets/${id}`, { status: "open" }),

  // Internal notes
  addNote: (id, content) => http.post(`/tickets/${id}/notes`, { content }),

  // No /tickets/stats — read from analytics overview instead.
  stats: () => http.get("/analytics/overview"),
};
