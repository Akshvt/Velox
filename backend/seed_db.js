import { MONGODB_URI } from "./src/config/env.js";
import mongoose from "mongoose";
import Tenant from "./src/models/Tenant.js";
import User from "./src/models/User.js";
import Ticket from "./src/models/Ticket.js";
import crypto from "crypto";

async function run() {
  try {
    console.log(`Connecting to database at ${MONGODB_URI.substring(0, 20)}...`);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    console.log("Clearing existing data for a clean slate...");
    await Tenant.deleteMany({});
    await User.deleteMany({});
    await Ticket.deleteMany({});

    console.log("Creating realistic Tenant...");
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

    console.log("Creating Admin User...");
    const adminUser = await User.create({
      tenantId: tenant._id,
      name: "Admin User",
      email: "admin@acme.com",
      passwordHash: "password123", // Pre-save hook will hash this securely
      role: "admin",
      isActive: true,
    });

    console.log("Creating Agent User...");
    const agentUser = await User.create({
      tenantId: tenant._id,
      name: "Support Agent",
      email: "agent@acme.com",
      passwordHash: "password123",
      role: "agent",
      isActive: true,
    });

    console.log("Creating realistic Tickets...");
    const tickets = [
      {
        tenantId: tenant._id,
        customer: { name: "Alice Johnson", email: "alice@example.com" },
        subject: "Cannot access my dashboard",
        body: "Hi, I have been trying to log into my dashboard since this morning but I keep getting a 403 error. Can you help?",
        status: "open",
        priority: "high",
        category: "technical",
        aiConfidence: 0.85,
        sentiment: "negative",
        assignedTo: agentUser._id,
        notes: [{ author: agentUser._id, content: "Looking into the logs for this user. Seems like a permissions issue." }]
      },
      {
        tenantId: tenant._id,
        customer: { name: "Bob Smith", email: "bob@startup.io" },
        subject: "Billing question - upgrade to pro",
        body: "Hello, we are currently on the free tier and want to upgrade to Pro. Do you offer yearly discounts?",
        status: "open",
        priority: "medium",
        category: "billing",
        aiConfidence: 0.92,
        sentiment: "neutral",
        assignedTo: adminUser._id
      },
      {
        tenantId: tenant._id,
        customer: { name: "Charlie Davis", email: "charlie@company.net" },
        subject: "How do I invite team members?",
        body: "Just created an account. Where is the option to invite my colleagues? I looked in the settings but couldn't find it.",
        status: "resolved",
        priority: "low",
        category: "general",
        aiConfidence: 0.78,
        sentiment: "positive",
        resolvedAt: new Date(),
        assignedTo: agentUser._id
      },
      {
        tenantId: tenant._id,
        customer: { name: "Diana Prince", email: "diana@amazon.com" },
        subject: "Bug in the analytics report",
        body: "The export to CSV button on the analytics page is downloading an empty file. Please fix this ASAP.",
        status: "in_progress",
        priority: "high",
        category: "technical",
        aiConfidence: 0.88,
        sentiment: "negative",
        assignedTo: agentUser._id
      }
    ];

    await Ticket.insertMany(tickets);
    
    console.log("\n✅ Database seeded successfully!");
    console.log("-----------------------------------------");
    console.log(`Company Workspace: Acme Corp`);
    console.log(`Admin Login: admin@acme.com`);
    console.log(`Agent Login: agent@acme.com`);
    console.log(`Password for both: password123`);
    console.log("-----------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

run();
