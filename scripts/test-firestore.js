const admin = require("firebase-admin");
const servicePath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  "/home/pratik/Downloads/firebase-service-account.json";
admin.initializeApp({
  credential: admin.credential.cert(require(servicePath)),
});
const db = admin.firestore();

(async () => {
  try {
    const r = await db
      .collection("debug_test")
      .add({ ts: new Date().toISOString() });
    console.log("ok, wrote id=", r.id);
  } catch (e) {
    console.error("firestore error:", e);
  }
  process.exit(0);
})();
