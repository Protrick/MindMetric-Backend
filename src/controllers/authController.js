const User = require("../models/User");
const { generateToken } = require("../middleware/auth");

// Google Sign-In endpoint
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
