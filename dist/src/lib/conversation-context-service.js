"use strict";
/**
 * 🧠 SERVICIO DE CONTEXTO DE CONVERSACIÓN MEJORADO
 * Mantiene memoria completa de la conversación para responder preguntas de seguimiento
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationContextService = void 0;
class ConversationContextService {
    /**
     * Guardar producto en el contexto de la conversación
     */
    static setProductContext(conversationKey, productId, productName, productDetails) {
        const existing = this.contexts.get(conversationKey);
        this.contexts.set(conversationKey, {
            lastProductId: productId,
            lastProductName: productName,
            lastMentionedAt: new Date(),
            messageCount: existing ? existing.messageCount + 1 : 1,
            lastIntent: existing?.lastIntent || 'product_search',
            lastAction: 'product_shown',
            conversationHistory: existing?.conversationHistory || [],
            productDetails,
            userPreferences: existing?.userPreferences
        });
        console.log(`[Context] 💾 Guardado en memoria: ${productName} para ${conversationKey}`);
    }
    /**
     * Agregar mensaje al historial de conversación
     */
    static addMessage(conversationKey, role, message, intent) {
        const context = this.contexts.get(conversationKey);
        if (!context)
            return;
        context.conversationHistory.push({
            role,
            message,
            intent,
            timestamp: new Date()
        });
        // Mantener solo los últimos 20 mensajes
        if (context.conversationHistory.length > 20) {
            context.conversationHistory = context.conversationHistory.slice(-20);
        }
        context.lastMentionedAt = new Date();
    }
    /**
     * Actualizar intención y acción actual
     */
    static updateIntent(conversationKey, intent, action) {
        const context = this.contexts.get(conversationKey);
        if (!context)
            return;
        context.lastIntent = intent;
        if (action)
            context.lastAction = action;
        context.lastMentionedAt = new Date();
    }
    /**
     * Guardar preferencias del usuario
     */
    static setUserPreference(conversationKey, key, value) {
        const context = this.contexts.get(conversationKey);
        if (!context)
            return;
        if (!context.userPreferences) {
            context.userPreferences = {};
        }
        context.userPreferences[key] = value;
        console.log(`[Context] 💡 Preferencia guardada: ${key} = ${value}`);
    }
    /**
     * Obtener producto del contexto de la conversación
     */
    static getProductContext(conversationKey) {
        const context = this.contexts.get(conversationKey);
        if (!context) {
            console.log(`[Context] ❌ No hay contexto para ${conversationKey}`);
            return null;
        }
        // Verificar si el contexto expiró
        const now = new Date().getTime();
        const lastMention = context.lastMentionedAt.getTime();
        const elapsed = now - lastMention;
        if (elapsed > this.CONTEXT_TIMEOUT) {
            console.log(`[Context] ⏰ Contexto expirado para ${conversationKey} (${Math.round(elapsed / 1000)}s)`);
            this.contexts.delete(conversationKey);
            return null;
        }
        console.log(`[Context] ✅ Contexto encontrado: ${context.lastProductName} (${context.messageCount} mensajes)`);
        return context;
    }
    /**
     * Limpiar contexto de una conversación
     */
    static clearContext(conversationKey) {
        this.contexts.delete(conversationKey);
        console.log(`[Context] 🗑️ Contexto limpiado para ${conversationKey}`);
    }
    /**
     * Actualizar contador de mensajes (sin cambiar producto)
     */
    static incrementMessageCount(conversationKey) {
        const context = this.contexts.get(conversationKey);
        if (context) {
            context.messageCount++;
            context.lastMentionedAt = new Date(); // Renovar tiempo
            console.log(`[Context] 🔄 Contexto renovado para ${conversationKey} (${context.messageCount} mensajes)`);
        }
    }
    /**
     * Renovar tiempo del contexto (mantener vivo)
     */
    static renewContext(conversationKey) {
        const context = this.contexts.get(conversationKey);
        if (context) {
            context.lastMentionedAt = new Date();
            console.log(`[Context] ⏰ Tiempo renovado para ${conversationKey}`);
        }
    }
    /**
     * Limpiar contextos expirados (mantenimiento)
     */
    static cleanExpiredContexts() {
        const now = new Date().getTime();
        let cleaned = 0;
        for (const [key, context] of Array.from(this.contexts.entries())) {
            const elapsed = now - context.lastMentionedAt.getTime();
            if (elapsed > this.CONTEXT_TIMEOUT) {
                this.contexts.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log(`[Context] 🧹 Limpiados ${cleaned} contextos expirados`);
        }
    }
    /**
     * Obtener estadísticas de contextos activos
     */
    static getStats() {
        const contexts = Array.from(this.contexts.entries()).map(([key, ctx]) => ({
            key,
            product: ctx.lastProductName,
            messages: ctx.messageCount
        }));
        return {
            total: contexts.length,
            contexts
        };
    }
}
exports.ConversationContextService = ConversationContextService;
// Memoria en RAM (por conversación)
ConversationContextService.contexts = new Map();
// Tiempo máximo de memoria: 30 minutos (aumentado)
ConversationContextService.CONTEXT_TIMEOUT = 30 * 60 * 1000;
// Limpiar contextos expirados cada 5 minutos
setInterval(() => {
    ConversationContextService.cleanExpiredContexts();
}, 5 * 60 * 1000);
