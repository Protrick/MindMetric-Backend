const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateStressReport({
  astronaut = {},
  readings = {},
  modelSummary = "",
}) {
  if (!process.env.GEMINI_API_KEY) {
    return generateFallbackReport(astronaut, readings, modelSummary);
  }

  const prompt =
    `You are generating a medical-style stress status report for an astronaut.

Astronaut:
- ID: ${astronaut.id || "N/A"}
- Name: ${astronaut.name || "Unknown"}
- Email: ${astronaut.email || "N/A"}

Latest readings:
- Heart Rate: ${readings.heartRate || readings.heart_rate || "N/A"} bpm
- Temperature: ${readings.temp || "N/A"}°C
- RMS (Root Mean Square): ${readings.rms || "N/A"}
- ZCR (Zero Crossing Rate): ${readings.zcr || "N/A"}

Model Summary:
${modelSummary || "No summary available"}

Write a concise medical report with:
1. Overall stress status
2. Key physiological observations
3. Possible causes or risk notes (non-diagnostic)
4. Recommended immediate actions
5. Notes for mission control

Use clear headings and short paragraphs.`.trim();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text();
  } catch (err) {
    console.warn("Gemini API error, using fallback:", err.message || err);
    return generateFallbackReport(astronaut, readings, modelSummary);
  }
}

function generateFallbackReport(astronaut, readings, modelSummary) {
  return `MindMetric Stress Report (Fallback)

Astronaut: ${astronaut.name || "Unknown"}
Email: ${astronaut.email || "N/A"}

Latest Readings:
- Heart Rate: ${readings.heartRate || readings.heart_rate || "N/A"} bpm
- Temperature: ${readings.temp || "N/A"}°C
- RMS: ${readings.rms || "N/A"}
- ZCR: ${readings.zcr || "N/A"}

Model Summary:
${modelSummary || "No summary available"}

Status: Automated fallback report (AI service unavailable)

Recommended Actions:
- Review readings manually
- Contact mission control if elevated stress indicators present
- Monitor astronaut for next 24 hours

Note: Full AI-generated report unavailable due to API quota or connectivity issue.`;
}

module.exports = { generateStressReport };
