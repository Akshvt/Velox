import { http } from "./_http";

/**
 * Admin namespace — single entry point for everything under /api/admin/*.
 * All endpoints require auth + tenant + role: "admin".
 *
 * Backend: backend/src/routes/admin.routes.js
 *
 *   Users:
 *     GET    /admin/users
 *     POST   /admin/users/invite       body: { name, email, password, role }
 *     PATCH  /admin/users/:id/role     body: { role: "admin"|"agent"|"viewer" }
 *     PATCH  /admin/users/:id/status   body: { isActive: boolean }
 *
 *   FAQs:
 *     GET    /admin/faqs
 *     POST   /admin/faqs        body: { question, answer, category? }
 *     PUT    /admin/faqs/:id    body: { question?, answer?, category?, isActive? }
 *     DELETE /admin/faqs/:id
 *
 *   Settings:
 *     GET    /admin/settings
 *     PUT    /admin/settings/ai        body: { enabled?, model?, tone?, autoReply?, confidenceThreshold? }
 *     PUT    /admin/settings/widget    body: { accentColor?, greeting? }
 *     PUT    /admin/settings/routing   body: { rules: [{ category, assignTo }] }
 */
export const admin = {
  users: {
    list: () => http.get("/admin/users"),
    invite: (body) => http.post("/admin/users/invite", body),
    setRole: (id, role) => http.patch(`/admin/users/${id}/role`, { role }),
    setStatus: (id, isActive) =>
      http.patch(`/admin/users/${id}/status`, { isActive }),
  },
  faqs: {
    list: (params) => http.get("/admin/faqs", { params }),
    create: (body) => http.post("/admin/faqs", body),
    update: (id, body) => http.put(`/admin/faqs/${id}`, body),
    remove: (id) => http.del(`/admin/faqs/${id}`),
  },
  settings: {
    get: () => http.get("/admin/settings"),
    updateAI: (body) => http.put("/admin/settings/ai", body),
    updateWidget: (body) => http.put("/admin/settings/widget", body),
    updateRouting: (rules) => http.put("/admin/settings/routing", { rules }),
  },
};
