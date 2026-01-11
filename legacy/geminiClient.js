const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateStressReport({
  astronaut = {},
  readings = {},
  modelSummary = "",
}) {
  if (!process.env.GEMINI_API_KEY) {
    // Fallback: return a simple stub when no API key is available
    return `Stress report stub for ${
      astronaut.name || astronaut.id || "unknown"
    }\n\nSummary: ${modelSummary || "N/A"}`;
  }

  const prompt = `
You are generating a medical-style stress status report for an astronaut.

Astronaut:
- ID: ${astronaut.id}
- Name: ${astronaut.name}
- Age: ${astronaut.age || "N/A"}

Latest readings:
- Heart rate: ${readings.heartRate || "N/A"}
- HRV: ${readings.hrv || "N/A"}
- SpO2: ${readings.spo2 || "N/A"}
- Timestamp: ${readings.timestamp || new Date().toISOString()}

Model summary:
${modelSummary}

Write a concise report with:
1. Overall stress status.
2. Key physiological observations.
3. Possible causes or risk notes (non-diagnostic).
4. Recommended immediate actions for astronaut.
5. Recommended notes for mission control.

Use clear headings and short paragraphs.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text();
  } catch (err) {
    console.warn(
      "Gemini API error (quota/network), using fallback report:",
      err.message || err
    );
    return `MindMetric Stress Report (Fallback)
    
Astronaut: ${astronaut.name || astronaut.id || "Unknown"}
ID: ${astronaut.id || "N/A"}

Latest Readings:
- Heart Rate: ${readings.heartRate || "N/A"} bpm
- HRV: ${readings.hrv || "N/A"}
- SpO2: ${readings.spo2 || "N/A"}%
- Timestamp: ${readings.timestamp || new Date().toISOString()}

Model Summary:
${modelSummary || "No summary available"}

Status: Automated fallback report (AI service unavailable)

Recommended Actions:
- Review readings manually
- Contact mission control if elevated stress indicators present
- Monitor astronaut for next 24 hours

Note: Full AI-generated report unavailable due to API quota or connectivity issue.`;
  }
}

module.exports = { generateStressReport };
