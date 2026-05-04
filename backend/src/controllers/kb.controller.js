import KbArticle from "../models/KbArticle.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * @desc    Get all KB articles for the tenant
 * @route   GET /admin/kb
 * @access  Private (Admin)
 */
export const listKbArticles = async (req, res) => {
  const articles = await KbArticle.find({ tenantId: req.tenant })
    .sort({ createdAt: -1 })
    .limit(1000)
    .lean();
  res.json({ success: true, articles });
};

/**
 * @desc    Get a single KB article by ID
 * @route   GET /admin/kb/:id
 * @access  Private (Admin)
 */
export const getKbArticle = async (req, res) => {
  const article = await KbArticle.findOne({
    _id: req.params.id,
    tenantId: req.tenant,
  }).lean();

  if (!article) {
    throw new ApiError(404, "KB Article not found");
  }

  res.json({ success: true, article });
};

/**
 * @desc    Create a new KB article
 * @route   POST /admin/kb
 * @access  Private (Admin)
 */
export const createKbArticle = async (req, res) => {
  const { title, content, category, status, tags } = req.body;

  const article = await KbArticle.create({
    tenantId: req.tenant,
    title,
    content,
    category,
    status,
    tags: tags || [],
    createdBy: req.user.userId,
  });

  res.status(201).json({ success: true, article });
};

/**
 * @desc    Update a KB article
 * @route   PUT /admin/kb/:id
 * @access  Private (Admin)
 */
export const updateKbArticle = async (req, res) => {
  const { title, content, category, status, tags, usedCount } = req.body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (category !== undefined) updateData.category = category;
  if (status !== undefined) updateData.status = status;
  if (tags !== undefined) updateData.tags = tags;
  if (usedCount !== undefined) updateData.usedCount = usedCount;

  const article = await KbArticle.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenant },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!article) {
    throw new ApiError(404, "KB Article not found");
  }

  res.json({ success: true, article });
};

/**
 * @desc    Delete a KB article
 * @route   DELETE /admin/kb/:id
 * @access  Private (Admin)
 */
export const deleteKbArticle = async (req, res) => {
  const article = await KbArticle.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.tenant,
  });

  if (!article) {
    throw new ApiError(404, "KB Article not found");
  }

  res.json({ success: true, message: "KB Article deleted successfully" });
};
