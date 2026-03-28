require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

let ai;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.log("Failed to initialize GoogleGenAI", e);
}

const chatInteraction = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      // Mock response if no API key is present
      const mockResponses = [
        "I understand. Can you tell me how long you've been experiencing these symptoms?",
        "Are there any other symptoms you've noticed recently, like fever, fatigue, or pain?",
        "On a scale of 1 to 10, how severe would you rate your discomfort?",
        "Thank you for sharing. Based on what you've described, it sounds like it could be a common viral issue or fatigue, but I highly recommend monitoring it. Please consult a doctor if it gets worse."
      ];
      
      const isIntro = !history || history.length === 0;
      let replyText = isIntro ? 
        "Hello! I am the OmniGen AI symptom checker. I see you're not feeling well. To help identify the problem, could you describe your main symptoms?" 
        : mockResponses[Math.floor(Math.random() * mockResponses.length)];
        
      if (!isIntro) {
         replyText = "[Mock Mode - Set GEMINI_API_KEY in backend/.env to enable real AI] " + replyText;
      }

      return res.json({ reply: replyText });
    }

    const formattedHistory = history ? history.map(h => ({
      role: h.role, // 'user' or 'model'
      parts: [{ text: h.text }]
    })) : [];

    // Using Gemini 2.5 Flash as standard fast model
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            ...formattedHistory,
            { role: 'user', parts: [{ text: message }] }
        ],
        config: {
            systemInstruction: "You are an AI medical symptom checker assistant for OmniGen AI. Your goal is to help patients investigate their problem by asking clarifying questions about their symptoms. Keep responses concise, professional, empathetic. Ask only 1 or 2 clear questions at a time. Remind them you are an AI, not a doctor. Eventually, summarize their likely condition and advise consulting a healthcare professional."
        }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Chat AI error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
};

const dashboardAiInteraction = async (req, res) => {
  try {
    const { actionType, dataPayload } = req.body;

    if (!process.env.GEMINI_API_KEY) {
       return res.json({ reply: `[MOCK AI] Processed ${actionType}. Please configure GEMINI_API_KEY inside backend/.env to enable full analysis.` });
    }

    let sysInstruction = "You are an expert bioinformatician analyzing drug candidate data.";
    let promptText = "";

    if (actionType === 'discovery_assistant') {
      sysInstruction = "You are an AI Drug Discovery Assistant. Your goal is to analyze the provided JSON candidate data. Identify the top 2-3 most promising candidates based on explicitly high predicted efficacy and explicitly low predicted toxicity. Format your response elegantly using markdown, showing 'Top Candidates', why you chose them, and what 'Next Steps' should be taken. Keep it crisp, analytical, and professional.";
      promptText = `Here is the filtered cohort data: ${JSON.stringify(dataPayload)}`;
    } else if (actionType === 'strategic_summary') {
      sysInstruction = "You are an AI Strategic Lead for a pharmaceutical cohort. Provide a comprehensive summary of the attached candidate cohort. Focus on trends (e.g. are viabilities generally high or low?), overall risk factors, outliers with extreme values, and give a summary recommendation. Be analytical and professional.";
      promptText = `Please critically analyze this dataset: ${JSON.stringify(dataPayload)}`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [ { role: 'user', parts: [{ text: promptText }] } ],
        config: { systemInstruction: sysInstruction }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Dashboard AI error:', error);
    res.status(500).json({ error: 'Failed to process dashboard request' });
  }
};

module.exports = {
  chatInteraction,
  dashboardAiInteraction
};
