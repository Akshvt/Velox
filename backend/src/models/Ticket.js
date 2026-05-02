import mongoose from "mongoose";

/**
 * A Ticket represents a single customer support request.
 * Every query on this collection MUST include tenantId to prevent data leakage.
 */
const ticketSchema = new mongoose.Schema(
  {
    tenantId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Tenant",
      required: true,
    },
    // The customer who raised this ticket (not necessarily a User in the system)
    customer: {
      name:  { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
    },
    subject: {
      type:     String,
      required: true,
      trim:     true,
    },
    // Full text of the first message - shown as preview in inbox
    body: {
      type:     String,
      required: true,
    },
    status: {
      type:    String,
      enum:    ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type:    String,
      enum:    ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    // AI-classified intent category (billing, technical, general, etc.)
    category: {
      type: String,
      trim: true,
    },
    // AI confidence score for the category classification (0–1)
    aiConfidence: {
      type: Number,
      min:  0,
      max:  1,
    },
    // Sentiment detected by AI on the initial message
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
    },
    // The agent this ticket is assigned to - null means unassigned
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      default: null,
    },
    // Internal notes visible only to agents, never to the customer
    notes: [
      {
        author:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content:   { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Whether the AI has already attempted an auto-reply
    autoReplied: {
      type:    Boolean,
      default: false,
    },
    resolvedAt: { type: Date },
    closedAt:   { type: Date },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index for the inbox query: fetch all open tickets for a tenant quickly
ticketSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
ticketSchema.index({ tenantId: 1, assignedTo: 1 });
ticketSchema.index({ tenantId: 1, priority: 1 });
ticketSchema.index({ tenantId: 1, category: 1 });

export default mongoose.model("Ticket", ticketSchema);
