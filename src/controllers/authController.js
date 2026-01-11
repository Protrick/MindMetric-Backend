const User = require("../models/User");
const { generateToken } = require("../middleware/auth");
const admin = require("../config/firebase").admin; // firebase-admin instance

// Health endpoint similar to Spring example
exports.healthCheck = async (req, res) => {
  const health = {};
  try {
    if (!admin || !admin.apps || admin.apps.length === 0) {
      health.firebase = "NOT_INITIALIZED";
      health.status = "ERROR";
      return res.status(500).json(health);
    }

    health.firebase = "CONNECTED";

    // Try a light call to ensure auth is reachable
    await admin.auth().listUsers(1);
    health.firebase_auth = "WORKING";
    health.status = "OK";
    return res.json(health);
  } catch (err) {
    console.error("Health check error:", err);
    health.firebase = "ERROR";
    health.error = err.message;
    health.status = "ERROR";
    return res.status(500).json(health);
  }
};

// Verify Firebase ID token and create/update user (mirrors Spring /verify behavior)
// Header: Authorization: Bearer <idToken>
exports.verifyUser = async (req, res) => {
  try {
    if (!admin || !admin.apps || admin.apps.length === 0) {
      console.error("Firebase not initialized");
      return res
        .status(500)
        .json({
          success: false,
          message: "Server configuration error - Firebase not initialized",
        });
    }

    const authHeader = req.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      console.warn("Invalid Authorization header");
      return res
        .status(400)
        .json({
          success: false,
          message: "Missing or invalid Authorization header",
        });
    }

    const idToken = authHeader.substring(7);
    const fcmToken = req.get("X-FCM-TOKEN") || null;

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (err) {
      console.warn("Firebase auth failed:", err.message);
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired Firebase token" });
    }

    const uid = decodedToken.uid;
    const name = decodedToken.name || decodedToken.email || "Unknown";
    const email = decodedToken.email || null;

    // Create or update user record
    try {
      if (email) {
        const user = await User.createOrUpdateFromGoogle({
          googleId: uid,
          name,
          email,
          deviceToken: fcmToken,
        });
        console.info("User upserted:", user.id);
      } else {
        // If no email in token, fallback to uid-only record
        // We'll store minimal record with uid as googleId
        await User.createOrUpdateFromGoogle({
          googleId: uid,
          name,
          email: null,
          deviceToken: fcmToken,
        });
      }
    } catch (dbErr) {
      console.error("Database operation failed:", dbErr);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    // Return a local JWT for session usage (optional)
    const localUser = await User.findByGoogleId(uid);
    const token = localUser ? generateToken(localUser.id) : null;

    return res.json({
      success: true,
      message: "User authenticated successfully",
      token,
    });
  } catch (err) {
    console.error("Unexpected error during authentication", err);
    return res
      .status(500)
      .json({ success: false, message: "Authentication failed" });
  }
};

// Google Sign-In endpoint (legacy-compatible)
// Expected payload: { googleId, name, email, deviceToken }
exports.googleSignIn = async (req, res) => {
  try {
    const { googleId, name, email, deviceToken } = req.body;
    if (!googleId || !email) {
      return res.status(400).json({ error: "googleId and email are required" });
    }

    const user = await User.createOrUpdateFromGoogle({
      googleId,
      name,
      email,
      deviceToken,
    });
    const token = generateToken(user.id);
    res.json({ message: "Sign-in successful", user, token });
  } catch (err) {
    console.error("Google sign-in error:", err);
    res.status(500).json({ error: "Sign-in failed" });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Failed to get profile" });
  }
};

// Update device token
exports.updateDeviceToken = async (req, res) => {
  try {
    const { deviceToken } = req.body;
    if (!deviceToken)
      return res.status(400).json({ error: "deviceToken required" });

    const updated = await User.update(req.user.id, { deviceToken });
    res.json({ message: "Device token updated", user: updated });
  } catch (err) {
    console.error("Update device token error:", err);
    res.status(500).json({ error: "Failed to update device token" });
  }
};
