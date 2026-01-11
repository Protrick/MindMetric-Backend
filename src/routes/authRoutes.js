const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { validateGoogleSignIn } = require("../middleware/validation");

// POST /api/auth/google-signin
router.post(
  "/google-signin",
  validateGoogleSignIn,
  authController.googleSignIn
);

// GET /api/auth/profile (protected)
router.get("/profile", authenticate, authController.getProfile);

// PUT /api/auth/device-token (protected)
router.put("/device-token", authenticate, authController.updateDeviceToken);

// GET /api/auth/health
router.get("/health", authController.healthCheck);

// GET /api/auth/verify - verifies Firebase token header and upserts user
router.get("/verify", authController.verifyUser);

module.exports = router;
