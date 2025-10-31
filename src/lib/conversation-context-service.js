"use strict";
/**
 * 🧠 SERVICIO DE CONTEXTO DE CONVERSACIÓN
 * Mantiene memoria del último producto mencionado por conversación
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationContextService = void 0;
var ConversationContextService = /** @class */ (function () {
    function ConversationContextService() {
    }
    /**
     * Guardar producto en el contexto de la conversación
     */
    ConversationContextService.setProductContext = function (conversationKey, productId, productName) {
        var existing = this.contexts.get(conversationKey);
        this.contexts.set(conversationKey, {
            lastProductId: productId,
            lastProductName: productName,
            lastMentionedAt: new Date(),
            messageCount: existing ? existing.messageCount + 1 : 1
        });
        console.log("[Context] \uD83D\uDCBE Guardado en memoria: ".concat(productName, " para ").concat(conversationKey));
    };
    /**
     * Obtener producto del contexto de la conversación
     */
    ConversationContextService.getProductContext = function (conversationKey) {
        var context = this.contexts.get(conversationKey);
        if (!context) {
            console.log("[Context] \u274C No hay contexto para ".concat(conversationKey));
            return null;
        }
        // Verificar si el contexto expiró
        var now = new Date().getTime();
        var lastMention = context.lastMentionedAt.getTime();
        var elapsed = now - lastMention;
        if (elapsed > this.CONTEXT_TIMEOUT) {
            console.log("[Context] \u23F0 Contexto expirado para ".concat(conversationKey, " (").concat(Math.round(elapsed / 1000), "s)"));
            this.contexts.delete(conversationKey);
            return null;
        }
        console.log("[Context] \u2705 Contexto encontrado: ".concat(context.lastProductName, " (").concat(context.messageCount, " mensajes)"));
        return context;
    };
    /**
     * Limpiar contexto de una conversación
     */
    ConversationContextService.clearContext = function (conversationKey) {
        this.contexts.delete(conversationKey);
        console.log("[Context] \uD83D\uDDD1\uFE0F Contexto limpiado para ".concat(conversationKey));
    };
    /**
     * Actualizar contador de mensajes (sin cambiar producto)
     */
    ConversationContextService.incrementMessageCount = function (conversationKey) {
        var context = this.contexts.get(conversationKey);
        if (context) {
            context.messageCount++;
            context.lastMentionedAt = new Date(); // Renovar tiempo
        }
    };
    /**
     * Limpiar contextos expirados (mantenimiento)
     */
    ConversationContextService.cleanExpiredContexts = function () {
        var now = new Date().getTime();
        var cleaned = 0;
        for (var _i = 0, _a = this.contexts.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], context = _b[1];
            var elapsed = now - context.lastMentionedAt.getTime();
            if (elapsed > this.CONTEXT_TIMEOUT) {
                this.contexts.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log("[Context] \uD83E\uDDF9 Limpiados ".concat(cleaned, " contextos expirados"));
        }
    };
    /**
     * Obtener estadísticas de contextos activos
     */
    ConversationContextService.getStats = function () {
        var contexts = Array.from(this.contexts.entries()).map(function (_a) {
            var key = _a[0], ctx = _a[1];
            return ({
                key: key,
                product: ctx.lastProductName,
                messages: ctx.messageCount
            });
        });
        return {
            total: contexts.length,
            contexts: contexts
        };
    };
    // Memoria en RAM (por conversación)
    ConversationContextService.contexts = new Map();
    // Tiempo máximo de memoria: 10 minutos
    ConversationContextService.CONTEXT_TIMEOUT = 10 * 60 * 1000;
    return ConversationContextService;
}());
exports.ConversationContextService = ConversationContextService;
// Limpiar contextos expirados cada 5 minutos
setInterval(function () {
    ConversationContextService.cleanExpiredContexts();
}, 5 * 60 * 1000);
