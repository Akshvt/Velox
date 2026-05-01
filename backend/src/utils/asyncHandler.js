/**
 * Wraps an async route handler so any thrown error is passed to next().
 * This replaces express-async-errors - no monkey-patching, fully ESM-compatible.
 *
 * Usage: router.get("/route", asyncHandler(myController))
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
