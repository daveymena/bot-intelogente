/**
 * Agente de Búsqueda SIMPLIFICADO
 * Usa ContextualBrain para razonamiento inteligente
 * SIN sistema de puntos, SOLO lógica contextual
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory, Product } from './shared-memory';
import { db } from '@/lib/db';
import { ContextualBrain, Message } from '@/lib/contextual-brain';

export class SearchAgent extends BaseAgent {
  constructor() {
    super('SearchAgent');
  }
  
  /**
   * Ejecuta el agente
   */
  async execute(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('🔍 Iniciando búsqueda con razonamiento contextual');
    
    // Convertir historial a formato del cerebro
    const conversationHistory: Message[] = memory.messages.map(m => ({
      role: m.role as 'user' | 'bot',
      content: m.content,
      timestamp: new Date(m.timestamp),
      products: m.role === 'bot' ? memory.interestedProducts : undefined
    }));
    
    // Usar el cerebro contextual para razonar
    const reasoning = await ContextualBrain.processMessage({
      message,
      chatId: memory.chatId,
      conversationHistory,
      currentProduct: memory.currentProduct
    });
    
    this.log(`🧠 Razonamiento: ${reasoning.reasoning}`);
    this.log(`🎯 Tipo: ${reasoning.type}, Confianza: ${(reasoning.confidence * 100).toFixed(0)}%`);
    
    // Manejar según el tipo de razonamiento
    switch (reasoning.type) {
      case 'reference_to_context':
        return this.handleContextReference(reasoning, memory);
      
      case 'usage_question':
        return this.handleUsageQuestion(reasoning, memory);
      
      case 'new_search':
        return this.handleNewSearch(reasoning, memory);
      
      case 'unclear':
      default:
        return this.handleUnclear(message, memory);
    }
  }
  
  /**
   * Maneja referencias al contexto
   */
  private async handleContextReference(
    reasoning: any,
    memory: SharedMemory
  ): Promise<AgentResponse> {
    const products = reasoning.referencedProducts || [];
    
    if (products.length === 0) {
      return {
        text: 'No recuerdo haber mencionado productos recientemente. ¿Qué estás buscando?',
        confidence: 0.5
      };
    }
    
    // Mostrar los productos referenciados
    const { SharedMemoryService } = await import('./shared-memory');
    const memoryService = SharedMemoryService.getInstance();
    
    if (products.length === 1) {
      memoryService.setCurrentProduct(memory.chatId, products[0], 'viewed');
      memory.currentProduct = products[0];
      
      const { ProductAgent } = await import('./product-agent');
      const productAgent = new ProductAgent();
      return await productAgent.execute('', memory);
    }
    
    // Múltiples productos
    memory.interestedProducts = products;
    memoryService.setProductList(memory.chatId, products);
    
    return this.showProductList(products);
  }
  
  /**
   * Maneja preguntas sobre uso
   */
  private async handleUsageQuestion(
    reasoning: any,
    memory: SharedMemory
  ): Promise<AgentResponse> {
    const product = reasoning.currentProduct;
    const useCase = reasoning.useCase || 'ese uso';
    
    if (!product) {
      return {
        text: '¿Sobre qué producto te gustaría saber?',
        confidence: 0.5
      };
    }
    
    // Generar respuesta sobre el uso
    const response = this.generateUsageResponse(product, useCase);
    
    return {
      text: response,
      confidence: 0.9
    };
  }
  
  /**
   * Maneja búsquedas nuevas
   */
  private async handleNewSearch(
    reasoning: any,
    memory: SharedMemory
  ): Promise<AgentResponse> {
    const query = reasoning.searchQuery;
    const searchType = reasoning.searchType;
    
    // Búsqueda SIMPLE por nombre
    const products = await this.simpleSearch(query, memory.userId, searchType);
    
    this.log(`📦 Encontrados ${products.length} productos (Tipo: ${searchType})`);
    
    if (products.length === 0) {
      // Si es búsqueda específica y falló, ser honesto
      if (searchType === 'specific') {
        return {
          text: `No encontré un producto que coincida exactamente con "${query}". ¿Te gustaría ver opciones similares o de otra categoría?`,
          confidence: 0.8
        };
      }
      
      return {
        text: `No encontré productos para "${query}". ¿Quieres que te muestre otras opciones?`,
        confidence: 0.4
      };
    }
    
    const { SharedMemoryService } = await import('./shared-memory');
    const memoryService = SharedMemoryService.getInstance();
    
    if (products.length === 1) {
      memoryService.setCurrentProduct(memory.chatId, products[0], 'viewed');
      memory.currentProduct = products[0];
      
      const { ProductAgent } = await import('./product-agent');
      const productAgent = new ProductAgent();
      return await productAgent.execute('', memory);
    }
    
    // Múltiples productos
    const topProducts = products.slice(0, 3);
    memory.interestedProducts = topProducts;
    memoryService.setProductList(memory.chatId, topProducts);
    
    return this.showProductList(topProducts);
  }
  
  /**
   * Maneja casos no claros
   */
  private handleUnclear(message: string, memory: SharedMemory): AgentResponse {
    return {
      text: '',
      confidence: 0.3, // Baja confianza para activar IA
      nextAgent: 'search'
    };
  }
  
  /**
   * Búsqueda SIMPLE por nombre (sin scoring complejo)
   */
  private async simpleSearch(query: string, userId: string, searchType?: string): Promise<Product[]> {
    const cleanQuery = query.toLowerCase().trim();
    
    // Palabras a ignorar en la búsqueda (intención)
    const ignoreWords = [
      'busco', 'necesito', 'quiero', 'ver', 'muestrame', 'tienes',
      'especifico', 'específico', 'solo', 'unicamente', 'únicamente',
      'exactamente', 'puntual', 'el', 'la', 'los', 'las', 'un', 'una',
      'de', 'del', 'en', 'para', 'con', 'y', 'o'
    ];
    
    const keywords = cleanQuery.split(' ')
      .map(w => w.trim())
      .filter(w => w.length > 2 && !ignoreWords.includes(w));
    
    try {
      // Buscar productos que contengan las palabras clave
      const dbProducts = await db.product.findMany({
        where: {
          status: 'AVAILABLE',
          OR: [
            { name: { contains: cleanQuery, mode: 'insensitive' } },
            { description: { contains: cleanQuery, mode: 'insensitive' } },
            { tags: { contains: cleanQuery, mode: 'insensitive' } }
          ]
        },
        take: 20, // Traer más para filtrar después
        orderBy: { createdAt: 'desc' }
      });
      
      let products = dbProducts;
      
      // FILTRADO ESTRICTO para búsquedas específicas
      if (searchType === 'specific' && keywords.length > 0) {
        products = products.filter(p => {
          const nameLower = p.name.toLowerCase();
          const descLower = (p.description || '').toLowerCase();
          
          // Debe contener TODAS las palabras clave importantes en el nombre o descripción
          return keywords.every(k => nameLower.includes(k) || descLower.includes(k));
        });
        
        // Si después del filtrado estricto no queda nada, intentar ser un poco más flexible
        // (ej: coincidir en nombre es más importante)
        if (products.length === 0) {
           products = dbProducts.filter(p => {
             const nameLower = p.name.toLowerCase();
             // Al menos una keyword en el nombre
             return keywords.some(k => nameLower.includes(k));
           });
        }
      }
      
      return products.slice(0, 10).map(p => this.mapProduct(p));
    } catch (error) {
      this.log('Error en búsqueda:', error);
      return [];
    }
  }
  
  /**
   * Genera respuesta sobre uso del producto
   */
  private generateUsageResponse(product: Product, useCase: string): string {
    const useCaseResponses: { [key: string]: string } = {
      'estudio': `¡Sí! El **${product.name}** es excelente para estudio:\n\n✅ Perfecto para tomar notas y hacer trabajos\n✅ Suficiente potencia para investigación\n✅ Ideal para estudiantes\n\n💰 Precio: $${product.price.toLocaleString('es-CO')} COP\n\n¿Te gustaría saber más detalles?`,
      
      'trabajo': `¡Claro! El **${product.name}** es ideal para trabajo:\n\n✅ Perfecto para tareas profesionales\n✅ Buena productividad\n✅ Confiable para uso diario\n\n💰 Precio: $${product.price.toLocaleString('es-CO')} COP\n\n¿Necesitas más información?`,
      
      'gaming': `El **${product.name}** ${product.category === 'LAPTOP' ? 'puede servir para gaming ligero' : 'es perfecto para gaming'}:\n\n✅ ${product.category === 'LAPTOP' ? 'Gaming casual y juegos ligeros' : 'Alto rendimiento en juegos'}\n✅ Buena experiencia de uso\n\n💰 Precio: $${product.price.toLocaleString('es-CO')} COP\n\n¿Quieres conocer las especificaciones?`,
      
      'diseño': `El **${product.name}** es bueno para diseño:\n\n✅ Suficiente potencia para programas de diseño\n✅ Buena pantalla\n✅ Ideal para creativos\n\n💰 Precio: $${product.price.toLocaleString('es-CO')} COP\n\n¿Te interesa?`
    };
    
    return useCaseResponses[useCase] || `El **${product.name}** puede servir para ${useCase}.\n\n💰 Precio: $${product.price.toLocaleString('es-CO')} COP\n\n¿Quieres más información?`;
  }
  
  /**
   * Muestra lista de productos
   */
  private showProductList(products: Product[]): AgentResponse {
    let text = `¡Hola! Tengo varias opciones disponibles! 💻\n\n`;
    
    products.forEach((product, index) => {
      text += `📦 ${product.name}\n`;
      text += `💻 ${product.description?.substring(0, 100) || 'Producto de calidad'}...\n`;
      text += `💰 ${product.price.toLocaleString('es-CO')} COP\n\n`;
    });
    
    text += `¿Cuál te interesa más? 🤔`;
    
    return {
      text,
      confidence: 0.85
    };
  }
  
  /**
   * Mapea producto de DB a formato interno
   */
  private mapProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      price: dbProduct.price,
      category: dbProduct.category,
      description: dbProduct.description,
      imageUrl: dbProduct.imageUrl,
      stock: dbProduct.stock,
      tags: dbProduct.tags,
      smartTags: dbProduct.smartTags
    };
  }
  
  /**
   * Limpia mensaje
   */
  private cleanMessage(message: string): string {
    return message.toLowerCase().trim();
  }
}
