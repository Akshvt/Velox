import { http } from "./_http";

/**
 * Reports service - backend/src/routes/admin.routes.js
 *
 *   GET    /admin/reports
 *   POST   /admin/reports       body: { name, type, desc?, frequency? }
 *   DELETE /admin/reports/:id
 */
export const reportService = {
  list: () => http.get("/admin/reports"),
  create: (body) => http.post("/admin/reports", body),
  remove: (id) => http.del(`/admin/reports/${id}`),
};
