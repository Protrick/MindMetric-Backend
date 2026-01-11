const { generateStressReport } = require("../services/geminiService");
const { sendStressReportEmail } = require("../services/emailService");
const { sendStressNotification } = require("../services/fcmService");
const StressReport = require("../models/StressReport");

function setupStressSocket(io) {
  io.on("connection", (socket) => {
    console.log("✓ Client connected:", socket.id);

    socket.on("stressDetected", async (payload) => {
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
        userEmail,
        fcmToken,
        userId,
        readings: incomingReadings = {},
        ai_prediction: ai_prediction_top,
      } = payload || {};

      const ai_prediction =
        ai_prediction_top !== undefined
          ? ai_prediction_top
          : incomingReadings.ai_prediction;

      try {
        // Generate AI report
        const reportText = await generateStressReport({
          astronaut: { id: userId, name, email },
          readings: { heartRate: heart_rate, temp, rms, zcr },
          modelSummary,
        });

        // Save to Realtime Database
        const report = await StressReport.create({
          userId: userId || null,
          name: name || "Unknown",
          email: email || null,
          heart_rate,
          temp,
          rms,
          zcr,
          stress: Boolean(stress),
          readings: { ...(incomingReadings || {}), heart_rate, temp, rms, zcr },
          ai_prediction,
          modelSummary,
          reportText,
        });

        // Send email if stress detected
        if (stress) {
          const recipients = [email, userEmail, authorityEmail].filter(Boolean);
          if (recipients.length > 0) {
            await sendStressReportEmail({
              to: recipients.join(","),
              subject: `MindMetric Stress Report - ${name || "User"}`,
              reportText,
            }).catch((err) => console.error("Email error:", err));
          }

          // Send FCM
          if (fcmToken) {
            await sendStressNotification({
              token: fcmToken,
              title: "Stress Detected",
              body: `Stress detected for ${name || "user"}. Please review.`,
              data: { reportId: report.id, userId: userId || "" },
            }).catch((err) => console.error("FCM error:", err));
          }
        }

        socket.emit("stressReportSent", { ok: true, reportId: report.id });
      } catch (err) {
        console.error("Socket stressDetected error:", err);
        socket.emit("stressReportError", {
          error: "Failed to generate or send report",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("✗ Client disconnected:", socket.id);
    });
  });
}

module.exports = { setupStressSocket };
