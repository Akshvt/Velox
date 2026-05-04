/**
 * Reports module - Now implemented on the backend.
 * Backend: admin.routes.js → report.controller.js
 *
 *   GET    /admin/reports
 *   POST   /admin/reports
 *   DELETE /admin/reports/:id
 *
 * Re-exports from report.service.js for backward compatibility.
 * The reportService namespace is the primary import for hooks.
 */
import { http } from "./_http";

export const reports = {
  list: () => http.get("/admin/reports"),
  get: async (id) => {
    const res = await http.get("/admin/reports");
    const items = res?.reports || [];
    return items.find?.((r) => r._id === id || r.id === id) || null;
  },
  create: (body) => http.post("/admin/reports", body),
  remove: (id) => http.del(`/admin/reports/${id}`),
  export: async (id) => http.get(`/admin/reports/${id}/export`),
  schedule: async (id, frequency) => http.post(`/admin/reports/${id}/schedule`, { frequency }),
};
