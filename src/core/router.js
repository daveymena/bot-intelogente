const intentClassifier = require('./intentClassifier');
const agentSelector = require('./agentSelector');
const clientService = require('../services/clientService');
const logger = require('../utils/logger');
const sanitizer = require('../utils/sanitizer');

module.exports = {
  async handleMessage(phone, rawMessage) {
      if (!rawMessage) return null;
      
      const message = sanitizer.sanitizeText(rawMessage);
      const sanitizedPhone = sanitizer.sanitizePhone(phone);
      
      logger.info(`Received message from ${sanitizedPhone}: ${message}`);

      try {
          // Get or create client
          let client = await clientService.getClient(sanitizedPhone);
          if (!client) {
              client = await clientService.createClient({ phone: sanitizedPhone, name: 'Lead ' + sanitizedPhone });
          }
          
          // Classify Intent
          const intentResult = await intentClassifier.classify(message);
          logger.info(`Intent detected: ${intentResult.intent} (${intentResult.confidence})`);
          
          // Select Agent
          const agent = agentSelector.select(intentResult.intent);
          
          // Execute Agent
          const response = await agent.handle(client.id, intentResult, message);
          
          return response;
      } catch (e) {
          logger.error('Router Error:', e);
          return "Lo siento, estoy teniendo dificultades técnicas en este momento.";
      }
  }
};
