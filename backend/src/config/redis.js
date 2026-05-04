import Redis from "ioredis";
import { REDIS_URL } from "./env.js";

/**
 * Optional Redis client.
 * If REDIS_URL is not set the server still boots - features that depend on
 * Redis (token blacklisting, rate limiting) are just silently skipped.
 */
let redis = null;

if (REDIS_URL) {
  redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: true });
  redis.on("connect", () => console.log("Redis connected"));
  redis.on("error",   (err) => console.warn("Redis:", err.message));
  redis.connect().catch((err) => console.warn("Redis connect failed:", err.message));
} else {
  console.warn("REDIS_URL not set - token blacklisting disabled");
}

export default redis;
