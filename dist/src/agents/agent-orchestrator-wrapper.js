"use strict";
/**
 * 🤖 Wrapper del Orquestador de Agentes
 * Adapta el orquestador de agentes al formato esperado por Baileys
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOrchestrator = void 0;
const orchestrator_1 = require("./orchestrator");
const db_1 = require("@/lib/db");
class AgentOrchestrator {
    /**
     * Obtener instancia del orquestador
     */
    static getOrchestrator() {
        if (!this.orchestrator) {
            this.orchestrator = new orchestrator_1.Orchestrator();
            console.log('[AgentOrchestrator] ✅ Orquestador inicializado');
        }
        return this.orchestrator;
    }
    /**
     * Procesar mensaje con el sistema de agentes
     */
    static async processMessage(params) {
        const { message, userId, conversationId, customerPhone, history } = params;
        console.log('[AgentOrchestrator] 🤖 Procesando con agentes especializados');
        console.log(`[AgentOrchestrator] 📨 Mensaje: "${message.substring(0, 100)}"`);
        try {
            const orchestrator = this.getOrchestrator();
            // Crear chatId único para esta conversación
            const chatId = `${userId}:${customerPhone}`;
            // Procesar con el orquestador
            const response = await orchestrator.processMessage({
                chatId,
                userId,
                message,
                userName: undefined // Puedes obtenerlo de la conversación si lo tienes
            });
            console.log(`[AgentOrchestrator] ✅ Respuesta generada`);
            console.log(`[AgentOrchestrator] 🎯 Confianza: ${(response.confidence * 100).toFixed(0)}%`);
            // Verificar si hay producto en el contexto y debe enviar fotos
            let shouldSendPhotos = false;
            let photos = [];
            let productId;
            if (response.context?.currentProduct) {
                productId = response.context.currentProduct.id;
                // Obtener producto completo de la BD para las fotos
                const product = await db_1.db.product.findUnique({
                    where: { id: productId }
                });
                if (product && product.images && product.images.length > 0) {
                    // Detectar si debe enviar fotos
                    const photoKeywords = ['foto', 'imagen', 'ver', 'muestra', 'manda', 'envia', 'pasa'];
                    const needsPhoto = photoKeywords.some(kw => message.toLowerCase().includes(kw));
                    // O si es la primera vez que menciona el producto
                    const isFirstMention = history.filter(h => h.content.toLowerCase().includes(product.name.toLowerCase())).length <= 1;
                    if (needsPhoto || isFirstMention) {
                        shouldSendPhotos = true;
                        photos = product.images;
                        console.log(`[AgentOrchestrator] 📸 Debe enviar ${photos.length} foto(s) del producto`);
                    }
                }
            }
            // Convertir respuesta al formato esperado
            return {
                message: response.text,
                confidence: response.confidence,
                intent: response.context?.salesStage || 'general',
                shouldSendPhotos,
                photos,
                productId,
                agentUsed: response.nextAgent || 'orchestrator'
            };
        }
        catch (error) {
            console.error('[AgentOrchestrator] ❌ Error procesando mensaje:', error);
            // Fallback: respuesta genérica
            return {
                message: 'Disculpa, tuve un problema procesando tu mensaje. ¿Podrías intentar de nuevo? 🙏',
                confidence: 0.3,
                intent: 'error',
                shouldSendPhotos: false,
                photos: [],
                agentUsed: 'fallback'
            };
        }
    }
    /**
     * Limpiar memorias antiguas (ejecutar periódicamente)
     */
    static cleanOldMemories() {
        const orchestrator = this.getOrchestrator();
        orchestrator.cleanOldMemories();
        console.log('[AgentOrchestrator] 🧹 Memorias antiguas limpiadas');
    }
    /**
     * Obtener estadísticas
     */
    static getStats() {
        const orchestrator = this.getOrchestrator();
        return orchestrator.getStats();
    }
}
exports.AgentOrchestrator = AgentOrchestrator;
AgentOrchestrator.orchestrator = null;
