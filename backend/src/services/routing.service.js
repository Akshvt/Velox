import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import Tenant from "../models/Tenant.js";
import redis from "../config/redis.js";

/**
 * Smart ticket routing - assigns ticket to the best available agent.
 *
 * Strategy:
 * 1. Check tenant routing rules for intent-to-agent mapping
 * 2. Filter by online agents (Redis set)
 * 3. Assign to agent with lowest current load
 * 4. Fallback: leave unassigned (returns null)
 *
 * @param {string} tenantId
 * @param {string} intent - AI-classified category
 */
export async function routeTicket(tenantId, intent) {
  // Step 1: Check if there's a routing rule for this category
  const tenant = await Tenant.findById(tenantId).select("settings.routing").lean();
  const rules = tenant?.settings?.routing || [];
  const rule = rules.find((r) => r.category === intent);

  if (rule?.assignTo) {
    const agent = await User.findOne({
      _id: rule.assignTo, tenantId, isActive: true,
      role: { $in: ["admin", "agent"] },
    }).lean();
    if (agent) return agent;
  }

  // Step 2: Get online agents from Redis
  let onlineAgentIds = [];
  if (redis) {
    try {
      onlineAgentIds = await redis.smembers(`tenant:${tenantId}:agents:online`);
    } catch { /* Redis down */ }
  }

  // Step 3: Get all active agents, prefer online ones
  const agents = await User.find({
    tenantId, isActive: true,
    role: { $in: ["admin", "agent"] },
  }).lean();
  if (!agents.length) return null;

  // Count open tickets per agent to find lowest load
  const agentLoads = await Promise.all(
    agents.map(async (agent) => {
      const count = await Ticket.countDocuments({
        tenantId,
        assignedTo: agent._id,
        status: { $in: ["open", "in_progress"] },
      });
      return {
        agent,
        load:     count,
        isOnline: onlineAgentIds.includes(agent._id.toString()),
      };
    })
  );

  // Prefer online agents, then sort by lowest load
  agentLoads.sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return a.load - b.load;
  });

  return agentLoads[0]?.agent || null;
}
