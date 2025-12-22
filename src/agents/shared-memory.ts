/**
 * Memoria Compartida entre Todos los Agentes
 * Mantiene el contexto de la conversación
 */

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  images?: string[];
  stock?: number;
  specs?: string[];
  smartTags?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type SalesStage = 'greeting' | 'search' | 'product' | 'payment' | 'closing' | 'support';

export interface ProductHistory {
  product: Product;
  timestamp: Date;
  stage: 'viewed' | 'interested' | 'payment_intent';
}

export interface SharedMemory {
  // Identificación
  userId: string;
  chatId: string;
  userName?: string;
  
  // Contexto de Conversación
  currentProduct?: Product;
  interestedProducts: Product[];
  productHistory: ProductHistory[]; // 🆕 Historial completo de productos
  lastQuery: string;
  messageCount: number;
  
  // Estado de Venta
  salesStage: SalesStage;
  paymentIntent: boolean;
  preferredPaymentMethod?: string;
  
  // Historial
  messages: Message[];
  lastUpdate: Date;
  createdAt: Date;
  
  // Flags
  photoSent: boolean;
  paymentLinkSent: boolean;
  productInfoSent: boolean;
  greetingSent: boolean;
  
  // Metadata
  needs: string[];
  objections: string[];
  budget?: number;
  
  // Tracking
  viewedProducts: string[]; // IDs de productos vistos
  searchQueries: string[]; // Búsquedas realizadas

  // Gestión de múltiples productos
  productList: Product[]; // Lista actual de productos mostrados (para selección numérica)
  listTimestamp: Date; // Cuando se mostró la lista (para expiración)
}

/**
 * Servicio de Memoria Compartida
 * Gestiona la memoria de todas las conversaciones
 */
export class SharedMemoryService {
  private static instance: SharedMemoryService;
  private memories: Map<string, SharedMemory> = new Map();
  
  // Singleton
  static getInstance(): SharedMemoryService {
    if (!SharedMemoryService.instance) {
      SharedMemoryService.instance = new SharedMemoryService();
    }
    return SharedMemoryService.instance;
  }
  
  /**
   * Obtiene la memoria de una conversación
   */
  get(chatId: string, userId: string): SharedMemory {
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
  private createNew(chatId: string, userId: string): SharedMemory {
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
      productList: [], // Lista de productos mostrados actualmente
      listTimestamp: new Date(), // Timestamp de la lista
    };
  }
  
  /**
   * Actualiza la memoria
   */
  update(chatId: string, updates: Partial<SharedMemory>): void {
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
  addMessage(chatId: string, role: 'user' | 'assistant', content: string): void {
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
  private async syncWithConversationContext(chatId: string): Promise<void> {
    try {
      const { ConversationContextService } = await import('../lib/conversation-context-service');
      ConversationContextService.renewContext(chatId);
      ConversationContextService.incrementMessageCount(chatId);
    } catch (error) {
      // Silencioso, no es crítico
    }
  }
  
  /**
   * Limpia la memoria de una conversación
   */
  clear(chatId: string): void {
    this.memories.delete(chatId);
  }
  
  /**
   * Limpia memorias antiguas (más de 24 horas)
   */
  cleanOldMemories(): void {
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
  setCurrentProduct(chatId: string, product: Product, stage: 'viewed' | 'interested' | 'payment_intent' = 'viewed'): void {
    const memory = this.memories.get(chatId);
    if (!memory) return;
    
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
  getLastProduct(chatId: string): Product | undefined {
    const memory = this.memories.get(chatId);
    if (!memory) return undefined;
    
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
  findProductInHistory(chatId: string): Product | undefined {
    const memory = this.memories.get(chatId);
    if (!memory) return undefined;
    
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
  isProductChange(chatId: string, newProductId: string): boolean {
    const memory = this.memories.get(chatId);
    if (!memory || !memory.currentProduct) return false;

    return memory.currentProduct.id !== newProductId;
  }

  /**
   * 🆕 Establecer lista de productos mostrados (para selección numérica)
   */
  setProductList(chatId: string, products: Product[]): void {
    const memory = this.memories.get(chatId);
    if (memory) {
      memory.productList = products;
      memory.listTimestamp = new Date();
      console.log(`[Memory] 📋 Lista de ${products.length} productos guardada para selección numérica`);
    }
  }

  /**
   * 🆕 Obtener producto por posición en la lista (1-based)
   */
  getProductByPosition(chatId: string, position: number): Product | null {
    const memory = this.memories.get(chatId);
    if (!memory || !memory.productList || position < 1 || position > memory.productList.length) {
      return null;
    }

    // Verificar que la lista no haya expirado (5 minutos)
    const listAge = Date.now() - memory.listTimestamp.getTime();
    if (listAge > 5 * 60 * 1000) {
      console.log(`[Memory] ⏰ Lista expirada (${Math.round(listAge / 60000)}min), limpiando`);
      memory.productList = [];
      return null;
    }

    const product = memory.productList[position - 1];
    console.log(`[Memory] 🎯 Producto seleccionado de lista: ${product.name} (posición ${position})`);
    return product;
  }

  /**
   * 🆕 Limpiar lista de productos (cuando se selecciona uno o cambia contexto)
   */
  clearProductList(chatId: string): void {
    const memory = this.memories.get(chatId);
    if (memory) {
      memory.productList = [];
      console.log(`[Memory] 🧹 Lista de productos limpiada`);
    }
  }

  /**
   * 🆕 Verificar si hay una lista activa de productos
   */
  hasActiveProductList(chatId: string): boolean {
    const memory = this.memories.get(chatId);
    if (!memory || !memory.productList || memory.productList.length === 0) {
      return false;
    }

    // Verificar expiración
    const listAge = Date.now() - memory.listTimestamp.getTime();
    if (listAge > 5 * 60 * 1000) {
      memory.productList = [];
      return false;
    }

    return true;
  }
  
  /**
   * 🆕 Obtiene el contexto completo para los agentes
   */
  getContext(chatId: string): string {
    const memory = this.memories.get(chatId);
    if (!memory) return '';
    
    const parts: string[] = [];
    
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
  getStats(): {
    totalConversations: number;
    activeConversations: number;
    averageMessages: number;
  } {
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
