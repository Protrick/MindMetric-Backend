const { db } = require("../config/firebase");

class StressReport {
  static collectionRef = "stress_reports";

  static async create(reportData) {
    const {
      userId,
      name,
      email,
      heart_rate,
      temp,
      rms,
      zcr,
      stress,
      readings = {},
      ai_prediction,
      modelSummary = "",
      reportText = "",
    } = reportData;

    const newReportRef = db.ref(this.collectionRef).push();
    const reportId = newReportRef.key;

    const report = {
      userId: userId || null,
      name: name || "Unknown",
      email: email || null,
      stress: Boolean(stress),
      // Store all sensor data inside readings object only
      readings: {
        ...readings,
        ai_prediction:
          ai_prediction !== undefined
            ? ai_prediction
            : readings.ai_prediction || null,
        heart_rate: readings.heart_rate ?? heart_rate ?? null,
        temp: readings.temp ?? temp ?? null,
        rms: readings.rms ?? rms ?? null,
        zcr: readings.zcr ?? zcr ?? null,
      },
      modelSummary,
      reportText,
      createdAt: Date.now(),
    };

    await newReportRef.set(report);
    return { id: reportId, ...report };
  }

  static async findById(id) {
    const snapshot = await db.ref(`${this.collectionRef}/${id}`).once("value");
    if (!snapshot.exists()) return null;
    return { id, ...snapshot.val() };
  }

  static async findByUserId(userId, limit = 50) {
    const snapshot = await db
      .ref(this.collectionRef)
      .orderByChild("userId")
      .equalTo(userId)
      .limitToLast(limit)
      .once("value");

    if (!snapshot.exists()) return [];

    const reports = [];
    snapshot.forEach((child) => {
      reports.push({ id: child.key, ...child.val() });
    });

    // Sort by createdAt descending (most recent first)
    return reports.sort((a, b) => b.createdAt - a.createdAt);
  }

  static async findByEmail(email, limit = 50) {
    const snapshot = await db
      .ref(this.collectionRef)
      .orderByChild("email")
      .equalTo(email)
      .limitToLast(limit)
      .once("value");

    if (!snapshot.exists()) return [];

    const reports = [];
    snapshot.forEach((child) => {
      reports.push({ id: child.key, ...child.val() });
    });

    // Sort by createdAt descending
    return reports.sort((a, b) => b.createdAt - a.createdAt);
  }

  static async getAll(limit = 100) {
    const snapshot = await db
      .ref(this.collectionRef)
      .orderByChild("createdAt")
      .limitToLast(limit)
      .once("value");

    if (!snapshot.exists()) return [];

    const reports = [];
    snapshot.forEach((child) => {
      reports.push({ id: child.key, ...child.val() });
    });

    // Sort by createdAt descending
    return reports.sort((a, b) => b.createdAt - a.createdAt);
  }
}

module.exports = StressReport;
