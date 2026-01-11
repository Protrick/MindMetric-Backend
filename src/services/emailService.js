const nodemailer = require("nodemailer");

function createTransport() {
  if (process.env.SENDER_EMAIL && process.env.SENDER_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : true,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true" || false,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
}

const transporter = createTransport();

async function sendStressReportEmail({ to, subject, reportText }) {
  const html = reportText
    .split("\n")
    .map((line) => `<p>${line}</p>`)
    .join("");

  const message = {
    from: process.env.EMAIL_FROM || process.env.SENDER_EMAIL,
    to,
    subject,
    text: reportText,
    html,
    attachments: [
      {
        filename: "mindmetric_stress_report.txt",
        content: Buffer.from(reportText, "utf8"),
      },
    ],
  };

  const info = await transporter.sendMail(message);
  console.log("✓ Email sent:", info.messageId);
  return info;
}

module.exports = { sendStressReportEmail };
