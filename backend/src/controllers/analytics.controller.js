import * as analytics from "../services/analytics.service.js";

/** GET /api/analytics/overview - stat card totals */
export const overview = async (req, res) => {
  const { from, to } = req.query;
  const data = await analytics.getOverview(req.tenant, from, to);
  res.json({ success: true, ...data });
};

/** GET /api/analytics/trends - ticket volume over time */
export const trends = async (req, res) => {
  const { from, to } = req.query;
  const data = await analytics.getTrends(req.tenant, from, to);
  res.json({ success: true, trends: data });
};

/** GET /api/analytics/agents - per-agent performance */
export const agents = async (req, res) => {
  const { from, to } = req.query;
  const data = await analytics.getAgentStats(req.tenant, from, to);
  res.json({ success: true, agents: data });
};

/** GET /api/analytics/categories - tickets by category */
export const categories = async (req, res) => {
  const { from, to } = req.query;
  const data = await analytics.getCategoryBreakdown(req.tenant, from, to);
  res.json({ success: true, categories: data });
};
