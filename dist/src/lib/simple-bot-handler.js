"use strict";
/**
 * 🔌 MANEJADOR SIMPLE DE MENSAJES
 * Integra el SimpleBotEngine con Baileys
 * Reemplaza todo el sistema complejo anterior
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleBotHandler = void 0;
const advanced_bot_engine_1 = require("./advanced-bot-engine");
const db_1 = require("./db");
class SimpleBotHandler {
    /**
     * Procesar mensaje entrante de WhatsApp
     */
    static async handleIncomingMessage(userId, customerPhone, message, sock) {
        try {
            console.log(`[SimpleBotHandler] 📨 Mensaje de ${customerPhone}: "${message}"`);
            // 1. Guardar mensaje en BD
            await this.saveMessage(userId, customerPhone, message, 'INCOMING');
            // 2. Procesar con el motor avanzado
            const response = await advanced_bot_engine_1.AdvancedBotEngine.processMessage(customerPhone, userId, message);
            // 3. Enviar respuesta
            await this.sendMessage(sock, customerPhone, response);
            // 4. Guardar respuesta en BD
            await this.saveMessage(userId, customerPhone, response, 'OUTGOING');
            console.log(`[SimpleBotHandler] ✅ Respuesta enviada`);
        }
        catch (error) {
            console.error('[SimpleBotHandler] ❌ Error:', error);
            // Respuesta de error
            const errorResponse = `Disculpa, tuve un problema técnico. ¿Puedes intentar de nuevo? 😊`;
            await this.sendMessage(sock, customerPhone, errorResponse);
        }
    }
    /**
     * Enviar mensaje por WhatsApp
     */
    static async sendMessage(sock, phone, message) {
        try {
            // Simular escritura (más humano)
            const typingTime = Math.min(message.length * 30, 3000); // Max 3 segundos
            await sock.sendPresenceUpdate('composing', phone);
            await new Promise(resolve => setTimeout(resolve, typingTime));
            await sock.sendPresenceUpdate('paused', phone);
            // Enviar mensaje
            await sock.sendMessage(phone, { text: message });
        }
        catch (error) {
            console.error('[SimpleBotHandler] Error enviando mensaje:', error);
            throw error;
        }
    }
    /**
     * Guardar mensaje en base de datos
     */
    static async saveMessage(userId, customerPhone, content, direction) {
        try {
            // Buscar o crear conversación
            let conversation = await db_1.db.conversation.findFirst({
                where: {
                    userId,
                    customerPhone,
                    status: 'ACTIVE'
                }
            });
            if (!conversation) {
                conversation = await db_1.db.conversation.create({
                    data: {
                        userId,
                        customerPhone,
                        customerName: customerPhone.split('@')[0],
                        status: 'ACTIVE'
                    }
                });
            }
            // Guardar mensaje
            await db_1.db.message.create({
                data: {
                    conversationId: conversation.id,
                    content,
                    direction
                }
            });
        }
        catch (error) {
            console.error('[SimpleBotHandler] Error guardando mensaje:', error);
            // No lanzar error, solo logear
        }
    }
    /**
     * Limpiar memoria de un chat
     */
    static clearChatMemory(customerPhone) {
        advanced_bot_engine_1.AdvancedBotEngine.clearMemory(customerPhone);
    }
    /**
     * Obtener estado de memoria (debugging)
     */
    static getMemoryState(customerPhone, userId) {
        return advanced_bot_engine_1.AdvancedBotEngine.getMemoryState(customerPhone, userId);
    }
}
exports.SimpleBotHandler = SimpleBotHandler;
