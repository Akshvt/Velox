import { ZodError } from "zod";

/**
 * Express middleware factory - validates req.body against a Zod schema.
 * Returns 400 with structured errors if validation fails.
 *
 * Usage: router.post("/foo", validate(fooSchema), controller);
 */
const validate = (schema) => (req, _res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return _res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    next(err);
  }
};

export default validate;
