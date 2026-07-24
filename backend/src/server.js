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

import Tenant from "./models/Tenant.js";
import User from "./models/User.js";
import Ticket from "./models/Ticket.js";
import crypto from "crypto";

// --- SEED DATABASE ENDPOINT ---
app.get("/api/seed", async (req, res) => {
  try {
    await Tenant.deleteMany({});
    await User.deleteMany({});
    await Ticket.deleteMany({});

    const tenant = await Tenant.create({
      name: "Acme Corp",
      slug: "acme-corp",
      apiKey: crypto.randomBytes(32).toString("hex"),
      plan: "pro",
      settings: {
        ai: { enabled: true, model: "gpt-4o-mini", tone: "professional", autoReply: true, confidenceThreshold: 0.8 },
        widget: { accentColor: "#3B82F6", greeting: "Hi there! How can we help you today?" },
      }
    });

    const adminUser = await User.create({
      tenantId: tenant._id,
      name: "Admin User",
      email: "admin@acme.com",
      passwordHash: "password123",
      role: "admin",
      isActive: true,
    });

    const agentUser = await User.create({
      tenantId: tenant._id,
      name: "Support Agent",
      email: "agent@acme.com",
      passwordHash: "password123",
      role: "agent",
      isActive: true,
    });

    const tickets = [
      {
        tenantId: tenant._id,
        customer: { name: "Alice Johnson", email: "alice@example.com" },
        subject: "Cannot access my dashboard",
        body: "Hi, I have been trying to log into my dashboard since this morning but I keep getting a 403 error.",
        status: "open",
        priority: "high",
        category: "technical",
        aiConfidence: 0.85,
        sentiment: "negative",
        assignedTo: agentUser._id,
        notes: [{ author: agentUser._id, content: "Looking into the logs for this user." }]
      },
      {
        tenantId: tenant._id,
        customer: { name: "Bob Smith", email: "bob@startup.io" },
        subject: "Billing question",
        body: "Hello, we are currently on the free tier and want to upgrade to Pro.",
        status: "open",
        priority: "medium",
        category: "billing",
        aiConfidence: 0.92,
        sentiment: "neutral",
        assignedTo: adminUser._id
      }
    ];
    await Ticket.insertMany(tickets);

    res.json({ success: true, message: "Database seeded! You can now log in with admin@acme.com / password123" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Must be registered last - catches any error thrown in route handlers
app.use(errorHandler);

await connectDB();
httpServer.listen(PORT, () => console.log(`Server on port ${PORT}`));

// --- Graceful shutdown (Docker sends SIGTERM on stop/restart) ---
async function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully...`);

  // 1. Stop accepting new connections and wait for in-flight requests to finish
  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn("HTTP server close timed out — forcing exit");
      resolve();
    }, 10000);
    httpServer.close(() => {
      clearTimeout(timeout);
      console.log("HTTP server closed");
      resolve();
    });
  });

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
