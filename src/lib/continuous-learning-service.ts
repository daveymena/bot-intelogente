/**
 * 🧠 Sistema de Aprendizaje Continuo
 * Aprende automáticamente de conversaciones reales usando Ollama
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const LEARNING_INTERVAL = 1000 * 60 * 30; // 30 minutos
const MIN_CONVERSATIONS = 5; // Mínimo de conversaciones para aprender

interface LearningData {
  userQuery: string;
  botResponse: string;
  productId?: string;
  productName?: string;
  context: string;
  confidence: number;
}

export class ContinuousLearningService {
  private isRunning = false;
  private learningTimer: NodeJS.Timeout | null = null;

  /**
   * Inicia el sistema de aprendizaje continuo
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️ Sistema de aprendizaje ya está corriendo');
      return;
    }

    console.log('🧠 Iniciando sistema de aprendizaje continuo...');
    this.isRunning = true;

    // Verificar Ollama
    const ollamaOk = await this.checkOllama();
    if (!ollamaOk) {
      console.log('⚠️ Ollama no disponible, aprendizaje pausado');
      return;
    }

    // Primera ejecución inmediata
    await this.learnFromConversations();

    // Programar ejecuciones periódicas
    this.learningTimer = setInterval(async () => {
      await this.learnFromConversations();
    }, LEARNING_INTERVAL);

    console.log(`✅ Sistema de aprendizaje activo (cada ${LEARNING_INTERVAL / 60000} minutos)`);
  }

  /**
   * Detiene el sistema de aprendizaje
   */
  stop() {
    if (this.learningTimer) {
      clearInterval(this.learningTimer);
      this.learningTimer = null;
    }
    this.isRunning = false;
    console.log('🛑 Sistema de aprendizaje detenido');
  }

  /**
   * Verifica si Ollama está disponible
   */
  private async checkOllama(): Promise<boolean> {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/tags`, {
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Aprende de conversaciones recientes
   */
  private async learnFromConversations() {
    try {
      console.log('\n🔍 Analizando conversaciones recientes...');

      // Obtener conversaciones de las últimas 24 horas
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const conversations = await prisma.conversation.findMany({
        where: {
          lastMessageAt: { gte: yesterday },
          status: 'ACTIVE'
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20
          },
          product: true
        },
        take: 50
      });

      if (conversations.length < MIN_CONVERSATIONS) {
        console.log(`⏳ Pocas conversaciones (${conversations.length}), esperando más datos`);
        return;
      }

      console.log(`📊 Procesando ${conversations.length} conversaciones...`);

      let learned = 0;
      let improved = 0;

      for (const conv of conversations) {
        if (conv.messages.length < 2) continue;

        // Analizar pares de pregunta-respuesta
        for (let i = 0; i < conv.messages.length - 1; i++) {
          const userMsg = conv.messages[i];
          const botMsg = conv.messages[i + 1];

          if (
            userMsg.direction === 'INCOMING' &&
            botMsg.direction === 'OUTGOING' &&
            botMsg.aiGenerated
          ) {
            // Evaluar si la respuesta fue buena
            const wasGood = await this.evaluateResponse(
              userMsg.content,
              botMsg.content,
              conv.messages.slice(i + 2, i + 4) // Siguientes mensajes
            );

            if (wasGood) {
              // Guardar en base de conocimiento
              await this.saveToKnowledgeBase({
                userQuery: userMsg.content,
                botResponse: botMsg.content,
                productId: conv.productId || undefined,
                productName: conv.productName || undefined,
                context: this.detectContext(userMsg.content),
                confidence: botMsg.confidence || 0.8
              });
              learned++;
            } else {
              // Intentar mejorar la respuesta
              const improved = await this.improveResponse(
                userMsg.content,
                botMsg.content,
                conv.product
              );
              
              if (improved) {
                await this.saveToKnowledgeBase(improved);
                improved++;
              }
            }
          }
        }
      }

      console.log(`✅ Aprendizaje completado: ${learned} guardadas, ${improved} mejoradas`);

      // Limpiar conocimiento antiguo de baja calidad
      await this.cleanupKnowledge();

    } catch (error) {
      console.error('❌ Error en aprendizaje continuo:', error);
    }
  }

  /**
   * Evalúa si una respuesta fue buena basándose en la reacción del cliente
   */
  private async evaluateResponse(
    userQuery: string,
    botResponse: string,
    nextMessages: any[]
  ): Promise<boolean> {
    // Si el cliente respondió positivamente
    const positiveWords = [
      'gracias', 'perfecto', 'excelente', 'genial', 'ok', 'vale',
      'sí', 'si', 'claro', 'bueno', 'dale', 'listo', 'entiendo'
    ];

    // Si el cliente respondió negativamente
    const negativeWords = [
      'no entiendo', 'qué', 'cómo', 'no me sirve', 'otra cosa',
      'no es eso', 'mal', 'error', 'no funciona'
    ];

    if (nextMessages.length === 0) return true; // Sin feedback = neutral

    const nextMsg = nextMessages[0]?.content?.toLowerCase() || '';

    // Respuesta positiva
    if (positiveWords.some(word => nextMsg.includes(word))) {
      return true;
    }

    // Respuesta negativa
    if (negativeWords.some(word => nextMsg.includes(word))) {
      return false;
    }

    // Si el cliente hizo una pregunta diferente = respuesta fue buena
    if (nextMsg.includes('?') && nextMsg.length > 20) {
      return true;
    }

    return true; // Por defecto, asumir que fue buena
  }

  /**
   * Mejora una respuesta usando Ollama
   */
  private async improveResponse(
    userQuery: string,
    originalResponse: string,
    product: any
  ): Promise<LearningData | null> {
    try {
      const prompt = `Eres un experto en ventas de Tecnovariedades D&S en Colombia.

Cliente preguntó: "${userQuery}"
Respuesta original: "${originalResponse}"
${product ? `Producto: ${product.name} - $${product.price.toLocaleString('es-CO')}` : ''}

Mejora la respuesta para que sea:
- Más clara y directa
- Amigable y profesional
- En español colombiano
- Máximo 3 líneas

Respuesta mejorada:`;

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma2:2b',
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 150
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) return null;

      const data = await response.json();
      const improved = data.response?.trim();

      if (!improved || improved.length < 10) return null;

      return {
        userQuery,
        botResponse: improved,
        productId: product?.id,
        productName: product?.name,
        context: this.detectContext(userQuery),
        confidence: 0.75
      };

    } catch (error) {
      console.error('Error mejorando respuesta:', error);
      return null;
    }
  }

  /**
   * Guarda conocimiento en la base de datos
   */
  private async saveToKnowledgeBase(data: LearningData) {
    try {
      // Normalizar query
      const normalizedQuery = data.userQuery.toLowerCase().trim();

      // Buscar si ya existe
      const existing = await prisma.conversationKnowledge.findFirst({
        where: {
          userQuery: normalizedQuery,
          productId: data.productId || null
        }
      });

      if (existing) {
        // Actualizar existente
        await prisma.conversationKnowledge.update({
          where: { id: existing.id },
          data: {
            botResponse: data.botResponse,
            usageCount: { increment: 1 },
            lastUsedAt: new Date(),
            confidence: Math.min(existing.confidence + 0.05, 1.0)
          }
        });
      } else {
        // Crear nuevo
        await prisma.conversationKnowledge.create({
          data: {
            userQuery: normalizedQuery,
            botResponse: data.botResponse,
            productId: data.productId,
            productName: data.productName,
            context: data.context,
            confidence: data.confidence
          }
        });
      }
    } catch (error) {
      console.error('Error guardando conocimiento:', error);
    }
  }

  /**
   * Detecta el contexto de una pregunta
   */
  private detectContext(query: string): string {
    const q = query.toLowerCase();

    if (q.includes('precio') || q.includes('cuesta') || q.includes('valor')) {
      return 'precio';
    }
    if (q.includes('pago') || q.includes('pagar') || q.includes('nequi') || q.includes('daviplata')) {
      return 'pago';
    }
    if (q.includes('envío') || q.includes('envio') || q.includes('entrega')) {
      return 'envio';
    }
    if (q.includes('garantía') || q.includes('garantia') || q.includes('devolución')) {
      return 'garantia';
    }
    if (q.includes('hola') || q.includes('buenos') || q.includes('buenas')) {
      return 'saludo';
    }
    if (q.includes('busco') || q.includes('necesito') || q.includes('quiero')) {
      return 'busqueda';
    }

    return 'general';
  }

  /**
   * Limpia conocimiento antiguo de baja calidad
   */
  private async cleanupKnowledge() {
    try {
      // Eliminar conocimiento con baja tasa de éxito y poco uso
      const deleted = await prisma.conversationKnowledge.deleteMany({
        where: {
          AND: [
            { successRate: { lt: 0.3 } },
            { usageCount: { lt: 3 } },
            { createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
          ]
        }
      });

      if (deleted.count > 0) {
        console.log(`🧹 Limpieza: ${deleted.count} entradas de baja calidad eliminadas`);
      }
    } catch (error) {
      console.error('Error en limpieza:', error);
    }
  }

  /**
   * Obtiene estadísticas del aprendizaje
   */
  async getStats() {
    try {
      const total = await prisma.conversationKnowledge.count();
      const byContext = await prisma.conversationKnowledge.groupBy({
        by: ['context'],
        _count: true
      });
      const avgConfidence = await prisma.conversationKnowledge.aggregate({
        _avg: { confidence: true }
      });

      return {
        total,
        byContext,
        avgConfidence: avgConfidence._avg.confidence || 0,
        isRunning: this.isRunning
      };
    } catch (error) {
      console.error('Error obteniendo stats:', error);
      return null;
    }
  }
}

// Singleton
export const continuousLearning = new ContinuousLearningService();
