"use strict";
/**
 * Gestor de Contexto de Producto en Conversaciones
 *
 * Mantiene el foco en el producto actual y evita cambios no deseados
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductContextManager = void 0;
const db_1 = require("./db");
class ProductContextManager {
    /**
     * Establecer contexto de producto
     */
    static setContext(conversationKey, productId, productName, productPrice, productCategory, lock = false) {
        const existing = this.contexts.get(conversationKey);
        this.contexts.set(conversationKey, {
            productId,
            productName,
            productPrice,
            productCategory,
            messageCount: existing ? existing.messageCount + 1 : 1,
            lastMentionedAt: new Date(),
            isLocked: lock
        });
        console.log(`[ProductContext] 🎯 Contexto establecido: ${productName} ${lock ? '(BLOQUEADO)' : ''}`);
    }
    /**
     * Obtener contexto actual
     */
    static getContext(conversationKey) {
        const context = this.contexts.get(conversationKey);
        if (!context)
            return null;
        // Expirar después de 30 minutos de inactividad
        const thirtyMinutesAgo = new Date();
        thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
        if (context.lastMentionedAt < thirtyMinutesAgo) {
            this.contexts.delete(conversationKey);
            return null;
        }
        return context;
    }
    /**
     * Bloquear contexto actual (para evitar cambios accidentales)
     */
    static lockContext(conversationKey) {
        const context = this.contexts.get(conversationKey);
        if (context) {
            context.isLocked = true;
            console.log(`[ProductContext] 🔒 Contexto bloqueado: ${context.productName}`);
        }
    }
    /**
     * Desbloquear contexto
     */
    static unlockContext(conversationKey) {
        const context = this.contexts.get(conversationKey);
        if (context) {
            context.isLocked = false;
            console.log(`[ProductContext] 🔓 Contexto desbloqueado: ${context.productName}`);
        }
    }
    /**
     * Detectar si el cliente quiere cambiar de producto explícitamente
     * CORREGIDO: Ahora detecta CUALQUIER mención de producto diferente
     */
    static detectExplicitProductChange(message) {
        const messageLower = message.toLowerCase();
        // Indicadores FUERTES de cambio de producto
        const changeIndicators = [
            'mejor muestrame',
            'prefiero',
            'mejor el',
            'mejor la',
            'cambia a',
            'quiero ver',
            'muéstrame',
            'info de',
            'información de',
            'cuánto cuesta', // ← IMPORTANTE: Si pregunta precio de otro producto
            'precio de', // ← IMPORTANTE: Si pregunta precio de otro producto
            'tienes', // ← IMPORTANTE: Si pregunta "tienes X?"
            'tienen',
            'venden',
            'hay',
            'tienes otro',
            'tienes otra',
            'algo diferente',
            'otra opción',
            'cuéntame sobre',
            'háblame de',
            'qué tal'
        ];
        return changeIndicators.some(indicator => messageLower.includes(indicator));
    }
    /**
     * Incrementar contador de mensajes sobre el producto actual
     */
    static incrementMessageCount(conversationKey) {
        const context = this.contexts.get(conversationKey);
        if (context) {
            context.messageCount++;
            context.lastMentionedAt = new Date();
        }
    }
    /**
     * Limpiar contexto
     */
    static clearContext(conversationKey) {
        this.contexts.delete(conversationKey);
        console.log(`[ProductContext] 🗑️ Contexto limpiado`);
    }
    /**
     * Buscar productos más baratos en la misma categoría
     */
    static async findCheaperAlternatives(userId, currentProductId, currentPrice, maxBudget, category) {
        try {
            const whereClause = {
                userId,
                status: 'AVAILABLE',
                id: { not: currentProductId },
                price: { lt: currentPrice }
            };
            // Si hay presupuesto máximo, filtrar por él
            if (maxBudget) {
                whereClause.price = { lte: maxBudget };
            }
            // Si hay categoría, filtrar por ella
            if (category) {
                whereClause.category = category;
            }
            const alternatives = await db_1.db.product.findMany({
                where: whereClause,
                orderBy: { price: 'desc' }, // Más caro primero (pero más barato que el actual)
                take: 5
            });
            console.log(`[ProductContext] 💰 Encontradas ${alternatives.length} alternativas más baratas`);
            return alternatives;
        }
        catch (error) {
            console.error('[ProductContext] Error buscando alternativas:', error);
            return [];
        }
    }
    /**
     * Generar respuesta manteniendo el foco en el producto actual
     */
    static generateFocusedResponse(product, customerMessage, intent) {
        const messageLower = customerMessage.toLowerCase();
        // Si pregunta por precio
        if (intent === 'price' || messageLower.includes('cuánto') || messageLower.includes('precio')) {
            return `El precio de **${product.name}** es **${product.price.toLocaleString('es-CO')} COP** 💰

¿Te gustaría comprarlo o necesitas más información?`;
        }
        // Si pregunta por características
        if (intent === 'info' || messageLower.includes('características') || messageLower.includes('info')) {
            let response = `📦 **${product.name}**\n\n`;
            if (product.description) {
                response += `${product.description}\n\n`;
            }
            response += `💰 Precio: ${product.price.toLocaleString('es-CO')} COP\n\n`;
            response += `¿Deseas comprarlo? 😊`;
            return response;
        }
        // Si pregunta por fotos
        if (intent === 'photo' || messageLower.includes('foto') || messageLower.includes('imagen')) {
            return `Claro, te envío las fotos de **${product.name}** 📸`;
        }
        // Si quiere comprar
        if (intent === 'buy' || messageLower.includes('comprar') || messageLower.includes('link')) {
            return null; // Dejar que el sistema normal maneje la compra
        }
        return null; // No generar respuesta automática
    }
}
exports.ProductContextManager = ProductContextManager;
ProductContextManager.contexts = new Map();
