/**
 * 🧠 SERVICIO UNIFICADO DE MEMORIA (SOLO RAM - TEMPORAL)
 * Versión simplificada que solo usa memoria en RAM hasta que se cree la tabla persistent_memory
 */

import { SharedMemoryService, SharedMemory } from '../agents/shared-memory';

export interface UnifiedMemory {
  chatId: string;
  userId: string;
  userName?: string;

  currentProduct?: {
    id: string;
    name: string;
    price: number;
    category: string;
    images?: string[];
  };

  productHistory: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    mentionedAt: Date;
    stage: 'viewed' | 'interested' | 'payment_intent';
  }>;

  conversationStage: 'greeting' | 'discovery' | 'presentation' | 'negotiation' | 'closing' | 'post_sale';
  messageCount: number;
  lastInteraction: Date;

  intentions: Array<{
    type: string;
    detectedAt: Date;
  }>;

  preferences: {
    priceRange?: { min: number; max: number };
    categories?: string[];
    paymentMethods?: string[];
  };

  budget?: {
    amount: number | null;
    mentionedAt: Date | null;
  };

  objections: Array<{
    type: string;
    message: string;
    detectedAt: Date;
  }>;

  photoSent: boolean;
  paymentIntent: boolean;
  preferredPaymentMethod?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

export class UnifiedMemoryService {
  private static instance: UnifiedMemoryService;
  private sharedMemoryService = SharedMemoryService.getInstance();
  private memoryCache = new Map<string, UnifiedMemory>();

  static getInstance(): UnifiedMemoryService {
    if (!UnifiedMemoryService.instance) {
      UnifiedMemoryService.instance = new UnifiedMemoryService();
    }
    return UnifiedMemoryService.instance;
  }

  async getUnifiedMemory(chatId: string, userId: string): Promise<UnifiedMemory> {
    const key = `${userId}:${chatId}`;
    
    if (!this.memoryCache.has(key)) {
      console.log(`[UnifiedMemory] 🆕 Creando nueva memoria para ${chatId}`);
      this.memoryCache.set(key, this.createInitialMemory(chatId, userId));
    }

    return this.memoryCache.get(key)!;
  }

  async updateUnifiedMemory(chatId: string, userId: string, updates: Partial<UnifiedMemory>): Promise<void> {
    const key = `${userId}:${chatId}`;
    const current = await this.getUnifiedMemory(chatId, userId);
    
    const updated = { ...current, ...updates, lastInteraction: new Date() };
    this.memoryCache.set(key, updated);
    this.syncToSharedMemory(chatId, updated);
    
    console.log(`[UnifiedMemory] ✅ Memoria actualizada: ${chatId}`);
  }

  async addMessage(chatId: string, userId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const memory = await this.getUnifiedMemory(chatId, userId);
    
    memory.messages.push({ role, content, timestamp: new Date() });
    memory.messageCount += 1;
    memory.lastInteraction = new Date();
    
    if (memory.messages.length > 20) {
      memory.messages = memory.messages.slice(-20);
    }
    
    this.sharedMemoryService.addMessage(chatId, role, content);
  }

  private syncToSharedMemory(chatId: string, memory: UnifiedMemory): void {
    const sharedUpdates: Partial<SharedMemory> = {};
    
    if (memory.currentProduct) sharedUpdates.currentProduct = memory.currentProduct;
    if (memory.photoSent !== undefined) sharedUpdates.photoSent = memory.photoSent;
    if (memory.paymentIntent !== undefined) sharedUpdates.paymentIntent = memory.paymentIntent;
    if (memory.preferredPaymentMethod) sharedUpdates.preferredPaymentMethod = memory.preferredPaymentMethod;
    if (memory.userName) sharedUpdates.userName = memory.userName;
    
    if (Object.keys(sharedUpdates).length > 0) {
      this.sharedMemoryService.update(chatId, sharedUpdates);
    }
  }

  private createInitialMemory(chatId: string, userId: string): UnifiedMemory {
    return {
      chatId,
      userId,
      conversationStage: 'greeting',
      messageCount: 0,
      lastInteraction: new Date(),
      productHistory: [],
      intentions: [],
      preferences: {},
      objections: [],
      photoSent: false,
      paymentIntent: false,
      messages: []
    };
  }

  async clearMemory(chatId: string, userId: string): Promise<void> {
    const key = `${userId}:${chatId}`;
    this.memoryCache.delete(key);
    this.sharedMemoryService.clear(chatId);
    console.log(`[UnifiedMemory] 🧹 Memoria limpiada: ${chatId}`);
  }

  async getStats(): Promise<any> {
    return {
      sharedMemory: this.sharedMemoryService.getStats(),
      cacheSize: this.memoryCache.size
    };
  }
}