const express = require("express");
const router = express.Router();
const stressController = require("../controllers/stressController");
const { authenticate, optionalAuth } = require("../middleware/auth");
const { validateStressData } = require("../middleware/validation");

// POST /api/stress/report - Create new stress report (optional auth)
router.post(
  "/report",
  optionalAuth,
  validateStressData,
  stressController.createStressReport
);

// GET /api/stress/my-reports - Get current user's reports (protected)
router.get("/my-reports", authenticate, stressController.getMyReports);

// GET /api/stress/reports/:id - Get specific report (optional auth)
router.get("/reports/:id", optionalAuth, stressController.getReportById);

// GET /api/stress/reports - Get all reports (for admin/testing)
router.get("/reports", stressController.getAllReports);

module.exports = router;
