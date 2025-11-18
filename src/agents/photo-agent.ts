/**
 * Agente de Foto
 * Maneja solicitudes de fotos (funciona SIN IA externa)
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory } from './shared-memory';

export class PhotoAgent extends BaseAgent {
  constructor() {
    super('PhotoAgent');
  }
  
  /**
   * Ejecuta el agente
   */
  async execute(message: string, memory: SharedMemory): Promise<AgentResponse> {
    // Este agente SIEMPRE puede manejar localmente
    return this.handleLocally(message, memory);
  }
  
  /**
   * Determina si puede manejar localmente (siempre SÍ)
   */
  canHandleLocally(message: string, memory: SharedMemory): boolean {
    return true; // Enviar fotos NUNCA necesita IA externa
  }
  
  /**
   * Maneja la solicitud de foto localmente
   */
  async handleLocally(message: string, memory: SharedMemory): Promise<AgentResponse> {
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
  async handleWithAI(message: string, memory: SharedMemory): Promise<AgentResponse> {
    // Las fotos nunca necesitan IA, pero por si acaso
    return this.handleLocally(message, memory);
  }
}
