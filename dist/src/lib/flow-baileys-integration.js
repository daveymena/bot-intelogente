"use strict";
/**
 * Integración opcional del FlowEngine con Baileys
 * Este módulo puede reemplazar el sistema clean-bot cuando se active
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowBaileysIntegration = void 0;
exports.handleMessageWithFlowEngine = handleMessageWithFlowEngine;
const flow_integration_1 = require("./flow-integration");
const db_1 = require("./db");
class FlowBaileysIntegration {
    /**
     * Procesa un mensaje usando el FlowEngine en lugar del clean-bot
     */
    static async handleMessageWithFlow(params) {
        const { sock, userId, from, messageText, conversationId } = params;
        console.log('[FlowBaileys] 🎯 Procesando mensaje con FlowEngine');
        try {
            // Obtener nombre del usuario si está disponible
            const userName = await this.getUserName(from, sock);
            // Procesar con FlowEngine
            const result = await flow_integration_1.FlowIntegration.processMessage({
                sock,
                chatId: from,
                userName,
                text: messageText
            });
            console.log(`[FlowBaileys] ✅ ${result.responsesCount} respuestas enviadas`);
            // Guardar respuestas en la base de datos
            const session = flow_integration_1.FlowIntegration.getSession(from);
            const lastBotMessage = session.history
                .filter(h => h.from === 'bot')
                .pop();
            if (lastBotMessage) {
                await db_1.db.message.create({
                    data: {
                        conversationId,
                        content: lastBotMessage.text,
                        direction: 'OUTGOING',
                        type: 'TEXT'
                    }
                });
            }
            // Actualizar conversación
            await db_1.db.conversation.update({
                where: { id: conversationId },
                data: {
                    lastMessageAt: new Date(),
                    productId: session.context.product?.id || undefined
                }
            });
            return {
                success: true,
                responsesCount: result.responsesCount,
                productId: session.context.product?.id
            };
        }
        catch (error) {
            console.error('[FlowBaileys] ❌ Error procesando mensaje:', error);
            // Fallback a mensaje de error
            await sock.sendMessage(from, {
                text: 'Disculpa, tuve un problema procesando tu mensaje. Por favor intenta de nuevo.'
            });
            return {
                success: false,
                error
            };
        }
    }
    /**
     * Obtiene el nombre del usuario desde WhatsApp
     */
    static async getUserName(jid, sock) {
        try {
            // Intentar obtener el nombre del contacto desde el store
            const pushName = sock.user?.name;
            if (pushName)
                return pushName;
            // Extraer número de teléfono como fallback
            const phoneNumber = jid.split('@')[0];
            return phoneNumber;
        }
        catch (error) {
            console.error('[FlowBaileys] Error obteniendo nombre de usuario:', error);
        }
        return undefined;
    }
    /**
     * Detecta si el mensaje es una intención de pago
     */
    static isPaymentIntent(text) {
        const paymentKeywords = [
            'pagar',
            'pago',
            'link',
            'enlace',
            'comprar',
            'mercado pago',
            'paypal',
            'nequi',
            'daviplata',
            'método de pago',
            'formas de pago'
        ];
        const normalized = text.toLowerCase();
        return paymentKeywords.some(keyword => normalized.includes(keyword));
    }
    /**
     * Obtiene estadísticas de la sesión
     */
    static getSessionStats(chatId) {
        const session = flow_integration_1.FlowIntegration.getSession(chatId);
        return {
            state: session.state,
            messageCount: session.history.length,
            hasProduct: !!session.context.product,
            hasOrder: !!session.context.order,
            paymentMethod: session.context.paymentMethod
        };
    }
}
exports.FlowBaileysIntegration = FlowBaileysIntegration;
/**
 * Función helper para activar el FlowEngine en lugar del clean-bot
 * Usar en baileys-stable-service.ts
 */
async function handleMessageWithFlowEngine(params) {
    return FlowBaileysIntegration.handleMessageWithFlow(params);
}
