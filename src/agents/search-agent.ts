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
      'de', 'del', 'en', 'para', 'con', 'y', 'o', 'interesado'
    ];
    
    const keywords = cleanQuery.split(' ')
      .map(w => w.trim())
      .filter(w => w.length > 2 && !ignoreWords.includes(w));
    
    if (keywords.length === 0) return [];

    try {
      // 1. Búsqueda AMPLIA en base de datos (OR)
      // Traemos candidatos que coincidan con AL MENOS UNA palabra clave
      const orConditions = keywords.map(k => ({
        OR: [
          { name: { contains: k, mode: 'insensitive' as const } },
          { description: { contains: k, mode: 'insensitive' as const } },
          { tags: { contains: k, mode: 'insensitive' as const } }
        ]
      }));

      // Si hay muchas keywords, la query puede ser pesada, simplificamos
      // Buscamos productos que tengan al menos una de las keywords
      const dbProducts = await db.product.findMany({
        where: {
          status: 'AVAILABLE',
          OR: orConditions.flatMap(c => c.OR)
        },
        take: 50, // Traer suficientes para filtrar en memoria
        orderBy: { createdAt: 'desc' }
      });
      
      let products = dbProducts;
      
      // 2. FILTRADO INTELIGENTE EN MEMORIA
      
      // A) Prioridad: Coincidencia de TODAS las keywords (AND)
      // Manejo básico de typos: si la keyword es "pianon", y el producto tiene "piano", 
      // "piano".includes("pianon") es falso. 
      // Pero "pianon".includes("piano") es verdadero (substring inverso) o distancia baja.
      
      const strictMatches = products.filter(p => {
        const text = `${p.name} ${p.description || ''} ${p.tags || ''}`.toLowerCase();
        return keywords.every(k => {
          // Coincidencia exacta o substring
          if (text.includes(k)) return true;
          
          // Coincidencia parcial para typos simples (si la keyword es larga)
          // Ej: "pianon" (6 chars) vs "piano" (5 chars)
          // Si el texto contiene una parte significativa de la keyword
          if (k.length > 4) {
             const sub = k.substring(0, k.length - 1); // "piano"
             return text.includes(sub);
          }
          return false;
        });
      });
      
      if (strictMatches.length > 0) {
        return strictMatches.slice(0, 10).map(p => this.mapProduct(p));
      }
      
      // B) Si no hay coincidencia estricta, usar coincidencia PARCIAL (OR)
      // Pero ordenando por relevancia (cuántas keywords coinciden)
      
      // Si es búsqueda ESPECÍFICA, NO hacer fallback a parcial
      if (searchType === 'specific') {
        return [];
      }
      
      const scoredProducts = products.map(p => {
        const text = `${p.name} ${p.description || ''} ${p.tags || ''}`.toLowerCase();
        let score = 0;
        keywords.forEach(k => {
          if (text.includes(k)) score++;
        });
        return { product: p, score };
      });
      
      // Filtrar solo los que tengan alguna coincidencia y ordenar
      const sorted = scoredProducts
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
        
      return sorted.slice(0, 10).map(p => this.mapProduct(p));
      
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
