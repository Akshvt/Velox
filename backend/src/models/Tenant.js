import mongoose from "mongoose";

/**
 * One Tenant = one business workspace.
 * All other collections (Users, Tickets, FAQs etc.) are scoped to a tenantId,
 * so data from different businesses never mixes.
 */
const tenantSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    // URL-safe identifier, auto-generated from business name on register
    slug: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    // Used by the embeddable widget to authenticate without a user account
    apiKey: {
      type:   String,
      unique: true,
      sparse: true,
    },
    plan: {
      type:    String,
      enum:    ["free", "pro", "enterprise"],
      default: "free",
    },

    settings: {
      // AI behaviour config - admins can tune this from the dashboard
      ai: {
        enabled: {
          type:    Boolean,
          default: true,
        },
        model: {
          type:    String,
          default: "gpt-4o-mini",
        },
        tone: {
          type:    String,
          enum:    ["professional", "friendly", "concise"],
          default: "professional",
        },
        autoReply: {
          type:    Boolean,
          default: true,
        },
        // AI only auto-replies when its confidence is above this threshold
        confidenceThreshold: {
          type:    Number,
          default: 0.7,
          min:     0,
          max:     1,
        },
      },

      // Controls how the chat widget looks on the customer's site
      widget: {
        accentColor: {
          type:    String,
          default: "#00E676",
        },
        greeting: {
          type:    String,
          default: "Hi! How can we help?",
        },
      },

      // Maps ticket categories to specific agents for automatic assignment
      routing: [
        {
          category: String,
          assignTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref:  "User",
          },
        },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tenant", tenantSchema);
