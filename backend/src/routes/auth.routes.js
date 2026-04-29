const express = require("express");
const { register, login, logout, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register -- public
router.post("/register", register);

// POST /api/auth/login -- public
router.post("/login", login);

// POST /api/auth/logout -- requires valid access token
router.post("/logout", requireAuth, logout);

// GET /api/auth/me -- requires valid access token
router.get("/me", requireAuth, me);

module.exports = router;
