"use strict";
/**
 * 🛡️ ANTI-BAN MIDDLEWARE PARA BAILEYS
 * Protege contra bloqueos de WhatsApp implementando comportamiento humano
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiBanMiddleware = void 0;
const message_variation_service_1 = require("./message-variation-service");
class AntiBanMiddleware {
    /**
     * Delay humano aleatorio
     */
    static async humanDelay() {
        const delay = this.MIN_DELAY_MS + Math.random() * (this.MAX_DELAY_MS - this.MIN_DELAY_MS);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    /**
     * Delay extra para archivos multimedia
     */
    static async mediaDelay() {
        const delay = 2000 + Math.random() * 1500; // 2-3.5 segundos
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    /**
     * Verificar si se puede enviar mensaje (rate limiting)
     */
    static canSendMessage(userId) {
        const metrics = this.getMetrics(userId);
        const now = Date.now();
        // Resetear contador si pasó el período de cooldown
        if (now - metrics.lastMessageTime > this.COOLDOWN_PERIOD_MS) {
            metrics.messageCount = 0;
        }
        // Verificar límite de mensajes por minuto
        if (metrics.messageCount >= this.MAX_MESSAGES_PER_MINUTE) {
            console.log(`⚠️ [AntiBan] Usuario ${userId} alcanzó límite de mensajes/minuto`);
            return false;
        }
        return true;
    }
    /**
     * Registrar mensaje enviado
     */
    static recordMessage(userId, recipient, messageText) {
        const metrics = this.getMetrics(userId);
        const now = Date.now();
        // Actualizar contador de mensajes
        metrics.messageCount++;
        metrics.lastMessageTime = now;
        // Registrar destinatario
        const recipientCount = metrics.recipientHistory.get(recipient) || 0;
        metrics.recipientHistory.set(recipient, recipientCount + 1);
        // Registrar uso de frase
        const phraseKey = this.getPhraseKey(messageText);
        const phraseCount = metrics.phraseUsage.get(phraseKey) || 0;
        metrics.phraseUsage.set(phraseKey, phraseCount + 1);
        // Limpiar historial antiguo (mantener solo últimos 100 registros)
        if (metrics.recipientHistory.size > 100) {
            const firstKey = metrics.recipientHistory.keys().next().value;
            metrics.recipientHistory.delete(firstKey);
        }
    }
    /**
     * Verificar si un mensaje es spam
     */
    static isSpam(userId, recipient, messageText) {
        const metrics = this.getMetrics(userId);
        // Verificar si se envió el mismo mensaje muchas veces
        const phraseKey = this.getPhraseKey(messageText);
        const phraseCount = metrics.phraseUsage.get(phraseKey) || 0;
        if (phraseCount >= this.MAX_SAME_PHRASE_COUNT) {
            console.log(`⚠️ [AntiBan] Frase repetida detectada: "${phraseKey.substring(0, 30)}..."`);
            return true;
        }
        // Verificar si se envió muchos mensajes al mismo destinatario
        const recipientCount = metrics.recipientHistory.get(recipient) || 0;
        if (recipientCount > 10) {
            console.log(`⚠️ [AntiBan] Muchos mensajes al mismo destinatario: ${recipient}`);
            return true;
        }
        return false;
    }
    /**
     * 🎭 Humanizar texto de forma inteligente (agregar variaciones)
     */
    static humanizeText(text) {
        let humanized = text;
        // 1. Variaciones de inicio (10% de probabilidad)
        if (Math.random() > 0.9) {
            const starters = [
                'Hola! ',
                'Hey! ',
                'Claro! ',
                'Por supuesto! ',
                'Perfecto! ',
                'Genial! ',
                'Excelente! ',
                '¡Claro que sí! ',
            ];
            humanized = starters[Math.floor(Math.random() * starters.length)] + humanized;
        }
        // 2. Variaciones de emojis al final (40% de probabilidad)
        if (Math.random() > 0.6) {
            const emojis = [
                ' 😊',
                ' 👍',
                ' ✅',
                ' 🙌',
                ' 💪',
                ' 🎉',
                ' ✨',
                ' 👌',
                ' 😄',
                ' 🤝',
            ];
            humanized += emojis[Math.floor(Math.random() * emojis.length)];
        }
        // 3. Variaciones de puntuación (30% de probabilidad)
        if (Math.random() > 0.7) {
            // Agregar puntos suspensivos
            humanized = humanized.replace(/\./g, '...');
        }
        else if (Math.random() > 0.8) {
            // Agregar signos de exclamación
            humanized = humanized.replace(/\./g, '!');
        }
        // 4. Variaciones de palabras comunes (20% de probabilidad)
        if (Math.random() > 0.8) {
            const replacements = {
                'hola': ['hola', 'hey', 'qué tal', 'buenas'],
                'gracias': ['gracias', 'muchas gracias', 'te agradezco', 'mil gracias'],
                'sí': ['sí', 'claro', 'por supuesto', 'exacto', 'correcto'],
                'no': ['no', 'nop', 'negativo', 'no exactamente'],
                'bien': ['bien', 'genial', 'perfecto', 'excelente', 'muy bien'],
                'ok': ['ok', 'vale', 'entendido', 'perfecto', 'listo'],
            };
            for (const [word, variations] of Object.entries(replacements)) {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                if (regex.test(humanized)) {
                    const replacement = variations[Math.floor(Math.random() * variations.length)];
                    humanized = humanized.replace(regex, replacement);
                    break; // Solo reemplazar una palabra por mensaje
                }
            }
        }
        // 5. Agregar espacios naturales (10% de probabilidad)
        if (Math.random() > 0.9) {
            humanized = humanized.replace(/([.!?])/g, '$1 ');
        }
        // 6. Variaciones de mayúsculas/minúsculas en palabras clave (5% de probabilidad)
        if (Math.random() > 0.95) {
            // Capitalizar primera letra de cada oración
            humanized = humanized.replace(/(^\w|\.\s+\w)/g, (match) => match.toUpperCase());
        }
        return humanized.trim();
    }
    /**
     * 🎨 Generar variación de mensaje completo (para mensajes repetidos)
     */
    static generateMessageVariation(originalMessage, variationIndex = 0) {
        // Usar el servicio avanzado de variaciones
        return message_variation_service_1.MessageVariationService.generateCompleteVariation(originalMessage, variationIndex);
    }
    /**
     * Verificar si debe esperar antes de reconectar
     */
    static shouldWaitBeforeReconnect(userId, disconnectCount) {
        if (disconnectCount >= 3) {
            console.log(`⚠️ [AntiBan] Usuario ${userId} desconectado ${disconnectCount} veces, esperando...`);
            return true;
        }
        return false;
    }
    /**
     * Obtener delay de reconexión (exponencial backoff)
     */
    static getReconnectDelay(disconnectCount) {
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 60s
        const delay = Math.min(1000 * Math.pow(2, disconnectCount), 60000);
        return delay + Math.random() * 1000; // Agregar variación aleatoria
    }
    /**
     * Limpiar métricas antiguas
     */
    static cleanupMetrics() {
        const now = Date.now();
        const CLEANUP_THRESHOLD = 3600000; // 1 hora
        for (const [userId, metrics] of this.metrics.entries()) {
            if (now - metrics.lastMessageTime > CLEANUP_THRESHOLD) {
                this.metrics.delete(userId);
            }
        }
    }
    /**
     * Obtener métricas de usuario
     */
    static getMetrics(userId) {
        if (!this.metrics.has(userId)) {
            this.metrics.set(userId, {
                lastMessageTime: 0,
                messageCount: 0,
                recipientHistory: new Map(),
                phraseUsage: new Map()
            });
        }
        return this.metrics.get(userId);
    }
    /**
     * Obtener clave de frase (primeras 50 caracteres normalizados)
     */
    static getPhraseKey(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .substring(0, 50)
            .trim();
    }
    /**
     * Resetear métricas de usuario
     */
    static resetMetrics(userId) {
        this.metrics.delete(userId);
    }
    /**
     * Obtener estadísticas de usuario
     */
    static getStats(userId) {
        const metrics = this.getMetrics(userId);
        return {
            messageCount: metrics.messageCount,
            lastMessageTime: new Date(metrics.lastMessageTime).toISOString(),
            uniqueRecipients: metrics.recipientHistory.size,
            uniquePhrases: metrics.phraseUsage.size,
            canSendMessage: this.canSendMessage(userId)
        };
    }
}
exports.AntiBanMiddleware = AntiBanMiddleware;
AntiBanMiddleware.metrics = new Map();
AntiBanMiddleware.MAX_MESSAGES_PER_MINUTE = 15;
AntiBanMiddleware.MAX_SAME_PHRASE_COUNT = 3;
AntiBanMiddleware.MIN_DELAY_MS = 800;
AntiBanMiddleware.MAX_DELAY_MS = 2500;
AntiBanMiddleware.COOLDOWN_PERIOD_MS = 60000; // 1 minuto
// Limpiar métricas cada hora
setInterval(() => {
    AntiBanMiddleware.cleanupMetrics();
}, 3600000);
