import mongoose from "mongoose";

/**
 * A Message belongs to exactly one Ticket.
 * Chat history is stored here and broadcast via Socket.IO.
 * All queries must include tenantId (denormalised for fast scoped lookups).
 */
const messageSchema = new mongoose.Schema(
  {
    tenantId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Tenant",
      required: true,
    },
    ticketId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Ticket",
      required: true,
    },
    // "customer" for widget messages, "agent" for staff, "ai" for auto-replies/suggestions
    senderType: {
      type:     String,
      enum:     ["customer", "agent", "ai"],
      required: true,
    },
    // For agent messages this references the User doc; null for customer/ai
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      default: null,
    },
    content: {
      type:     String,
      required: true,
    },
    // Marks whether this AI message was the auto-reply or an agent-accepted suggestion
    isAutoReply: {
      type:    Boolean,
      default: false,
    },
    // Read receipt - set to true once the customer/agent reads the message
    read: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ascending sort by createdAt so chat history renders chronologically
messageSchema.index({ tenantId: 1, ticketId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
