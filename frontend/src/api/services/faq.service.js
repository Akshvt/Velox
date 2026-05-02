import { http } from "./_http";

/**
 * Backend: backend/src/routes/admin.routes.js (admin role required)
 *
 *   GET    /admin/faqs
 *   POST   /admin/faqs        body: { question, answer, category? }
 *   PUT    /admin/faqs/:id    body: { question?, answer?, category?, isActive? }
 *   DELETE /admin/faqs/:id
 *
 * Note: backend uses PUT (not PATCH) for FAQ updates and has no single-item GET.
 */
export const faq = {
  list: (params) => http.get("/admin/faqs", { params }),
  get: async (id) => {
    const res = await http.get("/admin/faqs");
    const items = res?.faqs || res || [];
    return items.find?.((f) => f._id === id || f.id === id) || null;
  },
  create: (body) => http.post("/admin/faqs", body),
  update: (id, body) => http.put(`/admin/faqs/${id}`, body),
  remove: (id) => http.del(`/admin/faqs/${id}`),
};
