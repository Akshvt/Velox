import { http } from "./_http";

/**
 * Backend: backend/src/routes/analytics.routes.js (admin role required)
 *
 *   GET /analytics/overview
 *   GET /analytics/trends
 *   GET /analytics/agents
 *   GET /analytics/categories
 */
export const analytics = {
  overview: (params) => http.get("/analytics/overview", { params }),
  ticketsTrend: (params) => http.get("/analytics/trends", { params }),
  agentPerformance: (params) => http.get("/analytics/agents", { params }),
  categories: (params) => http.get("/analytics/categories", { params }),
};
