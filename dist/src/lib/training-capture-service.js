"use strict";
/**
 * 📝 SERVICIO DE CAPTURA DE DATOS DE ENTRENAMIENTO
 *
 * Captura automáticamente todas las interacciones para entrenar el modelo local
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingCaptureService = void 0;
const db_1 = require("./db");
class TrainingCaptureService {
    /**
     * Capturar interacción para entrenamiento
     */
    static async captureInteraction(userId, conversationId, userMessage, botResponse, context) {
        try {
            const trainingData = await db_1.db.trainingData.create({
                data: {
                    userId,
                    conversationId,
                    userMessage,
                    botResponse,
                    context: context?.historial || [],
                    productId: context?.productId,
                    productName: context?.productName,
                    category: context?.category || this.detectCategory(userMessage),
                    qualityScore: null, // Se evaluará después
                    wasSuccessful: null
                }
            });
            console.log(`[Training] ✅ Capturada: ${trainingData.id} (${trainingData.category})`);
            return trainingData.id;
        }
        catch (error) {
            console.error('[Training] ❌ Error capturando:', error);
            return null;
        }
    }
    /**
     * Detectar categoría automáticamente
     */
    static detectCategory(message) {
        const normalized = message.toLowerCase();
        // Consultas de productos
        if (/\b(busco|quiero|necesito|recomienda|tienes|hay)\b/.test(normalized)) {
            return 'consulta_producto';
        }
        // Proceso de pago
        if (/\b(pago|pagar|comprar|link|método|mercadopago|paypal|nequi)\b/.test(normalized)) {
            return 'proceso_pago';
        }
        // Solicitud de fotos
        if (/\b(foto|imagen|ver|muestra|envía)\b/.test(normalized)) {
            return 'solicitud_foto';
        }
        // Consulta de precio
        if (/\b(precio|cuesta|cuánto|valor|cuanto)\b/.test(normalized)) {
            return 'consulta_precio';
        }
        // Consulta de envío
        if (/\b(envío|entrega|domicilio|despacho|envio)\b/.test(normalized)) {
            return 'consulta_envio';
        }
        // Información del producto
        if (/\b(información|info|detalles|características|especificaciones|incluye)\b/.test(normalized)) {
            return 'info_producto';
        }
        // Comparación
        if (/\b(diferencia|mejor|comparar|cuál|cual)\b/.test(normalized)) {
            return 'comparacion';
        }
        // Objeciones
        if (/\b(caro|costoso|mucho|descuento|rebaja|oferta)\b/.test(normalized)) {
            return 'objecion_precio';
        }
        // Soporte
        if (/\b(ayuda|problema|error|no funciona|soporte)\b/.test(normalized)) {
            return 'soporte';
        }
        return 'general';
    }
    /**
     * Obtener estadísticas de captura
     */
    static async getStats(userId) {
        try {
            const total = await db_1.db.trainingData.count({ where: { userId } });
            const byCategory = await db_1.db.trainingData.groupBy({
                by: ['category'],
                where: { userId },
                _count: true
            });
            const evaluated = await db_1.db.trainingData.count({
                where: { userId, evaluatedAt: { not: null } }
            });
            const highQuality = await db_1.db.trainingData.count({
                where: { userId, qualityScore: { gte: 4 } }
            });
            return {
                total,
                evaluated,
                highQuality,
                byCategory: byCategory.map(c => ({
                    category: c.category,
                    count: c._count
                }))
            };
        }
        catch (error) {
            console.error('[Training] ❌ Error obteniendo stats:', error);
            return null;
        }
    }
}
exports.TrainingCaptureService = TrainingCaptureService;
