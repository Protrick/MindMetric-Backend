// firebase.js
const admin = require("firebase-admin");

let firebaseInitialized = false;
let adminApp = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const sa = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    adminApp = admin.initializeApp({ credential: admin.credential.cert(sa) });
  } else {
    adminApp = admin.initializeApp();
  }
  firebaseInitialized = true;
  console.log("Firebase admin initialized");
} catch (err) {
  console.warn(
    "Firebase admin init failed:",
    err && err.message ? err.message : err
  );
}

const messaging = firebaseInitialized ? admin.messaging() : null;
const db = firebaseInitialized ? admin.firestore() : null;

module.exports = { admin, adminApp, messaging, db, firebaseInitialized };
