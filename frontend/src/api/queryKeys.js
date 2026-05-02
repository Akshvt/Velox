/**
 * Centralized React Query keys.
 * Reuse these everywhere for cache hits + targeted invalidation.
 *
 *   queryClient.invalidateQueries({ queryKey: qk.tickets.all })
 */
export const qk = {
  auth: {
    me: ["auth", "me"],
  },
  tickets: {
    all: ["tickets"],
    list: (params) => ["tickets", "list", params || {}],
    detail: (id) => ["tickets", "detail", id],
    stats: ["tickets", "stats"],
  },
  chat: {
    history: (conversationId) => ["chat", "history", conversationId],
  },
  agents: {
    all: ["agents"],
    list: (params) => ["agents", "list", params || {}],
    detail: (id) => ["agents", "detail", id],
  },
  kb: {
    all: ["kb"],
    list: (params) => ["kb", "list", params || {}],
    detail: (id) => ["kb", "detail", id],
    categories: ["kb", "categories"],
    search: (q) => ["kb", "search", q],
  },
  faq: {
    all: ["faq"],
    list: (params) => ["faq", "list", params || {}],
    detail: (id) => ["faq", "detail", id],
  },
  analytics: {
    overview: (params) => ["analytics", "overview", params || {}],
    ticketsTrend: (params) => ["analytics", "ticketsTrend", params || {}],
    agentPerformance: (params) => ["analytics", "agentPerf", params || {}],
    csat: (params) => ["analytics", "csat", params || {}],
    channels: (params) => ["analytics", "channels", params || {}],
    aiDeflection: (params) => ["analytics", "aiDeflection", params || {}],
  },
  reports: {
    all: ["reports"],
    detail: (id) => ["reports", "detail", id],
  },
  settings: {
    workspace: ["settings", "workspace"],
    profile: ["settings", "profile"],
    notifications: ["settings", "notifications"],
    security: ["settings", "security"],
  },
  admin: {
    users: ["admin", "users"],
    faqs: ["admin", "faqs"],
    settings: ["admin", "settings"],
  },
  widget: {
    config: (apiKey) => ["widget", "config", apiKey],
  },
};
