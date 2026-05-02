import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";

import connectDB from "./config/db.js";
import "./config/redis.js";
import security from "./middleware/security.js";
import errorHandler from "./middleware/errorHandler.js";
import { slidingWindowLimiter } from "./middleware/rateLimiter.js";
import { PORT } from "./config/env.js";
import { initSocket } from "./socket/index.js";

// Route imports
import authRoutes      from "./routes/auth.routes.js";
import ticketRoutes    from "./routes/ticket.routes.js";
import chatRoutes      from "./routes/chat.routes.js";
import aiRoutes        from "./routes/ai.routes.js";
import adminRoutes     from "./routes/admin.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import widgetRoutes    from "./routes/widget.routes.js";

const app = express();
const httpServer = createServer(app);

// Trust proxy for correct IP detection behind reverse proxy / load balancer
app.set("trust proxy", 1);

// Disable X-Powered-By header (defence in depth)
app.disable("x-powered-by");

// Initialise Socket.IO on the HTTP server
initSocket(httpServer);

// Security headers, CORS, HPP, mongo-sanitize, xss - applied in strict order
app.use(security);

// Global rate limiter: 100 requests per minute
app.use(slidingWindowLimiter(100));

// Body parsing + cookie parsing (placed after security so limits are in effect)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth",      authRoutes);
app.use("/api/tickets",   ticketRoutes);
app.use("/api/chat",      chatRoutes);
app.use("/api/ai",        aiRoutes);
app.use("/api/admin",     adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/widget",    widgetRoutes);

import mongoose from "mongoose";
import redis from "./config/redis.js";

// --- Health check (used by Docker healthcheck + monitoring) ---
app.get("/health", (_, res) => {
  const mongoState = ["disconnected", "connected", "connecting", "disconnecting"];
  const redisOk = redis?.status === "ready";

  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    mongo: mongoState[mongoose.connection.readyState] || "unknown",
    redis: redisOk ? "connected" : redis ? redis.status : "disabled",
  });
});

// Must be registered last - catches any error thrown in route handlers
app.use(errorHandler);

await connectDB();
httpServer.listen(PORT, () => console.log(`Server on port ${PORT}`));

// --- Graceful shutdown (Docker sends SIGTERM on stop/restart) ---
async function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully...`);

  // 1. Stop accepting new connections
  httpServer.close(() => console.log("HTTP server closed"));

  // 2. Close Socket.IO
  try {
    const { getIO } = await import("./socket/index.js");
    getIO().close();
    console.log("Socket.IO closed");
  } catch { /* not initialised */ }

  // 3. Close database connections
  try { await mongoose.connection.close(); console.log("MongoDB closed"); } catch {}
  try { if (redis) await redis.quit();      console.log("Redis closed");   } catch {}

  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
