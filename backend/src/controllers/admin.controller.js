import User from "../models/User.js";
import FAQ from "../models/FAQ.js";
import Tenant from "../models/Tenant.js";
import { cacheDel } from "../services/cache.service.js";

// --- Users ---

/** GET /api/admin/users */
export const listUsers = async (req, res) => {
  const users = await User.find({ tenantId: req.tenant })
    .select("-passwordHash -refreshTokenHash")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, users });
};

/** POST /api/admin/users/invite */
export const inviteUser = async (req, res) => {
  const { name, email, role, password } = req.body;

  const exists = await User.findOne({ tenantId: req.tenant, email });
  if (exists)
    return res.status(409).json({ success: false, message: "Email already in use" });

  const user = await User.create({
    tenantId:     req.tenant,
    name,
    email,
    passwordHash: password,
    role,
  });

  res.status(201).json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
  });
};

/** PATCH /api/admin/users/:id/role */
export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenant },
    { role },
    { new: true }
  ).select("-passwordHash -refreshTokenHash").lean();

  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
};

/** PATCH /api/admin/users/:id/status */
export const updateUserStatus = async (req, res) => {
  const { isActive } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenant },
    { isActive },
    { new: true }
  ).select("-passwordHash -refreshTokenHash").lean();

  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
};

// --- FAQs ---

/** GET /api/admin/faqs */
export const listFAQs = async (req, res) => {
  const { category, search } = req.query;
  const filter = { tenantId: req.tenant };
  if (category) filter.category = category;
  if (search)   filter.question = { $regex: search, $options: "i" };

  const faqs = await FAQ.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, faqs });
};

/** POST /api/admin/faqs */
export const createFAQ = async (req, res) => {
  const { question, answer, category } = req.body;

  const faq = await FAQ.create({ tenantId: req.tenant, question, answer, category });
  await cacheDel(`tenant:${req.tenant}:faqs:*`);
  res.status(201).json({ success: true, faq });
};

/** PUT /api/admin/faqs/:id - only allow whitelisted fields */
export const updateFAQ = async (req, res) => {
  const { question, answer, category, isActive } = req.body;
  const updates = {};
  if (question !== undefined)  updates.question = question;
  if (answer !== undefined)    updates.answer   = answer;
  if (category !== undefined)  updates.category = category;
  if (isActive !== undefined)  updates.isActive = isActive;

  const faq = await FAQ.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenant },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
  await cacheDel(`tenant:${req.tenant}:faqs:*`);
  res.json({ success: true, faq });
};

/** DELETE /api/admin/faqs/:id */
export const deleteFAQ = async (req, res) => {
  const faq = await FAQ.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant });
  if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
  await cacheDel(`tenant:${req.tenant}:faqs:*`);
  res.json({ success: true, message: "FAQ deleted" });
};

// --- Settings ---

/** GET /api/admin/settings */
export const getSettings = async (req, res) => {
  const tenant = await Tenant.findById(req.tenant).lean();
  if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
  res.json({ success: true, settings: tenant.settings, name: tenant.name, plan: tenant.plan });
};

/** PUT /api/admin/settings/ai */
export const updateAISettings = async (req, res) => {
  const tenant = await Tenant.findByIdAndUpdate(
    req.tenant,
    { $set: { "settings.ai": { ...req.body } } },
    { new: true }
  ).lean();
  if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
  res.json({ success: true, settings: tenant.settings });
};

/** PUT /api/admin/settings/widget */
export const updateWidgetSettings = async (req, res) => {
  const tenant = await Tenant.findByIdAndUpdate(
    req.tenant,
    { $set: { "settings.widget": { ...req.body } } },
    { new: true }
  ).lean();
  if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
  res.json({ success: true, settings: tenant.settings });
};

/** PUT /api/admin/settings/routing */
export const updateRoutingSettings = async (req, res) => {
  const { rules } = req.body;
  const tenant = await Tenant.findByIdAndUpdate(
    req.tenant,
    { $set: { "settings.routing": rules } },
    { new: true }
  ).lean();
  if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
  res.json({ success: true, settings: tenant.settings });
};
