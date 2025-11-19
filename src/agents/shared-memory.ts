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
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type SalesStage = 'greeting' | 'search' | 'product' | 'payment' | 'closing' | 'support';

export interface SharedMemory {
  // Identificación
  userId: string;
  chatId: string;
  userName?: string;
  
  // Contexto de Conversación
  currentProduct?: Product;
  interestedProducts: Product[];
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
  greetingSent: boolean; // Nueva flag para evitar saludos repetidos
  
  // Metadata
  needs: string[];
  objections: string[];
  budget?: number;
  
  // Tracking
  viewedProducts: string[]; // IDs de productos vistos
  searchQueries: string[]; // Búsquedas realizadas
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
      greetingSent: false, // Nueva flag inicializada en false
      needs: [],
      objections: [],
      viewedProducts: [],
      searchQueries: [],
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
