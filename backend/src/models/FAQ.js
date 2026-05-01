import mongoose from "mongoose";

/**
 * FAQs are created by admins and fed to the AI as grounding context.
 * The AI uses these to generate accurate, on-brand auto-replies.
 * All queries must include tenantId.
 */
const faqSchema = new mongoose.Schema(
  {
    tenantId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Tenant",
      required: true,
    },
    question: {
      type:     String,
      required: true,
      trim:     true,
    },
    answer: {
      type:     String,
      required: true,
    },
    // Groups FAQs for filtered retrieval - only relevant category is sent to AI
    category: {
      type:    String,
      trim:    true,
      default: "general",
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

faqSchema.index({ tenantId: 1, category: 1 });
faqSchema.index({ tenantId: 1, isActive: 1 });

export default mongoose.model("FAQ", faqSchema);
