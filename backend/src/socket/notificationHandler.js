import redis from "../config/redis.js";

/**
 * Notification socket handlers - ticket events and agent online status.
 */
export function registerNotificationHandlers(io, socket) {
  // Agent sets their online/away status - stored in Redis set
  socket.on("agent:status", async ({ status }) => {
    if (socket.user.type !== "agent") return;

    const key = `tenant:${socket.user.tenantId}:agents:online`;
    try {
      if (!redis) return;
      if (status === "online") {
        await redis.sadd(key, socket.user.userId);
      } else {
        await redis.srem(key, socket.user.userId);
      }
    } catch { /* Redis down - non-critical */ }
  });

  // Remove agent from online set on disconnect
  socket.on("disconnect", async () => {
    if (socket.user?.type !== "agent" || !redis) return;
    try {
      await redis.srem(`tenant:${socket.user.tenantId}:agents:online`, socket.user.userId);
    } catch { /* ignore */ }
  });
}

/**
 * Helper: emit a notification to all agents in a tenant room.
 * Called from controllers when tickets are created/updated.
 */
export function notifyTenant(io, tenantId, event, data) {
  io.to(`tenant:${tenantId}`).emit(event, data);
}
