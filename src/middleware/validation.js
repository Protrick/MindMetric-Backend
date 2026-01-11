// Input validation middleware
const validateStressData = (req, res, next) => {
  const { name, email, heart_rate, temp, rms, zcr, stress } = req.body;

  const errors = [];

  if (!name || typeof name !== "string")
    errors.push("name is required and must be a string");
  if (!email || typeof email !== "string" || !email.includes("@"))
    errors.push("valid email is required");
  if (heart_rate !== undefined && typeof heart_rate !== "number")
    errors.push("heart_rate must be a number");
  if (temp !== undefined && typeof temp !== "number")
    errors.push("temp must be a number");
  if (rms !== undefined && typeof rms !== "number")
    errors.push("rms must be a number");
  if (zcr !== undefined && typeof zcr !== "number")
    errors.push("zcr must be a number");
  if (stress !== undefined && typeof stress !== "boolean")
    errors.push("stress must be a boolean");

  if (errors.length > 0) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: errors });
  }

  next();
};

const validateRegistration = (req, res, next) => {
  // Deprecated: registration via password is not supported. Redirect to Google Sign-In.
  return res.status(410).json({
    error: "Registration via password is removed. Use Google Sign-In.",
  });
};

const validateLogin = (req, res, next) => {
  // Deprecated: login via password is not supported.
  return res
    .status(410)
    .json({ error: "Login via password is removed. Use Google Sign-In." });
};

const validateGoogleSignIn = (req, res, next) => {
  const { googleId, email } = req.body;
  const errors = [];
  if (!googleId || typeof googleId !== "string")
    errors.push("googleId is required");
  if (!email || typeof email !== "string" || !email.includes("@"))
    errors.push("valid email is required");
  if (errors.length > 0)
    return res
      .status(400)
      .json({ error: "Validation failed", details: errors });
  next();
};

module.exports = {
  validateStressData,
  validateRegistration,
  validateLogin,
  validateGoogleSignIn,
};
