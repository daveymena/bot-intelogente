const aiService = require('../services/aiService');
const memoryService = require('../services/memoryService');
const productService = require('../services/productService');

module.exports = {
  async handle(clientId, intentData, message) {
    const products = await productService.getProductByIntent(intentData);
    const context = `Agente Técnico.
    Tus conocimientos sobre los productos son: ${JSON.stringify(products)}.
    El cliente busca especificaciones.
    Sé preciso y no inventes datos.`;
    

    // Detect technical level (simple heuristic or AI based)
    let techLevel = 'basic';
    if (message.includes('RAM') || message.includes('procesador') || message.includes('SSD')) {
        techLevel = 'intermediate';
    }
    if (message.includes('DDR5') || message.includes('benchmark') || message.includes('kernel')) {
        techLevel = 'advanced';
    }
    
    // Update client profile
    const clientService = require('../services/clientService'); 
    // Need to require clientService. It was not imported.
    await clientService.updateClient(clientId, { technical_level: techLevel });

    // Call AI
    const response = await aiService.callAI(context, {}, message);
    await memoryService.saveInteraction(clientId, intentData.intent, message, response, intentData.confidence);
    return response;
  }
};

