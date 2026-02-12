const productService = require('../services/productService');
const clientService = require('../services/clientService');
const aiService = require('../services/aiService');
const memoryService = require('../services/memoryService');
const salesPrompt = require('../prompts/salesPrompt');

const calculateScore = (intent, message) => {
    let score = 0;
    if (intent === 'consulta_precio') score += 10;
    if (message.toLowerCase().includes('disponible')) score += 15;
    if (message.toLowerCase().includes('presupuesto') || intent === 'referencia_presupuesto') score += 20;
    if (intent === 'metodo_pago' || message.toLowerCase().includes('pago')) score += 30;
    return score;
};

module.exports = {
    async handle(clientId, intentData, message) {
        const intent = intentData.intent;
        try {
            // Get Client
            let client = await clientService.getClient(clientId); // assuming clientId is phone for now, user schema says ID is UUID
            // Wait, flow is whatsapp -> router -> agent selector. Router likely identifies client via phone.
            // Assuming router passes the client object or ID.
            // Let's assume clientId IS the UUID.

            // Get Context
            const history = await memoryService.getClientContext(clientId);
            
            // Get Products
            const products = await productService.getProductByIntent(intentData);
            
            // Build Prompt
            const context = salesPrompt.getContext(products, { history: history.history, clientData: client });
            const prompt = salesPrompt.getSystemPrompt(client.name, "laptop hp", client.lead_status); // Mock recent product

            // AI Call
            const response = await aiService.callAI(prompt, context, message);

            // Update Score
            const score = calculateScore(intent, message);
            if (score > 0) {
               const updated = await clientService.updateProbability(clientId, score);
               if (updated.purchase_probability > 70) {
                   // Mark as HOT
                   console.log(`CLIENT ${clientId} IS HOT LEAD!`);
                   // Maybe update lead_status
               }
            }

            // Save Memory
            await memoryService.saveInteraction(clientId, intent, message, response, intentData.confidence);

            return response;

        } catch (e) {
            console.error("Sales Agent Error", e);
            return "Lo siento, tuve un problema procesando tu solicitud.";
        }
    }
}
