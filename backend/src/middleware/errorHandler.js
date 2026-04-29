import { NODE_ENV } from "../config/env.js";

/**
 * Global error handler — must be the last middleware registered in server.js.
 * Normalises all thrown errors into a consistent JSON shape.
 * Stack trace is only included in development mode.
 */
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  let status  = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose duplicate key (e.g. same email in same tenant)
  if (err.code === 11000) {
    status  = 409;
    message = "Already exists";
  }

  // Mongoose schema validation failed
  if (err.name === "ValidationError") {
    status  = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  // JWT errors — these are thrown by verifyAccessToken / verifyRefreshToken
  if (err.name === "JsonWebTokenError") { status = 401; message = "Invalid token"; }
  if (err.name === "TokenExpiredError") { status = 401; message = "Token expired"; }

  res.status(status).json({
    success: false,
    message,
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
}
