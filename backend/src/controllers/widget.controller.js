import Tenant from "../models/Tenant.js";
import crypto from "crypto";

/**
 * GET /api/widget/config/:apiKey
 * Public - returns widget display config for the embed script.
 */
export const getWidgetConfig = async (req, res) => {
  const tenant = await Tenant.findOne({ apiKey: req.params.apiKey });
  if (!tenant)
    return res.status(404).json({ success: false, message: "Invalid API key" });

  res.json({
    success: true,
    config: {
      tenantId:    tenant._id,
      name:        tenant.name,
      accentColor: tenant.settings?.widget?.accentColor || "#00E676",
      greeting:    tenant.settings?.widget?.greeting || "Hi! How can we help?",
      aiEnabled:   tenant.settings?.ai?.enabled ?? true,
    },
  });
};

/**
 * POST /api/widget/session
 * Creates or resumes a customer chat session.
 * Returns a sessionToken for the widget to use on Socket.IO connections.
 */
export const createSession = async (req, res) => {
  const { apiKey, customerName, customerEmail, sessionToken } = req.body;

  if (!apiKey)
    return res.status(400).json({ success: false, message: "apiKey is required" });

  const tenant = await Tenant.findOne({ apiKey });
  if (!tenant)
    return res.status(404).json({ success: false, message: "Invalid API key" });

  // Resume existing session or create new one
  const token = sessionToken || `sess_${crypto.randomBytes(16).toString("hex")}`;

  res.json({
    success: true,
    session: {
      sessionToken: token,
      tenantId:     tenant._id,
      greeting:     tenant.settings?.widget?.greeting || "Hi! How can we help?",
    },
  });
};
