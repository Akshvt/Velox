import Message from "../models/Message.js";
import Ticket from "../models/Ticket.js";

/**
 * Per-socket rate limiting for chat events.
 * Tracks timestamps in a Map and blocks if > maxPerMin in 60s window.
 */
const socketRateLimits = new Map();
const MAX_MESSAGES_PER_MIN = 15;

function checkSocketRate(socketId) {
  const now = Date.now();
  const windowStart = now - 60000;

  if (!socketRateLimits.has(socketId)) socketRateLimits.set(socketId, []);
  const timestamps = socketRateLimits.get(socketId).filter((t) => t > windowStart);
  timestamps.push(now);
  socketRateLimits.set(socketId, timestamps);

  return timestamps.length > MAX_MESSAGES_PER_MIN;
}

/**
 * Chat socket handlers - join/leave ticket rooms, send messages, typing indicators.
 */
export function registerChatHandlers(io, socket) {
  // Join a ticket room to receive real-time messages
  socket.on("chat:join", ({ ticketId }) => {
    if (!ticketId) return;
    socket.join(`ticket:${ticketId}`);
  });

  // Leave a ticket room
  socket.on("chat:leave", ({ ticketId }) => {
    if (!ticketId) return;
    socket.leave(`ticket:${ticketId}`);
  });

  // Send a message - persist to DB then broadcast to room
  socket.on("chat:send", async ({ ticketId, content, senderType }) => {
    // Rate limit check
    if (checkSocketRate(socket.id)) {
      return socket.emit("error", { message: "Too many messages. Please slow down." });
    }

    // Input validation
    if (!ticketId || !content || typeof content !== "string" || content.length > 5000) {
      return socket.emit("error", { message: "Invalid message" });
    }

    try {
      const tenantId = socket.user.tenantId;

      const message = await Message.create({
        tenantId,
        ticketId,
        senderType: senderType || (socket.user.type === "agent" ? "agent" : "customer"),
        senderId:   socket.user.type === "agent" ? socket.user.userId : null,
        content:    content.trim(),
      });

      // Update ticket timestamps
      await Ticket.findByIdAndUpdate(ticketId, { lastMessageAt: new Date() });

      // Broadcast to everyone in the ticket room
      io.to(`ticket:${ticketId}`).emit("chat:message", { message });
    } catch (err) {
      socket.emit("error", { message: `Send failed: ${err.message}` });
    }
  });

  // Typing indicator - broadcast but never persist
  socket.on("chat:typing", ({ ticketId }) => {
    if (!ticketId) return;
    socket.to(`ticket:${ticketId}`).emit("chat:typing", {
      ticketId,
      user: socket.user.userId || "customer",
    });
  });

  // Clean up rate limit tracking on disconnect
  socket.on("disconnect", () => {
    socketRateLimits.delete(socket.id);
  });
}
