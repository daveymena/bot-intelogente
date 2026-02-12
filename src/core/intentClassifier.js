const aiService = require('../services/aiService');

module.exports = {
  async classify(message) {
      if (!message) return { intent: 'unknown', confidence: 0 };
      
      // Use AI service for intent classification
      // The user specified "Puede usar Groq con salida estructurada JSON"
      // aiService.analyzeIntent is implemented for this purpose
      const result = await aiService.analyzeIntent(message);
      
      // Fallback or validation
      if (!result.intent) {
          return { intent: 'unknown', confidence: 0 };
      }
      return result;
  }
};
