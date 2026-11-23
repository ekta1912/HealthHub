const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_INSTRUCTION =
  "You are Dr. AI, a compassionate and experienced clinical doctor for HealthHub. " +
  "Speak plainly without medical jargon, emojis, or heavy markdown. Keep responses to 1-3 short, clear sentences. " +
  "STRICT PROTOCOL: Ask at most 1 or 2 concise diagnostic questions to understand the patient's symptoms. " +
  "Once sufficient context is provided, STOP asking questions. Deliver a clear practical health solution, " +
  "recommended over-the-counter medicine or home remedy, and dosage advice. " +
  "Always include: 'If symptoms persist or worsen, please schedule a clinic consultation or visit an emergency room.'";

// Fallback smart clinical heuristics when external Gemini API is unreachable or unconfigured
const CLINICAL_KNOWLEDGE_BASE = [
  {
    triggers: ["fever", "temperature", "bukhar", "pyrexia", "chills", "shivering"],
    reply: "For mild to moderate fever, rest adequately and stay hydrated. You may take Paracetamol 500mg or 650mg every 6 to 8 hours after meals. If the temperature exceeds 102 F or lasts more than 3 days, please see a physician promptly.",
  },
  {
    triggers: ["headache", "migraine", "sar dard", "temple pain", "throbbing head"],
    reply: "Rest in a quiet, dark room and ensure you are well hydrated. Mild headaches often respond well to Paracetamol or Ibuprofen 400mg taken with food. Seek urgent medical care if accompanied by sudden neck stiffness or visual aura.",
  },
  {
    triggers: ["cough", "cold", "sore throat", "khasi", "gala", "flu", "runny nose"],
    reply: "Warm saline gargles three times daily and steam inhalation can significantly soothe your throat. Warm honey-ginger water or an OTC lozenge provides effective relief. If you develop chest congestion or breathing difficulty, consult a doctor immediately.",
  },
  {
    triggers: ["stomach pain", "acidity", "gas", "pet dard", "nausea", "vomiting", "indigestion", "heartburn"],
    reply: "Avoid spicy, oily foods and drink plenty of warm water or electolytes. For acidity or mild reflux, an antacid syrup or Pantoprazole 40mg before breakfast is commonly helpful. Consult a specialist if the pain is acute or localized to the lower right abdomen.",
  },
  {
    triggers: ["bp", "blood pressure", "hypertension", "dizziness", "chakkar"],
    reply: "If feeling dizzy or weak, sit or lie down immediately and sip an ORS electrolyte solution. Regularly track your blood pressure morning and evening. Please do not alter or stop prescribed cardiac medications without consulting your cardiologist.",
  },
  {
    triggers: ["chest pain", "can't breathe", "cannot breathe", "severe bleeding", "unconscious", "heart attack", "stroke"],
    reply: "URGENT WARNING: Your symptoms indicate a potential medical emergency. Please call local emergency services immediately or proceed to the nearest emergency hospital department.",
  },
];

const chatWithDoctorAI = async (req, res, next) => {
  try {
    const { chatHistory, message: userPrompt } = req.body;

    let promptText = "";
    if (typeof userPrompt === "string" && userPrompt.trim()) {
      promptText = userPrompt.trim();
    } else if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      const lastItem = chatHistory[chatHistory.length - 1];
      if (typeof lastItem === "string") {
        promptText = lastItem;
      } else if (lastItem.text) {
        promptText = lastItem.text;
      } else if (lastItem.parts && lastItem.parts[0]?.text) {
        promptText = lastItem.parts[0].text;
      }
    }

    if (!promptText) {
      return res.status(400).json({
        success: false,
        message: "Message or chat history cannot be empty",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Check emergency keywords first
    const lower = promptText.toLowerCase();
    const isEmergency = ["chest pain", "difficulty breathing", "severe bleeding", "heart attack", "stroke"].some((w) =>
      lower.includes(w)
    );
    if (isEmergency) {
      return res.status(200).json({
        success: true,
        reply: "EMERGENCY: These symptoms require immediate medical attention. Please call emergency services or visit the nearest hospital emergency room without delay.",
      });
    }

    // Try Gemini API if key is present
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelNames = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"];

        for (const modelName of modelNames) {
          try {
            const model = genAI.getGenerativeModel({
              model: modelName,
              systemInstruction: SYSTEM_INSTRUCTION,
            });

            // Format previous conversation context if available
            const result = await model.generateContent(promptText);
            const response = await result.response;
            const replyText = response.text();

            if (replyText) {
              return res.status(200).json({
                success: true,
                reply: replyText.trim(),
                source: "gemini",
              });
            }
          } catch (modelError) {
            console.warn(`Gemini model ${modelName} failed, trying next:`, modelError.message);
          }
        }
      } catch (geminiError) {
        console.warn("Gemini service initialization failed, falling back to clinical engine:", geminiError.message);
      }
    }

    // Smart clinical heuristics fallback
    for (const entry of CLINICAL_KNOWLEDGE_BASE) {
      if (entry.triggers.some((t) => lower.includes(t))) {
        return res.status(200).json({
          success: true,
          reply: entry.reply,
          source: "clinical_engine",
        });
      }
    }

    // Default conversational reply
    res.status(200).json({
      success: true,
      reply:
        "Hello, I am Dr. AI. Could you tell me more about your specific symptoms, how long you have felt this way, and whether you are experiencing any fever or pain?",
      source: "clinical_engine",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithDoctorAI,
};
