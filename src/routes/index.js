const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const stressRoutes = require("./stressRoutes");

// Health check
router.get("/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Mount routes
router.use("/auth", authRoutes);
router.use("/stress", stressRoutes);

module.exports = router;
