import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    slug:   { type: String, required: true, unique: true, lowercase: true, trim: true },
    apiKey: { type: String, unique: true },
    plan:   { type: String, enum: ["free", "pro", "enterprise"], default: "free" },

    settings: {
      ai: {
        enabled:             { type: Boolean, default: true },
        model:               { type: String,  default: "gpt-4o-mini" },
        tone:                { type: String,  enum: ["professional", "friendly", "concise"], default: "professional" },
        autoReply:           { type: Boolean, default: true },
        confidenceThreshold: { type: Number,  default: 0.7, min: 0, max: 1 },
      },
      widget: {
        accentColor: { type: String, default: "#00E676" },
        greeting:    { type: String, default: "Hi! How can we help?" },
      },
      routing: [{ category: String, assignTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }],
    },
  },
  { timestamps: true }
);

tenantSchema.index({ slug: 1 });
tenantSchema.index({ apiKey: 1 });

export default mongoose.model("Tenant", tenantSchema);
