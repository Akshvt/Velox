import "dotenv/config";

// Crash early if any of these are missing from .env
const required = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "NODE_ENV"];
const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  console.error("Missing env vars:", missing.join(", "));
  process.exit(1);
}

export const {
  PORT = 5000,
  NODE_ENV,
  MONGODB_URI,
  REDIS_URL = null,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY = "15m",
  JWT_REFRESH_EXPIRY = "7d",
  CLIENT_URL = "http://localhost:5173",
} = process.env;
