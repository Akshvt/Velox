import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * A User belongs to exactly one Tenant.
 * The compound index on (tenantId + email) means the same email address
 * can exist in two different workspaces - they're completely separate accounts.
 */
const userSchema = new mongoose.Schema(
  {
    tenantId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Tenant",
      required: true,
    },
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    email: {
      type:      String,
      required:  true,
      lowercase: true,
      trim:      true,
    },
    // Never returned in queries - select: false means you have to explicitly
    // ask for it with .select("+passwordHash")
    passwordHash: {
      type:     String,
      required: true,
      select:   false,
    },
    role: {
      type:    String,
      enum:    ["admin", "agent", "viewer"],
      default: "agent",
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    lastActive: {
      type:    Date,
      default: Date.now,
    },
    // Stored for future refresh token rotation - not used in auth v1
    refreshTokenHash: {
      type:   String,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, role:  1 });

// Hash the password before saving - only runs when passwordHash is modified
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

/**
 * Compares a plaintext password against the stored hash.
 * Call with .select("+passwordHash") on the query first.
 */
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.model("User", userSchema);
