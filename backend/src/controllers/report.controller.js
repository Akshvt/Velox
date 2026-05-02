import Report from "../models/Report.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * @desc    Get all reports for the tenant
 * @route   GET /admin/reports
 * @access  Private (Admin/Agent)
 */
export const listReports = async (req, res) => {
  const reports = await Report.find({ tenantId: req.tenant })
    .sort({ createdAt: -1 })
    .limit(1000)
    .lean();
  res.json({ success: true, reports });
};

/**
 * @desc    Create a new report
 * @route   POST /admin/reports
 * @access  Private (Admin/Agent)
 */
export const createReport = async (req, res) => {
  const { name, type, desc, frequency } = req.body;

  let creatorName = "Admin User";
  try {
    const user = await User.findById(req.user.userId).select("name").lean();
    if (user && user.name) creatorName = user.name;
  } catch (err) {
    // silently fallback
  }

  const report = await Report.create({
    tenantId: req.tenant,
    name,
    type,
    desc,
    frequency: frequency || "One-time",
    createdBy: creatorName,
    status: "Success",
    lastRun: new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  res.status(201).json({ success: true, report });
};

/**
 * @desc    Delete a report
 * @route   DELETE /admin/reports/:id
 * @access  Private (Admin)
 */
export const deleteReport = async (req, res) => {
  const report = await Report.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.tenant,
  });

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  res.json({ success: true, message: "Report deleted successfully" });
};

/**
 * @desc    Export a report (mock implementation for CSV/PDF generation)
 * @route   GET /admin/reports/:id/export
 * @access  Private (Admin)
 */
export const exportReport = async (req, res) => {
  const report = await Report.findOne({
    _id: req.params.id,
    tenantId: req.tenant,
  });

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  // In a real app, you would generate a CSV/PDF here and stream it.
  // We'll return a mock download URL for the UI to consume.
  const mockUrl = `/downloads/reports/${report._id}-${Date.now()}.csv`;
  res.json({ success: true, url: mockUrl });
};

/**
 * @desc    Schedule a report
 * @route   POST /admin/reports/:id/schedule
 * @access  Private (Admin)
 */
export const scheduleReport = async (req, res) => {
  const { frequency } = req.body;
  if (!frequency) throw new ApiError(400, "Frequency is required");

  const report = await Report.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenant },
    { $set: { frequency, status: "Scheduled" } },
    { new: true }
  );

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  res.json({ success: true, report });
};
