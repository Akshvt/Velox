/**
 * Extracts tenantId from req.user (set by requireAuth) and attaches it
 * as req.tenant for convenience in route handlers.
 *
 * Must be used AFTER requireAuth in the middleware chain:
 *   router.get("/...", requireAuth, requireTenant, handler)
 *
 * Every Mongoose query downstream MUST filter by `tenantId: req.tenant`
 * to guarantee multi-tenant data isolation.
 */
export function requireTenant(req, res, next) {
  if (!req.user?.tenantId)
    return res.status(401).json({ success: false, message: "Tenant context missing" });

  req.tenant = req.user.tenantId;
  next();
}
