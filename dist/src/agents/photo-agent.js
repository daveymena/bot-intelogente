"use strict";
/**
 * Agente de Foto
 * Maneja solicitudes de fotos (funciona SIN IA externa)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoAgent = void 0;
const base_agent_1 = require("./base-agent");
class PhotoAgent extends base_agent_1.BaseAgent {
    constructor() {
        super('PhotoAgent');
    }
    /**
     * Ejecuta el agente
     */
    async execute(message, memory) {
        // Este agente SIEMPRE puede manejar localmente
        return this.handleLocally(message, memory);
    }
    /**
     * Determina si puede manejar localmente (siempre SÍ)
     */
    canHandleLocally(message, memory) {
        return true; // Enviar fotos NUNCA necesita IA externa
    }
    /**
     * Maneja la solicitud de foto localmente
     */
    async handleLocally(message, memory) {
        this.log('Manejando solicitud de foto localmente');
        this.log(`📦 Producto en memoria: ${memory.currentProduct?.name || 'ninguno'}`);
        this.log(`📦 Productos interesados: ${memory.interestedProducts?.length || 0}`);
        const product = memory.currentProduct;
        // Si no hay producto en contexto
        if (!product) {
            this.log('❌ No hay producto en contexto, pidiendo clarificación');
            return {
                text: `¿De qué producto quieres ver la foto? 🤔

Puedes decirme el nombre del producto que te interesa.`,
                nextAgent: 'search',
                confidence: 0.9,
            };
        }
        // Si el producto no tiene imágenes
        if (!product.images || product.images.length === 0) {
            return {
                text: `Lo siento, no tengo fotos disponibles de *${product.name}* 😔

¿Te gustaría ver otro producto?`,
                nextAgent: 'search',
                confidence: 0.9,
            };
        }
        // Enviar fotos del producto
        this.log(`Enviando ${product.images.length} foto(s) de: ${product.name}`);
        return {
            text: `¡Claro! Te envío la foto de *${product.name}* 📸`,
            sendPhotos: true,
            photos: product.images,
            nextAgent: 'product',
            confidence: 0.95,
            actions: [
                {
                    type: 'send_photo',
                    data: { product },
                },
            ],
        };
    }
    /**
     * Maneja con IA (no se usa, pero debe implementarse)
     */
    async handleWithAI(message, memory) {
        // Las fotos nunca necesitan IA, pero por si acaso
        return this.handleLocally(message, memory);
    }
}
exports.PhotoAgent = PhotoAgent;
