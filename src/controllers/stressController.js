const StressReport = require("../models/StressReport");
const { generateStressReport } = require("../services/geminiService");
const { sendStressReportEmail } = require("../services/emailService");
const { sendStressNotification } = require("../services/fcmService");
const stressStateTracker = require("../utils/stressStateTracker");

exports.createStressReport = async (req, res) => {
  try {
    const {
      name,
      email,
      heart_rate,
      temp,
      rms,
      zcr,
      stress,
      modelSummary = "",
      authorityEmail,
      fcmToken,
      readings: incomingReadings = {},
      ai_prediction: ai_prediction_top,
    } = req.body;

    // prefer explicit top-level ai_prediction, otherwise check incomingReadings
    const ai_prediction =
      ai_prediction_top !== undefined
        ? ai_prediction_top
        : incomingReadings.ai_prediction;

    const userId = req.user ? req.user.id : null;

    // Generate AI report
    const reportText = await generateStressReport({
      astronaut: { id: userId, name, email },
      readings: { heartRate: heart_rate, temp, rms, zcr },
      modelSummary,
    });

    // Save to Realtime Database
    const report = await StressReport.create({
      userId,
      name,
      email,
      heart_rate,
      temp,
      rms,
      zcr,
      stress,
      // merge any incoming readings and ensure numeric fields are present
      readings: { ...(incomingReadings || {}), heart_rate, temp, rms, zcr },
      ai_prediction,
      modelSummary,
      reportText,
    });

    // Send email if stress detected (only on state transition from false -> true)
    if (stress && stressStateTracker.shouldSendEmail(email, stress)) {
      const recipients = [email, authorityEmail].filter(Boolean);
      if (recipients.length > 0) {
        await sendStressReportEmail({
          to: recipients.join(","),
          subject: `MindMetric Stress Report - ${name}`,
          reportText,
        }).catch((err) => console.error("Email send error:", err));
      }

      // Send FCM notification
      if (fcmToken) {
        await sendStressNotification({
          token: fcmToken,
          title: "Stress Detected",
          body: `Stress detected for ${name}. Please review the report.`,
          data: { reportId: report.id, userId: userId || "" },
        }).catch((err) => console.error("FCM error:", err));
      }
    } else if (!stress) {
      // Update tracker when stress is false (allows next email when stress becomes true)
      stressStateTracker.shouldSendEmail(email, stress);
    }

    res.status(201).json({
      message: "Stress report created successfully",
      report: {
        id: report.id,
        name: report.name,
        email: report.email,
        stress: report.stress,
        readings: report.readings,
        reportText: report.reportText,
      },
    });
  } catch (err) {
    console.error("Create stress report error:", err);
    res.status(500).json({ error: "Failed to create stress report" });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const reports = await StressReport.findByUserId(userId);
    res.json({ reports });
  } catch (err) {
    console.error("Get reports error:", err);
    res.status(500).json({ error: "Failed to get reports" });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await StressReport.findById(id);

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Check authorization
    if (req.user && report.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json({ report });
  } catch (err) {
    console.error("Get report error:", err);
    res.status(500).json({ error: "Failed to get report" });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await StressReport.getAll();
    res.json({ reports });
  } catch (err) {
    console.error("Get all reports error:", err);
    res.status(500).json({ error: "Failed to get reports" });
  }
};
