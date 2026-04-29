import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    tenantId:         { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    name:             { type: String, required: true, trim: true },
    email:            { type: String, required: true, lowercase: true, trim: true },
    passwordHash:     { type: String, required: true, select: false },
    role:             { type: String, enum: ["admin", "agent", "viewer"], default: "agent" },
    isActive:         { type: Boolean, default: true },
    lastActive:       { type: Date,    default: Date.now },
    refreshTokenHash: { type: String,  select: false },
  },
  { timestamps: true }
);

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, role: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.model("User", userSchema);
