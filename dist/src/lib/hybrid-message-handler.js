"use strict";
/**
 * 💬 HANDLER DE MENSAJES CON SISTEMA HÍBRIDO
 * Procesa todos los mensajes de WhatsApp con inteligencia
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridMessageHandler = void 0;
const bot_hybrid_integration_1 = require("./bot-hybrid-integration");
const db_1 = require("./db");
class HybridMessageHandler {
    constructor(groqApiKey) {
        this.botIntegration = new bot_hybrid_integration_1.BotHybridIntegration(groqApiKey);
    }
    /**
     * Procesar mensaje entrante de WhatsApp
     */
    async handleIncomingMessage(message, from, userId) {
        try {
            console.log(`📨 Mensaje de ${from}: "${message}"`);
            // Procesar con sistema híbrido
            const response = await this.botIntegration.processMessage(message, from, userId);
            console.log(`💬 Respuesta: "${response.substring(0, 100)}..."`);
            // Guardar en base de datos
            await this.saveMessage(userId, from, message, response);
            return response;
        }
        catch (error) {
            console.error('❌ Error en handler:', error);
            return '😅 Disculpa, tuve un problema. ¿Puedes intentar de nuevo?';
        }
    }
    /**
     * Guardar mensaje en base de datos
     */
    async saveMessage(userId, from, userMessage, botResponse) {
        try {
            await db_1.db.message.create({
                data: {
                    userId,
                    from,
                    content: userMessage,
                    response: botResponse,
                    timestamp: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error guardando mensaje:', error);
        }
    }
    /**
     * Cambiar modo de IA
     */
    setAIMode(enabled) {
        this.botIntegration.setAIMode(enabled);
    }
}
exports.HybridMessageHandler = HybridMessageHandler;
