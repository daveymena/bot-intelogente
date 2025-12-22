/**
 * Sistema de memoria de contexto mejorado
 * Mantiene el contexto del producto incluso cuando el usuario hace preguntas generales
 */

import { db } from '@/lib/db';

interface ProductContext {
  productId: string;
  productName: string;
  price: number;
  category: string;
  timestamp: Date;
  conversationTurns: number; // Cuántos mensajes han pasado desde que se mencionó
}

interface ConversationMemory {
  userId: string;
  botUserId: string;
  currentProduct: ProductContext | null;
  previousProducts: ProductContext[];
  lastIntent: string;
  conversationStage: 'discovery' | 'interest' | 'consideration' | 'purchase';
}

// Memoria en RAM (rápida)
const memoryCache = new Map<string, ConversationMemory>();

export class ContextMemoryEnhanced {
  /**
   * Guarda el producto en contexto con timestamp
   */
  static async saveProductContext(
    botUserId: string,
    userId: string,
    productId: string,
    productName: string,
    price: number,
    category: string
  ): Promise<void> {
    const key = `${botUserId}:${userId}`;
    
    const existing = memoryCache.get(key);
    const newProduct: ProductContext = {
      productId,
      productName,
      price,
      category,
      timestamp: new Date(),
      conversationTurns: 0
    };

    if (existing) {
      // Mover producto actual a historial si existe
      if (existing.currentProduct) {
        existing.previousProducts.unshift(existing.currentProduct);
        // Mantener solo últimos 3 productos
        existing.previousProducts = existing.previousProducts.slice(0, 3);
      }
      
      existing.currentProduct = newProduct;
      memoryCache.set(key, existing);
    } else {
      memoryCache.set(key, {
        userId,
        botUserId,
        currentProduct: newProduct,
        previousProducts: [],
        lastIntent: 'busqueda_producto',
        conversationStage: 'interest'
      });
    }

    console.log(`[ContextMemory] ✅ Producto guardado: ${productName}`);
    console.log(`[ContextMemory] 📦 ID: ${productId}`);
    console.log(`[ContextMemory] 💰 Precio: ${price}`);
  }

  /**
   * Obtiene el producto actual del contexto
   * IMPORTANTE: No se borra automáticamente, persiste durante la conversación
   */
  static async getCurrentProduct(
    botUserId: string,
    userId: string
  ): Promise<ProductContext | null> {
    const key = `${botUserId}:${userId}`;
    const memory = memoryCache.get(key);

    if (!memory || !memory.currentProduct) {
      console.log(`[ContextMemory] ❌ No hay producto en contexto`);
      return null;
    }

    // Incrementar contador de turnos
    memory.currentProduct.conversationTurns++;

    // Si han pasado más de 10 mensajes sin mencionar el producto, considerar expirado
    if (memory.currentProduct.conversationTurns > 10) {
      console.log(`[ContextMemory] ⚠️ Producto expirado (10+ turnos)`);
      return null;
    }

    // Si han pasado más de 30 minutos, considerar expirado
    const minutosTranscurridos = (Date.now() - memory.currentProduct.timestamp.getTime()) / 1000 / 60;
    if (minutosTranscurridos > 30) {
      console.log(`[ContextMemory] ⚠️ Producto expirado (30+ minutos)`);
      return null;
    }

    console.log(`[ContextMemory] ✅ Producto en contexto: ${memory.currentProduct.productName}`);
    console.log(`[ContextMemory] 🔄 Turnos: ${memory.currentProduct.conversationTurns}`);
    console.log(`[ContextMemory] ⏱️ Minutos: ${Math.round(minutosTranscurridos)}`);

    return memory.currentProduct;
  }

  /**
   * Refresca el contexto del producto (resetea contador de turnos)
   * Usar cuando el usuario menciona explícitamente el producto
   */
  static async refreshProductContext(
    botUserId: string,
    userId: string
  ): Promise<void> {
    const key = `${botUserId}:${userId}`;
    const memory = memoryCache.get(key);

    if (memory && memory.currentProduct) {
      memory.currentProduct.conversationTurns = 0;
      memory.currentProduct.timestamp = new Date();
      console.log(`[ContextMemory] 🔄 Contexto refrescado: ${memory.currentProduct.productName}`);
    }
  }

  /**
   * Actualiza la etapa de la conversación
   */
  static async updateConversationStage(
    botUserId: string,
    userId: string,
    stage: 'discovery' | 'interest' | 'consideration' | 'purchase',
    intent: string
  ): Promise<void> {
    const key = `${botUserId}:${userId}`;
    const memory = memoryCache.get(key);

    if (memory) {
      memory.conversationStage = stage;
      memory.lastIntent = intent;
      console.log(`[ContextMemory] 📊 Etapa actualizada: ${stage} (${intent})`);
    }
  }

  /**
   * Obtiene el historial de productos vistos
   */
  static async getProductHistory(
    botUserId: string,
    userId: string
  ): Promise<ProductContext[]> {
    const key = `${botUserId}:${userId}`;
    const memory = memoryCache.get(key);

    if (!memory) return [];

    const history: ProductContext[] = [];
    if (memory.currentProduct) history.push(memory.currentProduct);
    history.push(...memory.previousProducts);

    return history;
  }

  /**
   * Limpia el contexto (usar con cuidado)
   */
  static async clearContext(
    botUserId: string,
    userId: string
  ): Promise<void> {
    const key = `${botUserId}:${userId}`;
    memoryCache.delete(key);
    console.log(`[ContextMemory] 🗑️ Contexto limpiado`);
  }

  /**
   * Obtiene estadísticas de memoria
   */
  static getStats(): {
    totalConversations: number;
    activeProducts: number;
  } {
    let activeProducts = 0;
    
    memoryCache.forEach(memory => {
      if (memory.currentProduct) activeProducts++;
    });

    return {
      totalConversations: memoryCache.size,
      activeProducts
    };
  }
}
