"use strict";
/**
 * 🛡️ SAFE BAILEYS SENDER
 * Wrapper seguro para enviar mensajes con protección anti-ban
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeBaileysSender = void 0;
const anti_ban_middleware_1 = require("./anti-ban-middleware");
class SafeBaileysSender {
    /**
     * Enviar mensaje de texto de forma segura
     */
    static async sendText(sock, options) {
        try {
            const { userId, recipient, message, forceHumanize = true } = options;
            // 1. Verificar rate limiting
            if (!anti_ban_middleware_1.AntiBanMiddleware.canSendMessage(userId)) {
                console.log(`⚠️ [SafeSender] Rate limit alcanzado para ${userId}`);
                return false;
            }
            // 2. Verificar spam
            if (anti_ban_middleware_1.AntiBanMiddleware.isSpam(userId, recipient, message)) {
                console.log(`⚠️ [SafeSender] Mensaje detectado como spam`);
                return false;
            }
            // 3. Delay humano
            await anti_ban_middleware_1.AntiBanMiddleware.humanDelay();
            // 4. Humanizar texto con variaciones inteligentes
            let finalMessage = message;
            if (forceHumanize) {
                // Obtener cuántas veces se ha enviado este mensaje
                const phraseKey = message.toLowerCase().replace(/[^\w\s]/g, '').substring(0, 50).trim();
                const phraseCount = anti_ban_middleware_1.AntiBanMiddleware['metrics'].get(userId)?.phraseUsage.get(phraseKey) || 0;
                // Usar variación según el número de veces enviado
                finalMessage = anti_ban_middleware_1.AntiBanMiddleware.generateMessageVariation(message, phraseCount);
            }
            // 5. Enviar mensaje
            await sock.sendMessage(recipient, { text: finalMessage });
            // 6. Registrar envío
            anti_ban_middleware_1.AntiBanMiddleware.recordMessage(userId, recipient, message);
            console.log(`✅ [SafeSender] Mensaje enviado a ${recipient}`);
            return true;
        }
        catch (error) {
            console.error(`❌ [SafeSender] Error enviando mensaje:`, error);
            return false;
        }
    }
    /**
     * Enviar media de forma segura
     */
    static async sendMedia(sock, options) {
        try {
            const { userId, recipient, message, mediaUrl, mediaType = 'image' } = options;
            if (!mediaUrl) {
                console.error(`❌ [SafeSender] Media URL requerida`);
                return false;
            }
            // 1. Verificar rate limiting
            if (!anti_ban_middleware_1.AntiBanMiddleware.canSendMessage(userId)) {
                console.log(`⚠️ [SafeSender] Rate limit alcanzado para ${userId}`);
                return false;
            }
            // 2. Delay humano extra para media
            await anti_ban_middleware_1.AntiBanMiddleware.mediaDelay();
            // 3. Enviar media según tipo
            const mediaMessage = {
                caption: message
            };
            switch (mediaType) {
                case 'image':
                    mediaMessage.image = { url: mediaUrl };
                    break;
                case 'video':
                    mediaMessage.video = { url: mediaUrl };
                    break;
                case 'audio':
                    mediaMessage.audio = { url: mediaUrl };
                    break;
                case 'document':
                    mediaMessage.document = { url: mediaUrl };
                    break;
            }
            await sock.sendMessage(recipient, mediaMessage);
            // 4. Registrar envío
            anti_ban_middleware_1.AntiBanMiddleware.recordMessage(userId, recipient, `[MEDIA] ${message}`);
            console.log(`✅ [SafeSender] Media enviada a ${recipient}`);
            return true;
        }
        catch (error) {
            console.error(`❌ [SafeSender] Error enviando media:`, error);
            return false;
        }
    }
    /**
     * Enviar múltiples mensajes de forma segura (con delays)
     */
    static async sendBatch(sock, userId, messages) {
        let successCount = 0;
        for (const msg of messages) {
            const success = await this.sendText(sock, {
                userId,
                recipient: msg.recipient,
                message: msg.message
            });
            if (success) {
                successCount++;
            }
            else {
                // Si falla, esperar más tiempo antes del siguiente
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            // Delay entre mensajes del batch
            await anti_ban_middleware_1.AntiBanMiddleware.humanDelay();
        }
        return successCount;
    }
    /**
     * Verificar si es seguro enviar mensaje
     */
    static canSend(userId, recipient, message) {
        return anti_ban_middleware_1.AntiBanMiddleware.canSendMessage(userId) &&
            !anti_ban_middleware_1.AntiBanMiddleware.isSpam(userId, recipient, message);
    }
    /**
     * Obtener estadísticas de envío
     */
    static getStats(userId) {
        return anti_ban_middleware_1.AntiBanMiddleware.getStats(userId);
    }
    /**
     * Resetear límites de usuario
     */
    static resetLimits(userId) {
        anti_ban_middleware_1.AntiBanMiddleware.resetMetrics(userId);
    }
}
exports.SafeBaileysSender = SafeBaileysSender;
