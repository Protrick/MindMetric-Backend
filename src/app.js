require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const routes = require("./routes");
const { setupStressSocket } = require("./socket/stressSocket");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// API routes
app.use("/api", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "MindMetric Backend API",
    version: "1.0.0",
    auth: "Google Sign-In only",
    endpoints: {
      health: "/api/health",
      auth: {
        googleSignIn: "POST /api/auth/google-signin",
        profile: "GET /api/auth/profile (protected)",
        updateDeviceToken: "PUT /api/auth/device-token (protected)",
      },
      stress: {
        createReport: "POST /api/stress/report",
        myReports: "GET /api/stress/my-reports (protected)",
        getReport: "GET /api/stress/reports/:id",
        allReports: "GET /api/stress/reports",
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["websocket", "polling"],
});

setupStressSocket(io);

module.exports = { app, server };
