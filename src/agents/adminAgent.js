const aiService = require('../services/aiService');
const memoryService = require('../services/memoryService');

module.exports = {
  async handle(clientId, intentData, message) {
     const context = `Agente Administrativo.
     Manejas facturación y temas administrativos.
     Si no puedes resolver, crea un ticket de soporte a soporte@empresa.com.`;

     const response = await aiService.callAI(context, {}, message);
     await memoryService.saveInteraction(clientId, intentData.intent, message, response, intentData.confidence);
     return response;
  }
};
