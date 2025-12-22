/**
 * 🧠 SISTEMA HÍBRIDO DE APRENDIZAJE INTELIGENTE MEJORADO
 * 
 * NUEVO: Integración completa con:
 * - Memoria persistente (30 días)
 * - Validación de productos (solo sugiere lo que existe)
 * - Metodología AIDA (respuestas profesionales de ventas)
 * - Selector inteligente (3 opciones vs producto específico)
 * 
 * Flujo:
 * 1. Recuperar memoria persistente
 * 2. Validar productos contra BD
 * 3. Generar respuesta con AIDA
 * 4. Si no sabe -> IA externa
 * 5. Validar respuesta de IA
 * 6. Aprender y guardar
 * 7. Actualizar memoria persistente
 * 
 * Resultado: Bot profesional que nunca olvida y siempre valida
 */

import { db } from './db';
import { GroqService } from './groq-service';
import { OllamaService } from './ollama-service';
import { LocalKnowledgeBase } from './local-knowledge-base';
import { PersistentMemoryManager } from './persistent-memory-manager';
import { ProductValidator } from './product-validator';
import { AidaResponseGenerator } from './aida-response-generator';
import { IntelligentResponseSelector } from './intelligent-response-selector';

interface LearningResponse {
  text: string;
  confidence: number;
  source: 'local' | 'groq' | 'ollama';
  learned: boolean;
}

export class HybridLearningSystem {
  private static learningThreshold = 0.7; // Confianza mínima para responder local
  private static maxLocalAttempts = 3; // Intentos antes de ir a IA externa

  /**
   * Procesa mensaje con sistema híbrido inteligente MEJORADO
   */
  static async processWithLearning(params: {
    message: string;
    context: any;
    chatId: string;
    userId: string;
    intent: string;
    productId?: string;
  }): Promise<LearningResponse> {
    const { message, context, chatId, userId, intent, productId } = params;

    console.log('\n🧠 [HYBRID LEARNING ENHANCED] Procesando mensaje...');
    console.log(`📝 Mensaje: "${message.substring(0, 50)}..."`);
    console.log(`🎯 Intent: ${intent}`);

    // PASO 0: Recuperar/actualizar memoria persistente
    await PersistentMemoryManager.incrementMessageCount(chatId, userId);
    const memory = await PersistentMemoryManager.getMemory(chatId, userId);

    // 🦙 Si FORCE_AI_FOR_ALL está activado, saltar respuestas locales
    if (process.env.FORCE_AI_FOR_ALL === 'true') {
      console.log('🦙 [FORCE_AI] Saltando respuestas locales - Usando Ollama directamente');
      // Ir directo a consultar IA externa (Ollama)
      const aiResponse = await this.consultExternalAI(message, context, productId, userId);
      
      if (aiResponse) {
        console.log(`✅ [OLLAMA] Respuesta obtenida: "${aiResponse.text.substring(0, 100)}..."`);
        
        // Aprender de la respuesta
        await this.learnFromAI({
          userQuery: message,
          aiResponse: aiResponse.text,
          context: context,
          productId: productId,
          confidence: aiResponse.confidence
        });
        
        return {
          text: aiResponse.text,
          confidence: aiResponse.confidence,
          source: aiResponse.source,
          learned: true
        };
      }
    }

    // PASO 1: Usar selector inteligente (valida productos + AIDA)
    try {
      const intelligentResponse = await IntelligentResponseSelector.selectResponse({
        message,
        chatId,
        userId,
        intent,
        currentProduct: context.currentProduct || memory.currentProduct
      });

      if (intelligentResponse.confidence >= this.learningThreshold) {
        console.log(`✅ [INTELLIGENT] Respuesta generada con ${intelligentResponse.responseType}`);
        console.log(`📊 Confianza: ${(intelligentResponse.confidence * 100).toFixed(0)}%`);
        
        // Actualizar memoria persistente con productos
        if (intelligentResponse.products.length > 0) {
          const mainProduct = intelligentResponse.products[0];
          await PersistentMemoryManager.setCurrentProduct(chatId, userId, {
            id: mainProduct.id,
            name: mainProduct.name,
            price: mainProduct.price,
            category: mainProduct.category
          });
        }
        
        return {
          text: intelligentResponse.text,
          confidence: intelligentResponse.confidence,
          source: 'local',
          learned: false
        };
      }
    } catch (error) {
      console.error('⚠️ [INTELLIGENT] Error en selector inteligente:', error);
    }

    // PASO 2: Intentar con conocimiento local
    const localResponse = await this.tryLocalKnowledge(message, context, productId);

    if (localResponse && localResponse.confidence >= this.learningThreshold) {
      console.log('✅ [LOCAL] Respondido con conocimiento local');
      console.log(`📊 Confianza: ${(localResponse.confidence * 100).toFixed(0)}%`);
      
      return {
        text: localResponse.response,
        confidence: localResponse.confidence,
        source: 'local',
        learned: false
      };
    }

    console.log('⚠️ [LOCAL] Confianza baja o sin respuesta');
    console.log('🔄 [FALLBACK] Consultando IA externa...');

    // PASO 3: Consultar IA externa para aprender
    const aiResponse = await this.consultExternalAI(message, context, productId, userId);

    if (!aiResponse) {
      console.log('❌ [AI] No se pudo obtener respuesta de IA externa');
      return {
        text: 'Disculpa, no tengo información sobre eso en este momento. ¿Podrías ser más específico?',
        confidence: 0.3,
        source: 'local',
        learned: false
      };
    }

    console.log('✅ [AI] Respuesta obtenida de IA externa');
    console.log(`📝 Respuesta: "${aiResponse.text.substring(0, 100)}..."`);

    // PASO 4: VALIDAR respuesta de IA contra BD
    const validatedResponse = await this.validateAIResponse(aiResponse.text, userId);

    // PASO 5: APRENDER de la respuesta validada
    await this.learnFromAI({
      userQuery: message,
      aiResponse: validatedResponse,
      context: context,
      productId: productId,
      confidence: aiResponse.confidence
    });

    console.log('🎓 [LEARNING] Conocimiento guardado para futuras consultas');

    return {
      text: validatedResponse,
      confidence: aiResponse.confidence,
      source: aiResponse.source,
      learned: true
    };
  }

  /**
   * Intenta responder con conocimiento local
   */
  private static async tryLocalKnowledge(
    message: string,
    context: any,
    productId?: string
  ): Promise<{ response: string; confidence: number } | null> {
    try {
      // Buscar en base de conocimiento local
      const knowledgeResponse = await LocalKnowledgeBase.findSimilarResponse({
        userQuery: message,
        productId: productId,
        context: JSON.stringify(context)
      });

      if (knowledgeResponse) {
        return {
          response: knowledgeResponse.response,
          confidence: knowledgeResponse.confidence
        };
      }

      // Buscar patrones similares en conversaciones anteriores
      const similarConversations = await db.conversationKnowledge.findMany({
        where: {
          OR: [
            { userQuery: { contains: message.toLowerCase() } },
            { context: { contains: message.toLowerCase() } }
          ],
          successRate: { gte: 0.7 }
        },
        orderBy: { confidence: 'desc' },
        take: 5
      });

      if (similarConversations.length > 0) {
        const best = similarConversations[0];
        return {
          response: best.botResponse,
          confidence: best.confidence
        };
      }

      return null;
    } catch (error) {
      console.error('[LOCAL] Error buscando conocimiento:', error);
      return null;
    }
  }

  /**
   * NUEVO: Validar respuesta de IA contra base de datos
   */
  private static async validateAIResponse(aiResponse: string, userId: string): Promise<string> {
    try {
      // Buscar menciones de productos en la respuesta
      const productMentions = this.extractProductMentions(aiResponse);
      
      if (productMentions.length === 0) {
        return aiResponse; // No menciona productos, respuesta válida
      }

      console.log(`🔍 [VALIDATOR] Validando ${productMentions.length} productos mencionados`);

      // Validar cada producto mencionado
      const validProducts = await ProductValidator.validateProductNames(productMentions, userId);

      if (validProducts.length === productMentions.length) {
        console.log('✅ [VALIDATOR] Todos los productos son válidos');
        return aiResponse; // Todos los productos existen
      }

      // Algunos productos no existen, corregir respuesta
      console.log(`⚠️ [VALIDATOR] ${productMentions.length - validProducts.length} productos no válidos`);
      
      if (validProducts.length > 0) {
        // Generar respuesta con productos válidos usando AIDA
        const aidaResponse = AidaResponseGenerator.generateMultiOption(validProducts);
        return aidaResponse.text;
      }

      // Ningún producto válido
      return 'Lo siento, no tengo esos productos disponibles en este momento. ¿Te gustaría ver otras opciones? 😊';
    } catch (error) {
      console.error('❌ [VALIDATOR] Error validando respuesta:', error);
      return aiResponse; // Retornar respuesta original si hay error
    }
  }

  /**
   * Extraer menciones de productos de un texto
   */
  private static extractProductMentions(text: string): string[] {
    const mentions: string[] = [];
    
    // Buscar patrones comunes de productos
    const patterns = [
      /(?:laptop|portátil|computador)\s+[\w\s]+/gi,
      /(?:moto|motocicleta)\s+[\w\s]+/gi,
      /(?:curso|megapack)\s+[\w\s]+/gi,
      /[A-Z][a-z]+\s+[A-Z0-9][\w\s]+/g // Marca + Modelo
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        mentions.push(...matches.map(m => m.trim()));
      }
    }

    return [...new Set(mentions)]; // Eliminar duplicados
  }

  /**
   * Consulta IA externa (Groq o Ollama) cuando el bot local no sabe
   */
  private static async consultExternalAI(
    message: string,
    context: any,
    productId?: string,
    userId?: string
  ): Promise<{ text: string; confidence: number; source: 'groq' | 'ollama' } | null> {
    // Construir prompt que ayude a la IA a entender el contexto
    const systemPrompt = this.buildLearningPrompt(context, productId);
    const messages = [
      { role: 'user', content: message }
    ];

    // 🦙 PRIORIDAD 1: Intentar con Ollama (GRATIS, sin límites)
    try {
      console.log('🦙 [OLLAMA] Consultando Ollama...');
      const ollamaResponse = await OllamaService.generateResponse({
        systemPrompt,
        messages
      });

      if (ollamaResponse) {
        console.log('✅ [OLLAMA] Respuesta obtenida de Ollama');
        return {
          text: ollamaResponse.text,
          confidence: ollamaResponse.confidence || 0.8,
          source: 'ollama'
        };
      }
    } catch (error: any) {
      console.log(`⚠️ [OLLAMA] Error: ${error.message}`);
      console.log('🔄 [FALLBACK] Ollama no disponible, intentando con Groq...');
    }

    // PRIORIDAD 2: Fallback a Groq (solo si Ollama falla)
    if (process.env.GROQ_API_KEY) {
      try {
        console.log('🔄 [GROQ] Usando Groq como fallback...');
        const groqResponse = await GroqService.generateResponse({
          systemPrompt,
          messages
        });

        if (groqResponse) {
          console.log('✅ [GROQ] Respuesta obtenida de Groq (fallback)');
          return {
            text: groqResponse.text,
            confidence: groqResponse.confidence || 0.85,
            source: 'groq'
          };
        }
      } catch (error: any) {
        console.log(`❌ [GROQ] Error: ${error.message}`);
      }
    } else {
      console.log('⚠️ [GROQ] API key no configurada (desactivado)');
    }

    return null;
  }

  /**
   * Construye prompt especializado para que la IA entienda el contexto
   */
  private static buildLearningPrompt(context: any, productId?: string): string {
    let prompt = `Eres un asistente de ventas experto. Tu trabajo es ayudar al cliente con información precisa y útil.

CONTEXTO ACTUAL:
- Producto en discusión: ${context.currentProduct?.name || 'Ninguno específico'}
- Categoría: ${context.currentProduct?.category || 'General'}
- Precio: ${context.currentProduct?.price ? `$${context.currentProduct.price.toLocaleString('es-CO')} COP` : 'No especificado'}
- Historial reciente: ${context.messages?.slice(-3).map((m: any) => `${m.role}: ${m.content}`).join('\n') || 'Sin historial'}

INSTRUCCIONES:
1. Responde de forma clara y concisa
2. Si preguntan por un producto, da información específica
3. Si no tienes información exacta, sé honesto
4. Mantén un tono amigable y profesional
5. Si es una pregunta sobre precio/disponibilidad, usa la información del contexto

IMPORTANTE: Tu respuesta será guardada para futuras consultas similares, así que asegúrate de que sea precisa y útil.`;

    return prompt;
  }

  /**
   * APRENDE de la respuesta de la IA externa
   */
  private static async learnFromAI(params: {
    userQuery: string;
    aiResponse: string;
    context: any;
    productId?: string;
    confidence: number;
  }) {
    const { userQuery, aiResponse, context, productId, confidence } = params;

    try {
      // Guardar en base de conocimiento local
      await LocalKnowledgeBase.saveSuccessfulResponse({
        userQuery: userQuery.toLowerCase().trim(),
        botResponse: aiResponse,
        productId: productId,
        productName: context.currentProduct?.name,
        context: JSON.stringify({
          category: context.currentProduct?.category,
          price: context.currentProduct?.price,
          timestamp: new Date().toISOString()
        }),
        confidence: confidence
      });

      // Extraer patrones de la respuesta para aprendizaje futuro
      await this.extractAndSavePatterns(userQuery, aiResponse, context);

      console.log('💾 [LEARNING] Conocimiento guardado exitosamente');
    } catch (error) {
      console.error('❌ [LEARNING] Error guardando conocimiento:', error);
    }
  }

  /**
   * Extrae patrones de la interacción para mejorar respuestas futuras
   */
  private static async extractAndSavePatterns(
    userQuery: string,
    aiResponse: string,
    context: any
  ) {
    try {
      // Identificar palabras clave en la consulta
      const keywords = this.extractKeywords(userQuery);
      
      // Identificar tipo de consulta
      const queryType = this.identifyQueryType(userQuery);

      // Guardar patrón para matching futuro
      await db.conversationPattern.upsert({
        where: {
          pattern: userQuery.toLowerCase().trim()
        },
        create: {
          pattern: userQuery.toLowerCase().trim(),
          queryType: queryType,
          keywords: keywords.join(','),
          responseTemplate: aiResponse,
          confidence: 0.8,
          usageCount: 1,
          successRate: 1.0,
          createdAt: new Date(),
          lastUsedAt: new Date()
        },
        update: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date()
        }
      });

      console.log(`🎯 [PATTERN] Patrón guardado: ${queryType}`);
      console.log(`🔑 [KEYWORDS] ${keywords.join(', ')}`);
    } catch (error) {
      // Silent fail - no es crítico
      console.error('⚠️ [PATTERN] Error guardando patrón:', error);
    }
  }

  /**
   * Extrae palabras clave relevantes
   */
  private static extractKeywords(text: string): string[] {
    const stopWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese', 'la', 'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando', 'él', 'muy', 'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre', 'mi', 'alguno', 'mismo', 'yo', 'también', 'hasta', 'año', 'dos', 'querer', 'entre', 'así', 'primero', 'desde', 'grande', 'eso', 'ni', 'nos', 'llegar', 'pasar', 'tiempo', 'ella', 'sí', 'día', 'uno', 'bien', 'poco', 'deber', 'entonces', 'poner', 'cosa', 'tanto', 'hombre', 'parecer', 'nuestro', 'tan', 'donde', 'ahora', 'parte', 'después', 'vida', 'quedar', 'siempre', 'creer', 'hablar', 'llevar', 'dejar', 'nada', 'cada', 'seguir', 'menos', 'nuevo', 'encontrar', 'algo', 'solo', 'decir', 'salir', 'volver', 'tomar', 'conocer', 'vivir', 'sentir', 'tratar', 'mirar', 'contar', 'empezar', 'esperar', 'buscar', 'existir', 'entrar', 'trabajar', 'escribir', 'perder', 'producir', 'ocurrir', 'entender', 'pedir', 'recibir', 'recordar', 'terminar', 'permitir', 'aparecer', 'conseguir', 'comenzar', 'servir', 'sacar', 'necesitar', 'mantener', 'resultar', 'leer', 'caer', 'cambiar', 'presentar', 'crear', 'abrir', 'considerar', 'oír', 'acabar', 'mil', 'contra', 'cual', 'durante', 'hijo', 'tal', 'vez', 'mujer', 'lugar', 'forma', 'caso', 'mano', 'ante', 'ellos', 'ello', 'ti', 'vos', 'cual'];
    
    const words = text.toLowerCase()
      .replace(/[^\w\sáéíóúñ]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));

    return [...new Set(words)]; // Eliminar duplicados
  }

  /**
   * Identifica el tipo de consulta
   */
  private static identifyQueryType(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.match(/precio|costo|vale|cuánto|cuanto/)) return 'price_inquiry';
    if (lowerQuery.match(/foto|imagen|ver|muestra/)) return 'photo_request';
    if (lowerQuery.match(/disponible|stock|hay|tienen/)) return 'availability';
    if (lowerQuery.match(/pagar|pago|método|forma/)) return 'payment_method';
    if (lowerQuery.match(/envío|entrega|demora/)) return 'shipping';
    if (lowerQuery.match(/características|especificaciones|detalles/)) return 'product_details';
    if (lowerQuery.match(/comprar|quiero|me interesa/)) return 'purchase_intent';
    if (lowerQuery.match(/busco|necesito|tienes/)) return 'product_search';

    return 'general_inquiry';
  }

  /**
   * Obtiene estadísticas de aprendizaje
   */
  static async getLearningStats() {
    const totalKnowledge = await db.conversationKnowledge.count();
    const totalPatterns = await db.conversationPattern.count();
    const recentLearning = await db.conversationKnowledge.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Última semana
        }
      }
    });

    const avgConfidence = await db.conversationKnowledge.aggregate({
      _avg: { confidence: true }
    });

    return {
      totalKnowledge,
      totalPatterns,
      recentLearning,
      avgConfidence: avgConfidence._avg.confidence || 0,
      learningRate: (recentLearning / 7).toFixed(1) + ' por día'
    };
  }

  /**
   * Limpia conocimiento de baja calidad
   */
  static async cleanLowQualityKnowledge() {
    const deleted = await db.conversationKnowledge.deleteMany({
      where: {
        OR: [
          { confidence: { lt: 0.5 } },
          { successRate: { lt: 0.3 } },
          {
            AND: [
              { usageCount: { lt: 2 } },
              { createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
            ]
          }
        ]
      }
    });

    console.log(`🧹 [CLEANUP] ${deleted.count} entradas de baja calidad eliminadas`);
    return deleted.count;
  }
}
