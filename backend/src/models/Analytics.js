import mongoose from "mongoose";

/**
 * Daily aggregated analytics snapshot per tenant.
 * Written by a background job or upserted on ticket events.
 * The analytics service reads from this collection to build dashboard charts.
 * All queries must include tenantId.
 */
const analyticsSchema = new mongoose.Schema(
  {
    tenantId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Tenant",
      required: true,
    },
    // Normalised to midnight UTC for grouping by date
    date: {
      type:     Date,
      required: true,
    },
    tickets: {
      created:  { type: Number, default: 0 },
      resolved: { type: Number, default: 0 },
      closed:   { type: Number, default: 0 },
      // Tickets that were auto-resolved by the AI without agent intervention
      autoResolved: { type: Number, default: 0 },
    },
    // Average time from ticket creation to first agent reply (seconds)
    avgFirstReplyTime: {
      type: Number,
      default: 0,
    },
    // Average time from ticket creation to resolved/closed (seconds)
    avgResolutionTime: {
      type: Number,
      default: 0,
    },
    // Breakdown by category for the bar chart
    byCategory: [
      {
        category: String,
        count:    { type: Number, default: 0 },
      },
    ],
    // Per-agent stats for the agent performance table
    byAgent: [
      {
        agentId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        resolved: { type: Number, default: 0 },
        avgTime:  { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// Unique snapshot per tenant per day
analyticsSchema.index({ tenantId: 1, date: 1 }, { unique: true });

export default mongoose.model("Analytics", analyticsSchema);
