/**
 * 💾 SERVICIO DE MEMORIA PERSISTENTE
 * Guarda y carga memoria unificada en base de datos para persistencia entre sesiones
 */

import { db } from './db';
import { UnifiedMemory } from './unified-memory-service';

export class PersistentMemoryService {
  private static instance: PersistentMemoryService;

  static getInstance(): PersistentMemoryService {
    if (!PersistentMemoryService.instance) {
      PersistentMemoryService.instance = new PersistentMemoryService();
    }
    return PersistentMemoryService.instance;
  }

  /**
   * Guarda memoria unificada en base de datos
   */
  async saveUnifiedMemory(chatId: string, userId: string, memory: UnifiedMemory): Promise<void> {
    try {
      const conversationKey = `${userId}:${chatId}`;

      // 🔥 VALIDACIÓN: Asegurar que currentProduct es un objeto válido
      let currentProductJson = null;
      if (memory.currentProduct) {
        if (typeof memory.currentProduct === 'object' && memory.currentProduct.id && memory.currentProduct.name) {
          currentProductJson = JSON.stringify(memory.currentProduct);
          console.log(`[PersistentMemory] 💾 Guardando producto: ${memory.currentProduct.name}`);
        } else {
          console.warn(`[PersistentMemory] ⚠️ currentProduct inválido, no se guardará:`, memory.currentProduct);
        }
      }
      
      // Serializar datos complejos
      const serializedMemory = {
        conversationKey,
        userId,
        chatId,
        userName: memory.userName,
        currentProduct: currentProductJson,
        productHistory: JSON.stringify(memory.productHistory),
        conversationStage: memory.conversationStage,
        messageCount: memory.messageCount,
        lastInteraction: memory.lastInteraction.toISOString(),
        intentions: JSON.stringify(memory.intentions),
        preferences: JSON.stringify(memory.preferences),
        budget: memory.budget ? JSON.stringify(memory.budget) : null,
        objections: JSON.stringify(memory.objections),
        photoSent: memory.photoSent,
        paymentIntent: memory.paymentIntent,
        preferredPaymentMethod: memory.preferredPaymentMethod,
        lastUpdated: new Date()
      };

      // Upsert en base de datos
      await db.persistentMemory.upsert({
        where: { conversationKey },
        update: serializedMemory,
        create: serializedMemory
      });

      console.log(`[PersistentMemory] 💾 Memoria guardada para ${conversationKey}`);

    } catch (error) {
      console.error('[PersistentMemory] ❌ Error guardando memoria:', error);
    }
  }

  /**
   * Carga memoria unificada desde base de datos
   */
  async loadUnifiedMemory(chatId: string, userId: string): Promise<UnifiedMemory | null> {
    try {
      const conversationKey = `${userId}:${chatId}`;

      const stored = await db.persistentMemory.findUnique({
        where: { conversationKey }
      });

      if (!stored) {
        console.log(`[PersistentMemory] 📭 No hay memoria persistente para ${conversationKey}`);
        return null;
      }

      // Verificar si no ha expirado (30 días máximo)
      const lastUpdated = new Date(stored.lastUpdated);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      if (lastUpdated < thirtyDaysAgo) {
        console.log(`[PersistentMemory] ⏰ Memoria expirada para ${conversationKey}, eliminando...`);
        await this.deleteMemory(chatId, userId);
        return null;
      }

      // Deserializar y reconstruir memoria
      let currentProduct = undefined;
      
      // 🔥 VALIDACIÓN CRÍTICA: Parsear currentProduct con validación
      if (stored.currentProduct) {
        try {
          const parsed = JSON.parse(stored.currentProduct);
          
          // Validar que sea un objeto válido con id y name
          if (parsed && typeof parsed === 'object' && parsed.id && parsed.name) {
            currentProduct = parsed;
          } else {
            console.warn(`[PersistentMemory] ⚠️ currentProduct inválido en BD, ignorando:`, parsed);
          }
        } catch (e) {
          console.warn(`[PersistentMemory] ⚠️ Error parseando currentProduct, ignorando:`, stored.currentProduct);
        }
      }
      
      const memory: UnifiedMemory = {
        chatId: stored.chatId,
        userId: stored.userId,
        userName: stored.userName || undefined,
        currentProduct,
        productHistory: JSON.parse(stored.productHistory || '[]'),
        conversationStage: stored.conversationStage as UnifiedMemory['conversationStage'],
        messageCount: stored.messageCount,
        lastInteraction: new Date(stored.lastInteraction),
        intentions: JSON.parse(stored.intentions || '[]'),
        preferences: JSON.parse(stored.preferences || '{}'),
        budget: stored.budget ? JSON.parse(stored.budget) : undefined,
        objections: JSON.parse(stored.objections || '[]'),
        photoSent: stored.photoSent,
        paymentIntent: stored.paymentIntent,
        preferredPaymentMethod: stored.preferredPaymentMethod || undefined
      };

      console.log(`[PersistentMemory] 📖 Memoria cargada para ${conversationKey}: ${memory.messageCount} mensajes`);
      if (currentProduct) {
        console.log(`[PersistentMemory] 📦 Producto actual: ${currentProduct.name}`);
      }
      return memory;

    } catch (error) {
      console.error('[PersistentMemory] ❌ Error cargando memoria:', error);
      return null;
    }
  }

  /**
   * Elimina memoria persistente
   */
  async deleteMemory(chatId: string, userId: string): Promise<void> {
    try {
      const conversationKey = `${userId}:${chatId}`;
      await db.persistentMemory.delete({
        where: { conversationKey }
      });
      console.log(`[PersistentMemory] 🗑️ Memoria eliminada para ${conversationKey}`);
    } catch (error) {
      console.error('[PersistentMemory] ❌ Error eliminando memoria:', error);
    }
  }

  /**
   * Limpia memorias expiradas (mantenimiento)
   */
  async cleanExpiredMemories(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const result = await db.persistentMemory.deleteMany({
        where: {
          lastUpdated: {
            lt: thirtyDaysAgo
          }
        }
      });

      console.log(`[PersistentMemory] 🧹 Limpiadas ${result.count} memorias expiradas`);
      return result.count;

    } catch (error) {
      console.error('[PersistentMemory] ❌ Error limpiando memorias expiradas:', error);
      return 0;
    }
  }

  /**
   * Obtiene estadísticas de memoria persistente
   */
  async getStats(): Promise<{
    totalMemories: number;
    activeMemories: number;
    averageMessages: number;
    oldestMemory: Date | null;
    newestMemory: Date | null;
  }> {
    try {
      const memories = await db.persistentMemory.findMany({
        select: {
          messageCount: true,
          lastUpdated: true
        }
      });

      const total = memories.length;
      const active = memories.filter(m => {
        const lastUpdated = new Date(m.lastUpdated);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return lastUpdated > sevenDaysAgo;
      }).length;

      const totalMessages = memories.reduce((sum, m) => sum + m.messageCount, 0);
      const averageMessages = total > 0 ? Math.round(totalMessages / total) : 0;

      const dates = memories.map(m => new Date(m.lastUpdated));
      const oldestMemory = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
      const newestMemory = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

      return {
        totalMemories: total,
        activeMemories: active,
        averageMessages,
        oldestMemory,
        newestMemory
      };

    } catch (error) {
      console.error('[PersistentMemory] ❌ Error obteniendo estadísticas:', error);
      return {
        totalMemories: 0,
        activeMemories: 0,
        averageMessages: 0,
        oldestMemory: null,
        newestMemory: null
      };
    }
  }

  /**
   * Exporta memoria para backup/debugging
   */
  async exportMemory(chatId: string, userId: string): Promise<string | null> {
    const memory = await this.loadUnifiedMemory(chatId, userId);
    return memory ? JSON.stringify(memory, null, 2) : null;
  }

  /**
   * Importa memoria desde backup
   */
  async importMemory(chatId: string, userId: string, memoryData: string): Promise<boolean> {
    try {
      const memory: UnifiedMemory = JSON.parse(memoryData);
      await this.saveUnifiedMemory(chatId, userId, memory);
      return true;
    } catch (error) {
      console.error('[PersistentMemory] ❌ Error importando memoria:', error);
      return false;
    }
  }

  /**
   * Limpia toda la memoria unificada (para tests)
   */
  async clearUnifiedMemory(chatId: string, userId: string): Promise<void> {
    await this.deleteMemory(chatId, userId);
  }
}

// Limpiar memorias expiradas cada hora
setInterval(async () => {
  const service = PersistentMemoryService.getInstance();
  await service.cleanExpiredMemories();
}, 60 * 60 * 1000);