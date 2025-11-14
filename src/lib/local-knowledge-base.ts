/**
 * 🧠 BASE DE CONOCIMIENTO LOCAL
 * Sistema de aprendizaje que guarda conversaciones exitosas
 * y las reutiliza cuando las APIs externas no están disponibles
 */

import { db } from './db';

interface KnowledgeEntry {
  id: string;
  userQuery: string;
  botResponse: string;
  productId?: string;
  productName?: string;
  context: string;
  confidence: number;
  usageCount: number;
  successRate: number;
  createdAt: Date;
  lastUsedAt: Date;
}

export class LocalKnowledgeBase {
  private static cache: Map<string, KnowledgeEntry> = new Map();
  private static initialized = false;

  /**
   * Inicializar la base de conocimiento
   */
  static async initialize() {
    if (this.initialized) return;

    console.log('[KnowledgeBase] 🧠 Inicializando base de conocimiento local...');

    try {
      // Cargar conocimiento existente desde la base de datos
      const entries = await db.conversationKnowledge.findMany({
        orderBy: { successRate: 'desc' },
        take: 1000 // Cargar las 1000 mejores respuestas
      });

      entries.forEach(entry => {
        this.cache.set(entry.id, {
          id: entry.id,
          userQuery: entry.userQuery,
          botResponse: entry.botResponse,
          productId: entry.productId || undefined,
          productName: entry.productName || undefined,
          context: entry.context,
          confidence: entry.confidence,
          usageCount: entry.usageCount,
          successRate: entry.successRate,
          createdAt: entry.createdAt,
          lastUsedAt: entry.lastUsedAt
        });
      });

      console.log(`[KnowledgeBase] ✅ ${entries.length} entradas cargadas en memoria`);
      this.initialized = true;
    } catch (error) {
      console.error('[KnowledgeBase] ⚠️ Error inicializando (tabla no existe aún):', error);
      // No es crítico, la tabla se creará cuando se guarde la primera entrada
      this.initialized = true;
    }
  }

  /**
   * Buscar respuesta en la base de conocimiento local
   */
  static async findSimilarResponse(params: {
    userQuery: string;
    productId?: string;
    context?: string;
  }): Promise<{ response: string; confidence: number } | null> {
    await this.initialize();

    const { userQuery, productId, context } = params;
    // Normalizar acentos para comparación consistente
    const queryLower = userQuery.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .trim();

    console.log('[KnowledgeBase] 🔍 Buscando respuesta similar para:', queryLower.substring(0, 50));

    // Buscar coincidencias exactas o muy similares
    let bestMatch: KnowledgeEntry | null = null;
    let bestScore = 0;

    for (const entry of this.cache.values()) {
      let score = 0;

      // Normalizar consulta de la entrada también
      const entryQueryLower = entry.userQuery.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Quitar acentos

      // Coincidencia exacta
      if (entryQueryLower === queryLower) {
        score += 100;
      }
      // Contiene la consulta completa
      else if (entryQueryLower.includes(queryLower) || queryLower.includes(entryQueryLower)) {
        score += 80;
      }
      // Palabras clave en común
      else {
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
        const entryWords = entryQueryLower.split(/\s+/).filter(w => w.length > 3);
        const commonWords = queryWords.filter(w => entryWords.includes(w));

        // CRITICO: Si las palabras clave específicas NO coinciden, penalizar fuertemente
        const specificKeywords = ['piano', 'guitarra', 'ingles', 'frances', 'diseño', 'programacion', 'marketing', 'musica', 'fotografia', 'video'];
        const queryHasSpecific = specificKeywords.some(kw => queryLower.includes(kw));
        const entryHasSpecific = specificKeywords.some(kw => entryQueryLower.includes(kw));

        if (queryHasSpecific && entryHasSpecific) {
          // Ambos tienen palabras específicas, deben coincidir
          const querySpecific = specificKeywords.find(kw => queryLower.includes(kw));
          const entrySpecific = specificKeywords.find(kw => entryQueryLower.includes(kw));

          if (querySpecific !== entrySpecific) {
            // Palabras específicas diferentes (ej: piano vs inglés)
            score = 0; // Descalificar completamente
            continue;
          }
        }

        score += (commonWords.length / queryWords.length) * 60;
      }

      // Bonus si el producto coincide
      if (productId && entry.productId === productId) {
        score += 30;
      }

      // Bonus por tasa de éxito
      score += entry.successRate * 10;

      // Bonus por uso frecuente
      score += Math.min(entry.usageCount / 10, 10);

      if (score > bestScore && score > 50) { // Umbral mínimo de 50
        bestScore = score;
        bestMatch = entry;
      }
    }

    if (bestMatch) {
      console.log(`[KnowledgeBase] ✅ Respuesta encontrada (score: ${bestScore.toFixed(0)})`);
      console.log(`   Consulta original: "${bestMatch.userQuery}"`);
      console.log(`   Usado ${bestMatch.usageCount} veces, éxito: ${(bestMatch.successRate * 100).toFixed(0)}%`);

      // Actualizar estadísticas de uso
      await this.updateUsageStats(bestMatch.id);

      return {
        response: bestMatch.botResponse,
        confidence: Math.min(bestScore / 100, 0.95) // Max 95% de confianza
      };
    }

    console.log('[KnowledgeBase] ❌ No se encontró respuesta similar');
    return null;
  }

  /**
   * Guardar nueva respuesta exitosa en la base de conocimiento
   */
  static async saveSuccessfulResponse(params: {
    userQuery: string;
    botResponse: string;
    productId?: string;
    productName?: string;
    context?: string;
    confidence: number;
  }) {
    await this.initialize();

    const { userQuery, botResponse, productId, productName, context, confidence } = params;

    // Normalizar consulta para almacenamiento consistente
    const normalizedQuery = userQuery.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .trim();

    // No guardar respuestas de error o muy cortas
    if (botResponse.length < 20 ||
        botResponse.includes('problema procesando') ||
        botResponse.includes('alta demanda') ||
        confidence < 0.5) {
      return;
    }

    console.log('[KnowledgeBase] 💾 Guardando respuesta exitosa...');

    try {
      // Verificar si ya existe una entrada similar
      const existing = await db.conversationKnowledge.findFirst({
        where: {
          userQuery: normalizedQuery,
          productId: productId || null
        }
      });

      if (existing) {
        // Actualizar entrada existente
        await db.conversationKnowledge.update({
          where: { id: existing.id },
          data: {
            botResponse, // Actualizar con la respuesta más reciente
            confidence: Math.max(existing.confidence, confidence),
            usageCount: existing.usageCount + 1,
            successRate: (existing.successRate * existing.usageCount + 1) / (existing.usageCount + 1),
            lastUsedAt: new Date()
          }
        });

        console.log('[KnowledgeBase] ✅ Entrada actualizada');
      } else {
        // Crear nueva entrada
        const newEntry = await db.conversationKnowledge.create({
          data: {
            userQuery: normalizedQuery,
            botResponse,
            productId: productId || null,
            productName: productName || null,
            context: context || 'general',
            confidence,
            usageCount: 1,
            successRate: 1.0,
            createdAt: new Date(),
            lastUsedAt: new Date()
          }
        });

        // Agregar al caché
        this.cache.set(newEntry.id, {
          id: newEntry.id,
          userQuery: normalizedQuery, // Usar consulta normalizada en caché
          botResponse: newEntry.botResponse,
          productId: newEntry.productId || undefined,
          productName: newEntry.productName || undefined,
          context: newEntry.context,
          confidence: newEntry.confidence,
          usageCount: newEntry.usageCount,
          successRate: newEntry.successRate,
          createdAt: newEntry.createdAt,
          lastUsedAt: newEntry.lastUsedAt
        });

        console.log('[KnowledgeBase] ✅ Nueva entrada creada');
      }
    } catch (error) {
      console.error('[KnowledgeBase] ❌ Error guardando:', error);
    }
  }

  /**
   * Actualizar estadísticas de uso
   */
  private static async updateUsageStats(entryId: string) {
    try {
      await db.conversationKnowledge.update({
        where: { id: entryId },
        data: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date()
        }
      });

      // Actualizar caché
      const cached = this.cache.get(entryId);
      if (cached) {
        cached.usageCount++;
        cached.lastUsedAt = new Date();
      }
    } catch (error) {
      console.error('[KnowledgeBase] Error actualizando stats:', error);
    }
  }

  /**
   * Marcar respuesta como exitosa (feedback positivo)
   */
  static async markAsSuccessful(entryId: string) {
    try {
      const entry = await db.conversationKnowledge.findUnique({
        where: { id: entryId }
      });

      if (entry) {
        const newSuccessRate = (entry.successRate * entry.usageCount + 1) / (entry.usageCount + 1);
        
        await db.conversationKnowledge.update({
          where: { id: entryId },
          data: { successRate: newSuccessRate }
        });

        // Actualizar caché
        const cached = this.cache.get(entryId);
        if (cached) {
          cached.successRate = newSuccessRate;
        }
      }
    } catch (error) {
      console.error('[KnowledgeBase] Error marcando como exitosa:', error);
    }
  }

  /**
   * Obtener estadísticas de la base de conocimiento
   */
  static async getStats() {
    await this.initialize();

    const totalEntries = this.cache.size;
    const avgSuccessRate = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.successRate, 0) / totalEntries;
    const totalUsage = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.usageCount, 0);

    return {
      totalEntries,
      avgSuccessRate,
      totalUsage,
      cacheSize: this.cache.size
    };
  }

  /**
   * Limpiar entradas con baja tasa de éxito
   */
  static async cleanLowQualityEntries() {
    console.log('[KnowledgeBase] 🧹 Limpiando entradas de baja calidad...');

    try {
      const deleted = await db.conversationKnowledge.deleteMany({
        where: {
          OR: [
            { successRate: { lt: 0.3 } }, // Menos de 30% de éxito
            { usageCount: { lt: 2 }, createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // Poco usadas y antiguas
          ]
        }
      });

      console.log(`[KnowledgeBase] ✅ ${deleted.count} entradas eliminadas`);

      // Recargar caché
      this.cache.clear();
      this.initialized = false;
      await this.initialize();
    } catch (error) {
      console.error('[KnowledgeBase] Error limpiando:', error);
    }
  }
}
