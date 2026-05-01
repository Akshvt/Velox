import { randomBytes, createHmac } from "crypto";
import Tenant from "../models/Tenant.js";

const HMAC_SECRET = process.env.API_KEY_SECRET || "velox-apikey-secret";

/**
 * Generates a secure, URL-safe widget API key.
 * Format: "vx_<random32hex>" - the "vx_" prefix makes Velox keys easy to identify.
 */
export function generateApiKey() {
  const raw = randomBytes(32).toString("hex");
  return `vx_${raw}`;
}

/**
 * Validates an API key submitted by the embeddable widget.
 * Looks up the Tenant by apiKey - returns the Tenant doc if found, null otherwise.
 * Does NOT throw; callers should handle the null case themselves.
 *
 * @param {string} key - The raw API key from the widget request
 * @returns {Promise<import("mongoose").Document|null>}
 */
export async function validateApiKey(key) {
  if (!key || !key.startsWith("vx_")) return null;
  const tenant = await Tenant.findOne({ apiKey: key });
  return tenant ?? null;
}
