import api from "./api";

export const authService = {
  login:    (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getMe:    ()     => api.get("/auth/me"),
  logout:   ()     => api.post("/auth/logout"),
  refresh:  ()     => api.post("/auth/refresh"),
};

export const ticketService = {
  list:     (params) => api.get("/tickets", { params }),
  create:   (data)   => api.post("/tickets", data),
  get:      (id)     => api.get(`/tickets/${id}`),
  update:   (id, data) => api.patch(`/tickets/${id}`, data),
  addNote:  (id, content) => api.post(`/tickets/${id}/notes`, { content }),
  remove:   (id)     => api.delete(`/tickets/${id}`),
};

export const chatService = {
  getMessages: (ticketId, params) => api.get(`/chat/${ticketId}/messages`, { params }),
  sendMessage: (ticketId, data)   => api.post(`/chat/${ticketId}/messages`, data),
};

export const aiService = {
  suggestReply: (ticketId) => api.post("/ai/suggest-reply", { ticketId }),
  summarize:    (ticketId) => api.post(`/ai/summarize/${ticketId}`),
};

export const adminService = {
  listUsers:       ()           => api.get("/admin/users"),
  inviteUser:      (data)       => api.post("/admin/users/invite", data),
  updateUserRole:  (id, role)   => api.patch(`/admin/users/${id}/role`, { role }),
  updateUserStatus:(id, active) => api.patch(`/admin/users/${id}/status`, { isActive: active }),
  listFAQs:        (params)     => api.get("/admin/faqs", { params }),
  createFAQ:       (data)       => api.post("/admin/faqs", data),
  updateFAQ:       (id, data)   => api.put(`/admin/faqs/${id}`, data),
  deleteFAQ:       (id)         => api.delete(`/admin/faqs/${id}`),
  getSettings:     ()           => api.get("/admin/settings"),
  updateAI:        (data)       => api.put("/admin/settings/ai", data),
  updateWidget:    (data)       => api.put("/admin/settings/widget", data),
  updateRouting:   (data)       => api.put("/admin/settings/routing", data),
};

export const analyticsService = {
  overview:   (params) => api.get("/analytics/overview", { params }),
  trends:     (params) => api.get("/analytics/trends", { params }),
  agents:     (params) => api.get("/analytics/agents", { params }),
  categories: (params) => api.get("/analytics/categories", { params }),
};

export const widgetService = {
  getConfig:     (apiKey) => api.get(`/widget/config/${apiKey}`),
  createSession: (data)   => api.post("/widget/session", data),
};
