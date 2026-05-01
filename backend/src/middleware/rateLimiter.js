import redis from "../config/redis.js";

/**
 * In-memory rate limit store as fallback when Redis is unavailable.
 * Map<key, { timestamps: number[] }>
 * Cleaned periodically to prevent memory leaks.
 */
const memoryStore = new Map();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore) {
    entry.timestamps = entry.timestamps.filter((t) => t > now - 60000);
    if (entry.timestamps.length === 0) memoryStore.delete(key);
  }
}, CLEANUP_INTERVAL).unref();

/**
 * In-memory sliding window check (used when Redis is down).
 */
function memoryCheck(key, limit) {
  const now = Date.now();
  const windowStart = now - 60000;

  if (!memoryStore.has(key)) memoryStore.set(key, { timestamps: [] });
  const entry = memoryStore.get(key);

  // Remove entries outside window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);
  entry.timestamps.push(now);

  return entry.timestamps.length > limit;
}

/**
 * Redis-backed sliding window rate limiter with in-memory fallback.
 * Returns 429 when the limit is exceeded.
 *
 * @param {number} limit - Max requests per 60-second window
 */
const slidingWindowLimiter = (limit) => async (req, res, next) => {
  const key = `rate:${req.path}:${req.ip}`;

  // Try Redis first
  if (redis) {
    try {
      const now = Date.now();
      const windowStart = now - 60000;

      await redis.zadd(key, now, `${now}-${Math.random()}`);
      await redis.zremrangebyscore(key, 0, windowStart);
      const count = await redis.zcard(key);
      await redis.expire(key, 60);

      if (count > limit) {
        return res.status(429).json({ success: false, message: "Rate limit exceeded" });
      }
      return next();
    } catch (error) {
      console.warn("Rate limiter redis error, falling back to memory:", error.message);
    }
  }

  // In-memory fallback - rate limiting stays active even without Redis
  if (memoryCheck(key, limit)) {
    return res.status(429).json({ success: false, message: "Rate limit exceeded" });
  }

  next();
};

export { slidingWindowLimiter };
