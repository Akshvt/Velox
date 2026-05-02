import { z } from "zod";

// Reusable primitives
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");
const email = z.string().email().max(254).transform((v) => v.toLowerCase().trim());
const password = z.string().min(8).max(128);
const shortStr = z.string().trim().min(1).max(500);
const longStr = z.string().trim().min(1).max(5000);

// --- Auth ---
export const registerSchema = z.object({
  businessName: shortStr,
  name: shortStr,
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: shortStr.optional(),
  email: email.optional(),
}).refine((d) => d.name || d.email, { message: "Provide name or email" });

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});

// --- Tickets ---
export const createTicketSchema = z.object({
  subject: shortStr,
  body: longStr,
  customerName: shortStr,
  customerEmail: email,
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  category: shortStr.optional(),
});

export const updateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedTo: z.union([objectId, z.literal(""), z.null()]).optional(),
  category: shortStr.optional(),
}).refine((d) => Object.values(d).some((v) => v !== undefined), { message: "Provide at least one field" });

export const addNoteSchema = z.object({
  content: longStr,
});

// --- Chat ---
export const sendMessageSchema = z.object({
  content: longStr,
  senderType: z.enum(["customer", "agent", "ai"]).optional().default("agent"),
});

// --- AI ---
export const suggestReplySchema = z.object({
  ticketId: objectId,
});

// --- Admin Users ---
export const inviteUserSchema = z.object({
  name: shortStr,
  email,
  password,
  role: z.enum(["agent", "viewer"]).default("agent"),
});

export const updateRoleSchema = z.object({
  role: z.enum(["admin", "agent", "viewer"]),
});

export const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

// --- Admin FAQs ---
export const createFAQSchema = z.object({
  question: longStr,
  answer: longStr,
  category: shortStr.optional(),
});

export const updateFAQSchema = z.object({
  question: longStr.optional(),
  answer: longStr.optional(),
  category: shortStr.optional(),
  isActive: z.boolean().optional(),
}).refine((d) => Object.values(d).some((v) => v !== undefined), { message: "Provide at least one field" });

// --- Admin KB Articles ---
export const createKBSchema = z.object({
  title: shortStr,
  content: longStr,
  category: shortStr.optional(),
  status: z.enum(["Draft", "Published", "Archived"]).optional(),
  tags: z.array(shortStr).optional(),
});

export const updateKBSchema = z.object({
  title: shortStr.optional(),
  content: longStr.optional(),
  category: shortStr.optional(),
  status: z.enum(["Draft", "Published", "Archived"]).optional(),
  tags: z.array(shortStr).optional(),
  usedCount: z.number().int().min(0).optional(),
}).refine((d) => Object.values(d).some((v) => v !== undefined), { message: "Provide at least one field" });

// --- Admin Reports ---
export const createReportSchema = z.object({
  name: shortStr,
  type: z.enum(["Performance", "Satisfaction", "Knowledge Base", "Customer", "SLA", "Export"]),
  desc: shortStr.optional(),
  frequency: z.enum(["One-time", "Daily", "Weekly", "Monthly"]).optional(),
});

// --- Admin Settings ---
export const aiSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  model: z.string().max(50).optional(),
  tone: z.enum(["professional", "friendly", "concise"]).optional(),
  autoReply: z.boolean().optional(),
  confidenceThreshold: z.number().min(0).max(1).optional(),
});

export const widgetSettingsSchema = z.object({
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional(),
  greeting: shortStr.optional(),
});

export const routingSettingsSchema = z.object({
  rules: z.array(z.object({
    category: shortStr,
    assignTo: objectId,
  })),
});

// --- Widget ---
export const widgetSessionSchema = z.object({
  apiKey: z.string().min(1),
  customerName: shortStr.optional(),
  customerEmail: email.optional(),
});

export const widgetTicketSchema = z.object({
  apiKey: z.string().min(1),
  content: longStr.optional(),
  customerName: shortStr.optional(),
  customerEmail: email.optional(),
  subject: shortStr.optional(),
  transcript: z.array(z.any()).optional(),
});
