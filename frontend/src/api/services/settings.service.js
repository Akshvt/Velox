import { http } from "./_http";

/**
 * Frontend exposes 4 settings tabs (workspace/profile/notifications/security)
 * but the backend splits them across two routers:
 *
 *   admin.routes.js  (admin role required)
 *     GET  /admin/settings
 *     PUT  /admin/settings/ai          body: { enabled?, model?, tone?, autoReply?, confidenceThreshold? }
 *     PUT  /admin/settings/widget      body: { accentColor?, greeting? }
 *     PUT  /admin/settings/routing     body: { rules: [{ category, assignTo }] }
 *
 *   auth.routes.js   (current user)
 *     GET  /auth/me
 *     PUT  /auth/profile               body: { name?, email? }
 *     PUT  /auth/password              body: { currentPassword, newPassword }
 *
 * No /notifications endpoint on backend - placeholder kept for UI continuity.
 */
export const settings = {
  // Workspace = tenant-wide settings (AI + widget + routing rules)
  workspace: () => http.get("/admin/settings"),
  updateWorkspace: async (body = {}) => {
    const out = {};
    if (body.ai) out.ai = await http.put("/admin/settings/ai", body.ai);
    if (body.widget)
      out.widget = await http.put("/admin/settings/widget", body.widget);
    if (body.routing)
      out.routing = await http.put("/admin/settings/routing", body.routing);
    return { success: true, ...out };
  },

  // Profile = current user (sourced from /auth/*)
  profile: () => http.get("/auth/me"),
  updateProfile: (body) => http.put("/auth/profile", body),

  // Notifications: not implemented on backend
  notifications: async () => ({
    email: { newTicket: true, mentions: true, dailyDigest: false },
    inApp: { newTicket: true, mentions: true },
    notImplemented: true,
  }),
  updateNotifications: async (_body) => ({
    success: true,
    notImplemented: true,
  }),

  // Security = password change
  security: () => http.get("/auth/me"),
  updateSecurity: (body) => http.put("/auth/password", body),
};
