const { REDIS_URL } = require("./env");
const Redis = require("ioredis");

let redis = null;

if (REDIS_URL) {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  redis.on("connect", () => console.log("Redis connected"));
  redis.on("error", (err) => console.warn("Redis error:", err.message));

  redis.connect().catch((err) =>
    console.warn("Redis initial connect failed:", err.message)
  );
} else {
  console.warn(
    "REDIS_URL not set -- Redis features (blacklist, rate limiting) disabled"
  );
}

module.exports = redis;
