"use strict";
/**
 * Memoria Compartida entre Todos los Agentes
 * Mantiene el contexto de la conversación
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedMemoryService = void 0;
/**
 * Servicio de Memoria Compartida
 * Gestiona la memoria de todas las conversaciones
 */
class SharedMemoryService {
    constructor() {
        this.memories = new Map();
    }
    // Singleton
    static getInstance() {
        if (!SharedMemoryService.instance) {
            SharedMemoryService.instance = new SharedMemoryService();
        }
        return SharedMemoryService.instance;
    }
    /**
     * Obtiene la memoria de una conversación
     */
    get(chatId, userId) {
        let memory = this.memories.get(chatId);
        if (!memory) {
            memory = this.createNew(chatId, userId);
            this.memories.set(chatId, memory);
        }
        return memory;
    }
    /**
     * Crea una nueva memoria
     */
    createNew(chatId, userId) {
        return {
            userId,
            chatId,
            currentProduct: undefined,
            interestedProducts: [],
            productHistory: [],
            lastQuery: '',
            messageCount: 0,
            salesStage: 'greeting',
            paymentIntent: false,
            messages: [],
            lastUpdate: new Date(),
            createdAt: new Date(),
            photoSent: false,
            paymentLinkSent: false,
            productInfoSent: false,
            greetingSent: false,
            needs: [],
            objections: [],
            viewedProducts: [],
            searchQueries: [],
        };
    }
    /**
     * Actualiza la memoria
     */
    update(chatId, updates) {
        const memory = this.memories.get(chatId);
        if (memory) {
            // Si se está actualizando el producto actual, resetear flags relacionados
            if (updates.currentProduct && memory.currentProduct?.id !== updates.currentProduct.id) {
                console.log(`[Memory] 🔄 Producto cambiado: ${memory.currentProduct?.name || 'ninguno'} → ${updates.currentProduct.name}`);
                updates.photoSent = false; // Resetear flag de foto cuando cambia el producto
                updates.productInfoSent = false; // Resetear flag de info
            }
            Object.assign(memory, updates);
            memory.lastUpdate = new Date();
        }
    }
    /**
     * Agrega un mensaje al historial
     */
    addMessage(chatId, role, content) {
        const memory = this.memories.get(chatId);
        if (memory) {
            memory.messages.push({
                role,
                content,
                timestamp: new Date(),
            });
            // Mantener solo los últimos 20 mensajes
            if (memory.messages.length > 20) {
                memory.messages = memory.messages.slice(-20);
            }
            memory.messageCount++;
            memory.lastUpdate = new Date();
            // 🔄 SINCRONIZAR con ConversationContextService
            this.syncWithConversationContext(chatId);
        }
    }
    /**
     * Sincroniza con ConversationContextService para mantener contexto vivo
     */
    async syncWithConversationContext(chatId) {
        try {
            const { ConversationContextService } = await Promise.resolve().then(() => __importStar(require('../lib/conversation-context-service')));
            ConversationContextService.renewContext(chatId);
            ConversationContextService.incrementMessageCount(chatId);
        }
        catch (error) {
            // Silencioso, no es crítico
        }
    }
    /**
     * Limpia la memoria de una conversación
     */
    clear(chatId) {
        this.memories.delete(chatId);
    }
    /**
     * Limpia memorias antiguas (más de 24 horas)
     */
    cleanOldMemories() {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        for (const [chatId, memory] of this.memories.entries()) {
            if (memory.lastUpdate < oneDayAgo) {
                this.memories.delete(chatId);
            }
        }
    }
    /**
     * 🆕 Establece el producto actual y maneja cambios
     */
    setCurrentProduct(chatId, product, stage = 'viewed') {
        const memory = this.memories.get(chatId);
        if (!memory)
            return;
        const isNewProduct = !memory.currentProduct || memory.currentProduct.id !== product.id;
        if (isNewProduct) {
            console.log(`[Memory] 🔄 Cambio de producto detectado: ${memory.currentProduct?.name || 'ninguno'} → ${product.name}`);
            // Agregar al historial
            memory.productHistory.push({
                product,
                timestamp: new Date(),
                stage,
            });
            // Mantener solo los últimos 5 productos en el historial
            if (memory.productHistory.length > 5) {
                memory.productHistory = memory.productHistory.slice(-5);
            }
            // Resetear flags relacionadas con el producto
            memory.photoSent = false;
            memory.productInfoSent = false;
            memory.paymentLinkSent = false;
        }
        // Actualizar producto actual
        memory.currentProduct = product;
        // Agregar a productos de interés si no está
        if (!memory.interestedProducts.find(p => p.id === product.id)) {
            memory.interestedProducts.push(product);
        }
        // Agregar a productos vistos
        if (!memory.viewedProducts.includes(product.id)) {
            memory.viewedProducts.push(product.id);
        }
        memory.lastUpdate = new Date();
    }
    /**
     * 🆕 Obtiene el producto más reciente del historial
     */
    getLastProduct(chatId) {
        const memory = this.memories.get(chatId);
        if (!memory)
            return undefined;
        // Primero intentar con currentProduct
        if (memory.currentProduct) {
            return memory.currentProduct;
        }
        // Si no hay currentProduct, buscar en el historial
        if (memory.productHistory.length > 0) {
            return memory.productHistory[memory.productHistory.length - 1].product;
        }
        // Si no hay historial, buscar en interestedProducts
        if (memory.interestedProducts.length > 0) {
            return memory.interestedProducts[memory.interestedProducts.length - 1];
        }
        return undefined;
    }
    /**
     * 🆕 Busca un producto en el historial de mensajes
     */
    findProductInHistory(chatId) {
        const memory = this.memories.get(chatId);
        if (!memory)
            return undefined;
        // Buscar en el historial de productos (más confiable)
        if (memory.productHistory.length > 0) {
            return memory.productHistory[memory.productHistory.length - 1].product;
        }
        // Buscar en productos de interés
        if (memory.interestedProducts.length > 0) {
            return memory.interestedProducts[memory.interestedProducts.length - 1];
        }
        return undefined;
    }
    /**
     * 🆕 Verifica si el cliente está preguntando por un producto diferente
     */
    isProductChange(chatId, newProductId) {
        const memory = this.memories.get(chatId);
        if (!memory || !memory.currentProduct)
            return false;
        return memory.currentProduct.id !== newProductId;
    }
    /**
     * 🆕 Obtiene el contexto completo para los agentes
     */
    getContext(chatId) {
        const memory = this.memories.get(chatId);
        if (!memory)
            return '';
        const parts = [];
        // Producto actual
        if (memory.currentProduct) {
            parts.push(`Producto actual: ${memory.currentProduct.name} ($${memory.currentProduct.price.toLocaleString('es-CO')})`);
        }
        // Historial de productos
        if (memory.productHistory.length > 1) {
            const otherProducts = memory.productHistory
                .slice(0, -1)
                .map(h => h.product.name)
                .join(', ');
            parts.push(`También preguntó por: ${otherProducts}`);
        }
        // Etapa de venta
        parts.push(`Etapa: ${memory.salesStage}`);
        // Intención de pago
        if (memory.paymentIntent) {
            parts.push('Cliente tiene intención de pago');
        }
        // Método de pago preferido
        if (memory.preferredPaymentMethod) {
            parts.push(`Método preferido: ${memory.preferredPaymentMethod}`);
        }
        // Últimas búsquedas
        if (memory.searchQueries.length > 0) {
            const lastQueries = memory.searchQueries.slice(-3).join(', ');
            parts.push(`Búsquedas: ${lastQueries}`);
        }
        return parts.join(' | ');
    }
    /**
     * Obtiene estadísticas
     */
    getStats() {
        const total = this.memories.size;
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        let active = 0;
        let totalMessages = 0;
        for (const memory of this.memories.values()) {
            if (memory.lastUpdate > oneHourAgo) {
                active++;
            }
            totalMessages += memory.messageCount;
        }
        return {
            totalConversations: total,
            activeConversations: active,
            averageMessages: total > 0 ? Math.round(totalMessages / total) : 0,
        };
    }
}
exports.SharedMemoryService = SharedMemoryService;
