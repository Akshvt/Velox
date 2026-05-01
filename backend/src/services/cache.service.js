import redis from "../config/redis.js";

/**
 * Redis cache helpers with automatic TTL management.
 * All operations gracefully handle null Redis (server runs without cache).
 */

/** Get a cached JSON value. Returns null on miss or if Redis is down. */
export async function cacheGet(key) {
  if (!redis) return null;
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

/** Set a JSON value with TTL (in seconds). Default 5 minutes. */
export async function cacheSet(key, value, ttl = 300) {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch { /* non-critical */ }
}

/** Delete a cache key or pattern. */
export async function cacheDel(key) {
  if (!redis) return;
  try {
    // If key contains *, use scan + del for pattern deletion
    if (key.includes("*")) {
      const keys = await redis.keys(key);
      if (keys.length) await redis.del(...keys);
    } else {
      await redis.del(key);
    }
  } catch { /* non-critical */ }
}
