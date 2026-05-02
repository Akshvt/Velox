import { http } from "./_http";

/**
 * Backend treats "agents" as Users with role=agent|admin and exposes them under
 * the admin namespace: backend/src/routes/admin.routes.js (admin role required).
 *
 *   GET    /admin/users
 *   POST   /admin/users/invite       body: { name, email, password, role }
 *   PATCH  /admin/users/:id/role     body: { role }
 *   PATCH  /admin/users/:id/status   body: { isActive }
 *
 * There is no GET /admin/users/:id and no DELETE - disabling is done by setting
 * isActive: false. Online/offline presence is a SOCKET event (`agent:status`),
 * not a REST endpoint.
 */
export const agents = {
  list: (params) => http.get("/admin/users", { params }),

  /** No single-user GET - fetch list and filter. */
  get: async (id) => {
    const res = await http.get("/admin/users");
    const users = res?.users || res || [];
    return users.find?.((u) => u._id === id || u.id === id) || null;
  },

  invite: (body) => http.post("/admin/users/invite", body),

  /** Maps body.role -> /role, body.isActive -> /status. */
  update: async (id, body) => {
    const calls = [];
    if (body?.role !== undefined)
      calls.push(http.patch(`/admin/users/${id}/role`, { role: body.role }));
    if (body?.isActive !== undefined)
      calls.push(
        http.patch(`/admin/users/${id}/status`, { isActive: body.isActive }),
      );
    const results = await Promise.all(calls);
    return results[results.length - 1] || { success: true };
  },

  /** No DELETE - soft-disable via status endpoint. */
  remove: (id) => http.patch(`/admin/users/${id}/status`, { isActive: false }),

  /** Presence is a socket event - emit `agent:status` over the socket instead. */
  setStatus: (_id, _status) =>
    Promise.resolve({
      success: false,
      notImplemented: true,
      hint: "Emit `agent:status` over Socket.IO instead.",
    }),
};
