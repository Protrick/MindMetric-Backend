const admin = require("firebase-admin");

let firebaseInitialized = false;
let adminApp = null;
let db = null;
let messaging = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const sa = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(sa),
      databaseURL:
        process.env.FIREBASE_DATABASE_URL ||
        `https://${sa.project_id}-default-rtdb.firebaseio.com`,
    });
  } else {
    adminApp = admin.initializeApp();
  }

  db = admin.database();
  messaging = admin.messaging();
  firebaseInitialized = true;
  console.log("✓ Firebase admin initialized (Realtime Database)");
} catch (err) {
  console.warn("⚠ Firebase admin init failed:", err.message || err);
}

module.exports = { admin, adminApp, messaging, db, firebaseInitialized };
