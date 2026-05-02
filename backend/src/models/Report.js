import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Performance", "Satisfaction", "Knowledge Base", "Customer", "SLA", "Export"],
    },
    desc: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: String, // Storing the name of the creator directly for simplicity as per UI
      required: true,
    },
    frequency: {
      type: String,
      enum: ["One-time", "Daily", "Weekly", "Monthly"],
      default: "One-time",
    },
    status: {
      type: String,
      enum: ["Success", "Failed", "Running", "Scheduled"],
      default: "Success",
    },
    lastRun: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ tenantId: 1, type: 1 });
reportSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model("Report", reportSchema);
