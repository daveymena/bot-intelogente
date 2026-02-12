/**
 * 💾 PERSISTENT MEMORY MANAGER
 * 
 * Gestiona memoria de conversaciones que NUNCA expira (30 días)
 * Soluciona el problema de pérdida de contexto después de 1 hora
 * 
 * Características:
 * - Guarda TODO el contexto de la conversación
 * - Recupera conversaciones antiguas automáticamente
 * - Mantiene producto actual, intenciones, objeciones
 * - Compatible con SaaS multi-tenant
 */

import { db } from './db';

interface ConversationMemory {
  conversationKey: string;
  userId: string;
  chatId: string;
  userName?: string;
  
  // Producto y contexto
  currentProduct?: {
    id: string;
    name: string;
    price: number;
    category: string;
  };
  
  // Historial de productos vistos
  productHistory: Array<{
    id: string;
    name: string;
    viewedAt: Date;
  }>;
  
  // Estado de la conversación
  conversationStage: 'greeting' | 'browsing' | 'interested' | 'negotiating' | 'closing' | 'completed' | 'advising_use' | 'advising_budget';
  messageCount: number;
  lastInteraction: Date;
  
  // Intenciones y preferencias
  intentions: string[];
  preferences: {
    budget?: number;
    category?: string;
    features?: string[];
  };
  
  // Información financiera
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Objeciones detectadas
  objections: string[];
  
  // Flags operativos
  photoSent: boolean;
  paymentIntent: boolean;
  preferredPaymentMethod?: string;
}

export class PersistentMemoryManager {
  private static EXPIRATION_DAYS = 30;

  /**
   * Obtener o crear memoria persistente
   */
  static async getMemory(chatId: string, userId: string): Promise<ConversationMemory> {
    const conversationKey = `${userId}:${chatId}`;

    try {
      // Buscar memoria existente
      const existing = await db.persistentMemory.findUnique({
        where: { conversationKey }
      });

      if (existing) {
        console.log(`💾 [MEMORY] Memoria recuperada para ${chatId}`);
        console.log(`   Última interacción: ${new Date(existing.lastInteraction).toLocaleString('es-CO')}`);
        console.log(`   Producto actual: ${existing.currentProduct ? JSON.parse(existing.currentProduct).name : 'Ninguno'}`);
        
        return this.parseMemory(existing);
      }

      // Crear nueva memoria
      console.log(`💾 [MEMORY] Creando nueva memoria para ${chatId}`);
      
      const newMemory = await db.persistentMemory.create({
        data: {
          conversationKey,
          userId,
          chatId,
          productHistory: '[]',
          conversationStage: 'greeting',
          messageCount: 0,
          lastInteraction: new Date().toISOString(),
          intentions: '[]',
          preferences: '{}',
          objections: '[]',
          photoSent: false,
          paymentIntent: false
        }
      });

      return this.parseMemory(newMemory);
    } catch (error) {
      console.error('❌ [MEMORY] Error obteniendo memoria:', error);
      // Retornar memoria por defecto
      return this.getDefaultMemory(chatId, userId);
    }
  }

  /**
   * Actualizar memoria persistente
   */
  static async updateMemory(
    chatId: string,
    userId: string,
    updates: Partial<ConversationMemory>
  ): Promise<void> {
    const conversationKey = `${userId}:${chatId}`;

    try {
      const updateData: any = {
        lastUpdated: new Date(),
        lastInteraction: new Date().toISOString()
      };

      // Actualizar campos específicos
      if (updates.userName) updateData.userName = updates.userName;
      if (updates.currentProduct) updateData.currentProduct = JSON.stringify(updates.currentProduct);
      if (updates.productHistory) updateData.productHistory = JSON.stringify(updates.productHistory);
      if (updates.conversationStage) updateData.conversationStage = updates.conversationStage;
      if (updates.messageCount !== undefined) updateData.messageCount = updates.messageCount;
      if (updates.intentions) updateData.intentions = JSON.stringify(updates.intentions);
      if (updates.preferences) updateData.preferences = JSON.stringify(updates.preferences);
      if (updates.budget) updateData.budget = JSON.stringify(updates.budget);
      if (updates.objections) updateData.objections = JSON.stringify(updates.objections);
      if (updates.photoSent !== undefined) updateData.photoSent = updates.photoSent;
      if (updates.paymentIntent !== undefined) updateData.paymentIntent = updates.paymentIntent;
      if (updates.preferredPaymentMethod) updateData.preferredPaymentMethod = updates.preferredPaymentMethod;

      await db.persistentMemory.update({
        where: { conversationKey },
        data: updateData
      });

      console.log(`💾 [MEMORY] Memoria actualizada para ${chatId}`);
    } catch (error) {
      console.error('❌ [MEMORY] Error actualizando memoria:', error);
    }
  }

  /**
   * Agregar producto al historial
   */
  static async addProductToHistory(
    chatId: string,
    userId: string,
    product: { id: string; name: string }
  ): Promise<void> {
    const memory = await this.getMemory(chatId, userId);
    
    // Evitar duplicados
    const exists = memory.productHistory.some(p => p.id === product.id);
    if (exists) return;

    memory.productHistory.push({
      ...product,
      viewedAt: new Date()
    });

    // Mantener solo últimos 10 productos
    if (memory.productHistory.length > 10) {
      memory.productHistory = memory.productHistory.slice(-10);
    }

    await this.updateMemory(chatId, userId, {
      productHistory: memory.productHistory
    });
  }

  /**
   * Establecer producto actual
   */
  static async setCurrentProduct(
    chatId: string,
    userId: string,
    product: { id: string; name: string; price: number; category: string }
  ): Promise<void> {
    console.log(`💾 [MEMORY] Estableciendo producto actual: ${product.name}`);
    
    await this.updateMemory(chatId, userId, {
      currentProduct: product,
      conversationStage: 'interested'
    });

    // Agregar al historial
    await this.addProductToHistory(chatId, userId, {
      id: product.id,
      name: product.name
    });
  }

  /**
   * Actualizar etapa de conversación
   */
  static async updateStage(
    chatId: string,
    userId: string,
    stage: ConversationMemory['conversationStage']
  ): Promise<void> {
    console.log(`💾 [MEMORY] Actualizando etapa: ${stage}`);
    
    await this.updateMemory(chatId, userId, {
      conversationStage: stage
    });
  }

  /**
   * Registrar intención de pago
   */
  static async setPaymentIntent(
    chatId: string,
    userId: string,
    paymentMethod?: string
  ): Promise<void> {
    console.log(`💾 [MEMORY] Intención de pago detectada`);
    
    await this.updateMemory(chatId, userId, {
      paymentIntent: true,
      preferredPaymentMethod: paymentMethod,
      conversationStage: 'closing'
    });
  }

  /**
   * Agregar objeción detectada
   */
  static async addObjection(
    chatId: string,
    userId: string,
    objection: string
  ): Promise<void> {
    const memory = await this.getMemory(chatId, userId);
    
    if (!memory.objections.includes(objection)) {
      memory.objections.push(objection);
      
      await this.updateMemory(chatId, userId, {
        objections: memory.objections
      });
    }
  }

  /**
   * Incrementar contador de mensajes
   */
  static async incrementMessageCount(chatId: string, userId: string): Promise<void> {
    const memory = await this.getMemory(chatId, userId);
    
    await this.updateMemory(chatId, userId, {
      messageCount: memory.messageCount + 1
    });
  }

  /**
   * Limpiar memorias antiguas (>30 días)
   */
  static async cleanOldMemories(): Promise<number> {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - this.EXPIRATION_DAYS);

      const deleted = await db.persistentMemory.deleteMany({
        where: {
          lastUpdated: {
            lt: expirationDate
          }
        }
      });

      console.log(`🧹 [MEMORY] ${deleted.count} memorias antiguas eliminadas`);
      return deleted.count;
    } catch (error) {
      console.error('❌ [MEMORY] Error limpiando memorias:', error);
      return 0;
    }
  }

  /**
   * Obtener estadísticas de memoria
   */
  static async getStats() {
    try {
      const total = await db.persistentMemory.count();
      const active = await db.persistentMemory.count({
        where: {
          lastUpdated: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        }
      });

      return {
        total,
        active,
        inactive: total - active
      };
    } catch (error) {
      return { total: 0, active: 0, inactive: 0 };
    }
  }

  /**
   * Parsear memoria desde BD
   */
  private static parseMemory(data: any): ConversationMemory {
    return {
      conversationKey: data.conversationKey,
      userId: data.userId,
      chatId: data.chatId,
      userName: data.userName || undefined,
      currentProduct: data.currentProduct ? JSON.parse(data.currentProduct) : undefined,
      productHistory: JSON.parse(data.productHistory || '[]'),
      conversationStage: data.conversationStage,
      messageCount: data.messageCount,
      lastInteraction: new Date(data.lastInteraction),
      intentions: JSON.parse(data.intentions || '[]'),
      preferences: JSON.parse(data.preferences || '{}'),
      budget: data.budget ? JSON.parse(data.budget) : undefined,
      objections: JSON.parse(data.objections || '[]'),
      photoSent: data.photoSent,
      paymentIntent: data.paymentIntent,
      preferredPaymentMethod: data.preferredPaymentMethod || undefined
    };
  }

  /**
   * Memoria por defecto
   */
  private static getDefaultMemory(chatId: string, userId: string): ConversationMemory {
    return {
      conversationKey: `${userId}:${chatId}`,
      userId,
      chatId,
      productHistory: [],
      conversationStage: 'greeting',
      messageCount: 0,
      lastInteraction: new Date(),
      intentions: [],
      preferences: {},
      objections: [],
      photoSent: false,
      paymentIntent: false
    };
  }
}
