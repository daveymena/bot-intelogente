const config = require('../config/env');
const groq = require('../integrations/groq');
const openclaw = require('../integrations/openclaw');

const callAI = async (systemPrompt, context, userMessage) => {
  switch (config.AI.PROVIDER.toLowerCase()) {
    case 'groq':
      return groq.callGroq(systemPrompt, context, userMessage);
    case 'openclaw':
      return openclaw.callOpenClaw(systemPrompt, context, userMessage);
    default:
      console.warn(`Provider ${config.AI.PROVIDER} not found, defaulting to Groq`);
      return groq.callGroq(systemPrompt, context, userMessage);
  }
};

module.exports = {
  callAI,
  analyzeIntent: groq.analyzeIntent // Use Groq for intent analysis as requested "Puede usar Groq con salida estructurada JSON."
};
