import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { cacheGet, cacheSet } from "./cache.service.js";
import mongoose from "mongoose";

/**
 * Analytics aggregation pipelines - all scoped to tenantId.
 * Results are cached in Redis for 5 minutes to avoid repeated aggregation hits.
 */

/** Overview stat cards: totals + averages + dynamic SLA/CSAT */
export async function getOverview(tenantId, from, to) {
  const cacheKey = `analytics:${tenantId}:overview:${from || "all"}:${to || "all"}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const dateFilter = buildDateFilter(from, to);
  const filter = { tenantId, ...dateFilter };

  const [total, open, resolved, closed] = await Promise.all([
    Ticket.countDocuments(filter),
    Ticket.countDocuments({ ...filter, status: "open" }),
    Ticket.countDocuments({ ...filter, status: "resolved" }),
    Ticket.countDocuments({ ...filter, status: "closed" }),
  ]);

  // Resolution metrics
  const resolvedTickets = await Ticket.find({ ...filter, status: "resolved", resolvedAt: { $ne: null } })
    .select("createdAt resolvedAt priority")
    .lean();

  let avgResolutionMs = 0;
  let slaMet = 0;
  let csatTotal = 0;

  if (resolvedTickets.length) {
    const totalMs = resolvedTickets.reduce((sum, t) => {
      const ms = new Date(t.resolvedAt) - new Date(t.createdAt);
      
      // Dynamic SLA logic (e.g., High priority < 4h, else < 24h)
      const slaLimit = t.priority === "high" ? 4 * 3600000 : 24 * 3600000;
      if (ms <= slaLimit) slaMet++;

      // Dynamic CSAT Logic (1-5 based on resolution speed)
      let score = 5;
      if (ms > slaLimit * 2) score = 2;
      else if (ms > slaLimit) score = 3;
      else if (ms > slaLimit / 2) score = 4;
      csatTotal += score;

      return sum + ms;
    }, 0);
    
    avgResolutionMs = totalMs / resolvedTickets.length;
  }

  // AI resolution rate
  const autoResolved = await Ticket.countDocuments({ ...filter, autoReplied: true, status: "resolved" });
  const aiResolutionRate = total ? ((autoResolved / total) * 100).toFixed(1) : 0;

  const result = {
    total, open, resolved, closed,
    avgResolutionMs: Math.round(avgResolutionMs),
    avgResolutionFormatted: formatMs(avgResolutionMs),
    aiResolutionRate: Number(aiResolutionRate),
    // Newly added metrics
    sla: {
      met: slaMet,
      breached: resolvedTickets.length - slaMet
    },
    csat: resolvedTickets.length ? (csatTotal / resolvedTickets.length).toFixed(1) : "N/A"
  };

  await cacheSet(cacheKey, result, 300);
  return result;
}

/** Ticket volume over time - grouped by day */
export async function getTrends(tenantId, from, to) {
  const cacheKey = `analytics:${tenantId}:trends:${from || "all"}:${to || "all"}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const dateFilter = buildDateFilter(from, to);

  const trends = await Ticket.aggregate([
    { $match: { tenantId: toObjectId(tenantId), ...dateFilter } },
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
    }},
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", count: 1, _id: 0 } },
  ]).allowDiskUse(true);

  await cacheSet(cacheKey, trends, 300);
  return trends;
}

/** Per-agent performance stats */
export async function getAgentStats(tenantId, from, to) {
  const cacheKey = `analytics:${tenantId}:agents:${from || "all"}:${to || "all"}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const dateFilter = buildDateFilter(from, to);

  const agents = await User.find({ tenantId, role: { $in: ["admin", "agent"] }, isActive: true })
    .select("name email")
    .lean();

  const stats = await Promise.all(agents.map(async (agent) => {
    const resolved = await Ticket.countDocuments({
      tenantId, assignedTo: agent._id, status: "resolved", ...dateFilter,
    });
    const total = await Ticket.countDocuments({
      tenantId, assignedTo: agent._id, ...dateFilter,
    });

    return { agentId: agent._id, name: agent.name, email: agent.email, resolved, total };
  }));

  const sorted = stats.sort((a, b) => b.resolved - a.resolved);
  await cacheSet(cacheKey, sorted, 300);
  return sorted;
}

/** Tickets grouped by category */
export async function getCategoryBreakdown(tenantId, from, to) {
  const cacheKey = `analytics:${tenantId}:categories:${from || "all"}:${to || "all"}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const dateFilter = buildDateFilter(from, to);

  const categories = await Ticket.aggregate([
    { $match: { tenantId: toObjectId(tenantId), ...dateFilter } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { category: { $ifNull: ["$_id", "uncategorized"] }, count: 1, _id: 0 } },
  ]).allowDiskUse(true);

  await cacheSet(cacheKey, categories, 300);
  return categories;
}

// --- Helpers ---

function toObjectId(id) {
  return typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
}

function buildDateFilter(from, to) {
  const filter = {};
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to)   filter.createdAt.$lte = new Date(to);
  }
  return filter;
}

function formatMs(ms) {
  if (!ms) return "0m";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}
