const aiService = require('../services/aiService');
const memoryService = require('../services/memoryService');

module.exports = {
  async handle(clientId, intentData, message) {
    const context = `Soporte Técnico.
    El cliente tiene un problema con un producto.
    Ayúdale a resolverlo o escala a un agente humano si es necesario.
    `;
    const response = await aiService.callAI(context, {}, message);
    await memoryService.saveInteraction(clientId, intentData.intent, message, response, intentData.confidence);
    return response;
  }
};
