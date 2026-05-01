import { Server } from "socket.io";
import { CLIENT_URL } from "../config/env.js";
import redis from "../config/redis.js";
import { socketAuth } from "./auth.js";
import { registerChatHandlers } from "./chatHandler.js";
import { registerNotificationHandlers } from "./notificationHandler.js";

let io = null;

/**
 * Initialise Socket.IO on the given HTTP server.
 * Tuned for production scalability.
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: CLIENT_URL, credentials: true },
    transports: ["websocket", "polling"],
    // Production tuning
    maxHttpBufferSize:  1e6,       // 1MB max message size
    pingTimeout:        20000,     // 20s before disconnect
    pingInterval:       25000,     // ping every 25s
    connectTimeout:     10000,     // 10s connection timeout
    allowEIO3:          false,     // Only EIO4
  });

  // Attach Redis adapter if available (for horizontal scaling)
  if (redis) {
    import("@socket.io/redis-adapter")
      .then(({ createAdapter }) => {
        const pubClient = redis.duplicate();
        const subClient = redis.duplicate();
        io.adapter(createAdapter(pubClient, subClient));
        console.log("Socket.IO Redis adapter attached");
      })
      .catch(() => console.warn("Socket.IO Redis adapter not installed - single instance mode"));
  }

  // Auth middleware - verifies JWT or API key before connection
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.user?.userId || "widget"})`);

    // Join the tenant room so broadcasts reach all agents in the same workspace
    if (socket.user?.tenantId) {
      socket.join(`tenant:${socket.user.tenantId}`);

      // Track online agents in Redis
      if (redis && socket.user.type === "agent") {
        redis.sadd(`tenant:${socket.user.tenantId}:agents:online`, socket.user.userId).catch(() => {});
      }
    }

    registerChatHandlers(io, socket);
    registerNotificationHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Remove from online agents set
      if (redis && socket.user?.tenantId && socket.user.type === "agent") {
        redis.srem(`tenant:${socket.user.tenantId}:agents:online`, socket.user.userId).catch(() => {});
      }
    });
  });

  return io;
}

/** Returns the Socket.IO instance. Throws if not initialised. */
export function getIO() {
  if (!io) throw new Error("Socket.IO not initialised - call initSocket first");
  return io;
}
