const { NODE_ENV } = require("../config/env");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  // Mongoose duplicate key
  if (err.code === 11000) {
    response.message = "Duplicate field value — that record already exists";
    return res.status(409).json(response);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    response.message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json(response);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    response.message = "Invalid token";
    return res.status(401).json(response);
  }
  if (err.name === "TokenExpiredError") {
    response.message = "Token expired";
    return res.status(401).json(response);
  }

  if (NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
