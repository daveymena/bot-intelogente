/**
 * 💾 Servicio de Respuestas Entrenadas
 * Usa la base de conocimiento local cuando Groq falla o se queda sin tokens
 * GARANTIZA envío de imágenes de productos
 */

import { PrismaClient } from '@prisma/client';
import { ProductImageSender } from './product-image-sender';

const prisma = new PrismaClient();

export class TrainedResponseService {
  /**
   * Busca una respuesta entrenada para la pregunta del usuario
   * Retorna respuesta + información de producto para enviar imagen
   */
  async findTrainedResponse(
    userMessage: string,
    productId?: string,
    userId?: string
  ): Promise<{ response: string | null; product?: any; shouldSendImage?: boolean }> {
    try {
      const normalized = userMessage.toLowerCase().trim();

      // 1. Búsqueda exacta
      let knowledge = await prisma.conversationKnowledge.findFirst({
        where: {
          userQuery: normalized,
          productId: productId || null
        },
        orderBy: {
          confidence: 'desc'
        }
      });

      if (knowledge) {
        await this.updateUsage(knowledge.id, true);
        return knowledge.botResponse;
      }

      // 2. Búsqueda por similitud (palabras clave)
      knowledge = await this.findSimilar(normalized, productId);

      if (knowledge) {
        await this.updateUsage(knowledge.id, true);
        return knowledge.botResponse;
      }

      // 3. Búsqueda por contexto
      const context = this.detectContext(normalized);
      knowledge = await prisma.conversationKnowledge.findFirst({
        where: {
          context,
          productId: productId || null,
          confidence: { gte: 0.7 }
        },
        orderBy: [
          { successRate: 'desc' },
          { usageCount: 'desc' }
        ]
      });

      if (knowledge) {
        await this.updateUsage(knowledge.id, false);
        return knowledge.botResponse;
      }

      return null;

    } catch (error) {
      console.error('Error buscando respuesta entrenada:', error);
      return null;
    }
  }

  /**
   * Busca respuestas similares usando palabras clave
   */
  private async findSimilar(query: string, productId?: string): Promise<any | null> {
    try {
      // Extraer palabras clave
      const keywords = this.extractKeywords(query);
      if (keywords.length === 0) return null;

      // Buscar respuestas que contengan las palabras clave
      const allKnowledge = await prisma.conversationKnowledge.findMany({
        where: {
          productId: productId || null,
          confidence: { gte: 0.6 }
        },
        orderBy: {
          successRate: 'desc'
        },
        take: 100
      });

      // Calcular similitud
      let bestMatch: any = null;
      let bestScore = 0;

      for (const knowledge of allKnowledge) {
        const score = this.calculateSimilarity(query, knowledge.userQuery, keywords);
        if (score > bestScore && score > 0.6) {
          bestScore = score;
          bestMatch = knowledge;
        }
      }

      return bestMatch;

    } catch (error) {
      return null;
    }
  }

  /**
   * Calcula similitud entre dos textos
   */
  private calculateSimilarity(text1: string, text2: string, keywords: string[]): number {
    let score = 0;
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);

    // Palabras clave coincidentes
    for (const keyword of keywords) {
      if (words2.includes(keyword)) {
        score += 0.3;
      }
    }

    // Palabras comunes
    const commonWords = words1.filter(w => words2.includes(w));
    score += (commonWords.length / Math.max(words1.length, words2.length)) * 0.7;

    return Math.min(score, 1.0);
  }

  /**
   * Extrae palabras clave de una pregunta
   */
  private extractKeywords(text: string): string[] {
    const stopWords = [
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
      'de', 'del', 'a', 'al', 'en', 'con', 'por', 'para',
      'que', 'qué', 'como', 'cómo', 'cuando', 'cuándo',
      'es', 'son', 'está', 'están', 'hay', 'tiene', 'tienen',
      'me', 'te', 'se', 'le', 'lo', 'la', 'mi', 'tu', 'su'
    ];

    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
  }

  /**
   * Detecta el contexto de una pregunta
   */
  private detectContext(query: string): string {
    const q = query.toLowerCase();

    if (q.includes('hola') || q.includes('buenos') || q.includes('buenas')) {
      return 'saludo';
    }
    if (q.includes('precio') || q.includes('cuesta') || q.includes('valor') || q.includes('cuánto')) {
      return 'precio';
    }
    if (q.includes('pago') || q.includes('pagar') || q.includes('nequi') || q.includes('daviplata')) {
      return 'pago';
    }
    if (q.includes('envío') || q.includes('envio') || q.includes('entrega') || q.includes('domicilio')) {
      return 'envio';
    }
    if (q.includes('garantía') || q.includes('garantia') || q.includes('devolución')) {
      return 'garantia';
    }
    if (q.includes('disponible') || q.includes('hay') || q.includes('tienen') || q.includes('stock')) {
      return 'disponibilidad';
    }
    if (q.includes('características') || q.includes('caracteristicas') || q.includes('incluye') || q.includes('trae')) {
      return 'caracteristicas';
    }
    if (q.includes('busco') || q.includes('necesito') || q.includes('quiero')) {
      return 'busqueda_producto';
    }

    return 'general';
  }

  /**
   * Actualiza estadísticas de uso
   */
  private async updateUsage(knowledgeId: string, exactMatch: boolean) {
    try {
      await prisma.conversationKnowledge.update({
        where: { id: knowledgeId },
        data: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date(),
          // Incrementar confianza si fue match exacto
          confidence: exactMatch
            ? { increment: 0.01 }
            : undefined
        }
      });
    } catch (error) {
      // Ignorar errores de actualización
    }
  }

  /**
   * Obtiene estadísticas de la base de conocimiento
   */
  async getKnowledgeStats() {
    try {
      const total = await prisma.conversationKnowledge.count();
      const byContext = await prisma.conversationKnowledge.groupBy({
        by: ['context'],
        _count: true,
        _avg: {
          confidence: true,
          successRate: true
        }
      });

      const topUsed = await prisma.conversationKnowledge.findMany({
        orderBy: { usageCount: 'desc' },
        take: 10,
        select: {
          userQuery: true,
          usageCount: true,
          successRate: true,
          context: true
        }
      });

      return {
        total,
        byContext,
        topUsed
      };
    } catch (error) {
      console.error('Error obteniendo stats:', error);
      return null;
    }
  }

  /**
   * Limpia conocimiento de baja calidad
   */
  async cleanupLowQuality() {
    try {
      const deleted = await prisma.conversationKnowledge.deleteMany({
        where: {
          AND: [
            { successRate: { lt: 0.3 } },
            { usageCount: { lt: 2 } },
            { confidence: { lt: 0.5 } }
          ]
        }
      });

      return deleted.count;
    } catch (error) {
      console.error('Error limpiando conocimiento:', error);
      return 0;
    }
  }
}

export const trainedResponseService = new TrainedResponseService();
