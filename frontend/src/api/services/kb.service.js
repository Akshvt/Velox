import { http } from "./_http";

/**
 * KB Articles service - backend/src/routes/admin.routes.js
 *
 *   GET    /admin/kb
 *   GET    /admin/kb/:id
 *   POST   /admin/kb          body: { title, content, category?, status?, tags? }
 *   PUT    /admin/kb/:id      body: { title?, content?, category?, status?, tags?, usedCount? }
 *   DELETE /admin/kb/:id
 */
export const kb = {
  list: (params) => http.get("/admin/kb", { params }),
  get: (id) => http.get(`/admin/kb/${id}`),
  create: (body) => http.post("/admin/kb", body),
  update: (id, body) => http.put(`/admin/kb/${id}`, body),
  remove: (id) => http.del(`/admin/kb/${id}`),
};
