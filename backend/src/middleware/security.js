import helmet from "helmet";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import { filterXSS } from "xss";
import hpp from "hpp";
import { CLIENT_URL } from "../config/env.js";

/**
 * Security middleware stack - applied in this exact order.
 *
 * 1. helmet        - HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
 * 2. cors          - Whitelist the frontend origin only
 * 3. hpp           - Prevent HTTP Parameter Pollution (duplicate query params)
 * 4. mongoSanitize - Strip $ and . keys from req.body/params/query
 * 5. xssClean      - Escape HTML in req.body/params/query (using maintained `xss` lib)
 *
 * Body size is limited in server.js (express.json({ limit: "10kb" })).
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge:            31536000, // 1 year in seconds
    includeSubDomains: true,
    preload:           true,
  },
});

const corsMiddleware = cors({
  origin:         CLIENT_URL,
  credentials:    true,         // Required so the browser sends the httpOnly cookie
  methods:        ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

/** Recursively sanitises all string values in an object using xss lib */
const sanitizeObject = (obj) => {
  if (typeof obj === "string") return filterXSS(obj);
  if (Array.isArray(obj))     return obj.map(sanitizeObject);
  if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) obj[key] = sanitizeObject(obj[key]);
  }
  return obj;
};

/** Express middleware: sanitise req.body, req.query, req.params */
const xssClean = (req, _res, next) => {
  if (req.body)   req.body   = sanitizeObject(req.body);
  if (req.query)  req.query  = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

/**
 * Returns an array of security middleware in the correct order.
 * Mount with: app.use(security);
 */
const security = [
  helmetMiddleware,
  corsMiddleware,
  hpp(),
  mongoSanitize(),
  xssClean,
];

export default security;
