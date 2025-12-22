/**
 * Hybrid Bot Service
 * Sistema híbrido: Bot Local + Ollama Assistant
 * 
 * FLUJO:
 * 1. Bot local intenta responder con reglas predefinidas
 * 2. Si no sabe, Ollama analiza la intención
 * 3. Ollama mantiene memoria y contexto
 * 4. Ollama genera respuesta inteligente si es necesario
 */

import { OllamaAssistantService } from './ollama-assistant-service';
import { ProductIntelligenceService } from './product-intelligence-service';

interface BotResponse {
  message: string;
  source: 'local' | 'ollama' | 'hybrid';
  confidence: number;
  intent?: string;
  needsHumanEscalation?: boolean;
}

export class HybridBotService {
  /**
   * Respuestas locales predefinidas (rápidas y sin costo)
   */
  private static localResponses = {
    saludos: [
      '¡Hola! 👋 Bienvenido a Tecnovariedades D&S. ¿En qué puedo ayudarte hoy?',
      '¡Hola! 😊 ¿Buscas algún producto en particular?',
      '¡Bienvenido! Estoy aquí para ayudarte a encontrar lo que necesitas.'
    ],
    despedidas: [
      '¡Hasta pronto! 👋 Estamos para servirte cuando lo necesites.',
      'Gracias por contactarnos. ¡Que tengas un excelente día! 😊',
      '¡Nos vemos! No dudes en escribirnos cuando quieras.'
    ],
    agradecimientos: [
      '¡Con gusto! 😊 ¿Hay algo más en lo que pueda ayudarte?',
      'Para eso estamos. ¿Necesitas algo más?',
      '¡De nada! Estoy aquí para lo que necesites.'
    ],
    metodosPago: `Aceptamos varios métodos de pago:
💳 Tarjetas de crédito/débito
💰 Nequi y Daviplata
🏦 Transferencia bancaria
📦 Contraentrega (según zona)

¿Cuál prefieres?`,
    infoEnvio: `Hacemos envíos a toda Colombia 🇨🇴
📦 Envío nacional: 2-5 días hábiles
🚚 Envío express: 1-2 días hábiles
🏪 Recogida en tienda: Inmediato

¿A qué ciudad necesitas el envío?`
  };

  /**
   * Detectar intención con reglas simples (bot local)
   */
  private static detectLocalIntent(message: string): string | null {
    const msg = message.toLowerCase();

    // Saludos
    if (/^(hola|buenos|buenas|hey|hi|saludos)/i.test(msg)) {
      return 'saludo';
    }

    // Despedidas
    if (/(adios|chao|hasta luego|bye|nos vemos)/i.test(msg)) {
      return 'despedida';
    }

    // Agradecimientos
    if (/(gracias|muchas gracias|te agradezco|thanks)/i.test(msg)) {
      return 'agradecimiento';
    }

    // Métodos de pago
    if (/(como pago|metodos de pago|formas de pago|puedo pagar|aceptan)/i.test(msg)) {
      return 'metodos_pago';
    }

    // Envío
    if (/(envio|envios|entregan|delivery|domicilio)/i.test(msg)) {
      return 'info_envio';
    }

    return null;
  }

  /**
   * Respuesta local rápida
   */
  private static getLocalResponse(intent: string): string | null {
    switch (intent) {
      case 'saludo':
        return this.localResponses.saludos[Math.floor(Math.random() * this.localResponses.saludos.length)];
      case 'despedida':
        return this.localResponses.despedidas[Math.floor(Math.random() * this.localResponses.despedidas.length)];
      case 'agradecimiento':
        return this.localResponses.agradecimientos[Math.floor(Math.random() * this.localResponses.agradecimientos.length)];
      case 'metodos_pago':
        return this.localResponses.metodosPago;
      case 'info_envio':
        return this.localResponses.infoEnvio;
      default:
        return null;
    }
  }

  /**
   * MÉTODO PRINCIPAL: Procesar mensaje con sistema híbrido
   */
  static async processMessage(
    userMessage: string,
    customerPhone: string,
    userId?: string
  ): Promise<BotResponse> {
    console.log('\n🤖 === SISTEMA HÍBRIDO ===');
    console.log('📨 Mensaje:', userMessage);

    // PASO 1: Intentar respuesta local (rápida, sin costo)
    const localIntent = this.detectLocalIntent(userMessage);
    
    if (localIntent) {
      const localResponse = this.getLocalResponse(localIntent);
      if (localResponse) {
        console.log('✅ Respuesta LOCAL (instantánea)');
        
        // Guardar en memoria de Ollama para contexto
        OllamaAssistantService.saveContext(customerPhone, userMessage, 'user');
        OllamaAssistantService.saveContext(customerPhone, localResponse, 'assistant');

        return {
          message: localResponse,
          source: 'local',
          confidence: 0.95,
          intent: localIntent
        };
      }
    }

    // PASO 2: Usar Ollama para análisis de intención (consultas complejas)
    console.log('🧠 Bot local no sabe → Consultando Ollama...');

    try {
      // Obtener contexto previo
      const contextSummary = OllamaAssistantService.getContextSummary(customerPhone);
      const conversationContext = contextSummary.split('\n').filter(l => l.trim());

      // Analizar intención con Ollama
      const intentAnalysis = await OllamaAssistantService.analyzeIntent(
        userMessage,
        conversationContext
      );

      console.log('🎯 Intención detectada:', intentAnalysis.intent);

      // Guardar contexto
      OllamaAssistantService.saveContext(
        customerPhone,
        userMessage,
        'user',
        {
          intent: intentAnalysis.intent,
          product: intentAnalysis.entities.product,
          budget: intentAnalysis.entities.priceRange ? this.parsePriceRange(intentAnalysis.entities.priceRange) : undefined
        }
      );

      // PASO 3: Buscar productos si es necesario
      let products = [];
      if (intentAnalysis.intent === 'buscar_producto' && intentAnalysis.entities.product) {
        try {
          console.log('🔍 Buscando productos...');
          products = await ProductIntelligenceService.searchProducts(
            intentAnalysis.entities.product,
            userId || 'default'
          );
          console.log(`📦 Encontrados: ${products.length} productos`);
        } catch (error) {
          console.log('⚠️  Base de datos no disponible, continuando sin productos');
        }
      }

      // PASO 4: Generar respuesta inteligente con Ollama (formateada)
      let intelligentResponse: string;
      
      if (products.length > 0) {
        // Con productos: usar formato especial
        intelligentResponse = await OllamaAssistantService.generateResponseWithProducts(
          userMessage,
          customerPhone,
          products.slice(0, 3)
        );
      } else {
        // Sin productos: respuesta general formateada
        intelligentResponse = await OllamaAssistantService.generateIntelligentResponse(
          userMessage,
          customerPhone,
          []
        );
      }

      // Guardar respuesta en contexto
      OllamaAssistantService.saveContext(customerPhone, intelligentResponse, 'assistant');

      return {
        message: intelligentResponse,
        source: products.length > 0 ? 'hybrid' : 'ollama',
        confidence: intentAnalysis.confidence,
        intent: intentAnalysis.intent,
        needsHumanEscalation: intentAnalysis.needsHumanEscalation
      };

    } catch (error) {
      console.error('❌ Error en Ollama, usando fallback local');
      
      // Fallback: respuesta genérica local
      const fallbackResponse = 'Entiendo que necesitas ayuda. ¿Podrías darme más detalles sobre lo que buscas? Por ejemplo: laptops, motos, cursos, etc.';
      
      return {
        message: fallbackResponse,
        source: 'local',
        confidence: 0.5,
        intent: 'fallback'
      };
    }
  }

  /**
   * Parsear rango de precio
   */
  private static parsePriceRange(range: string): number {
    const ranges: Record<string, number> = {
      'economico': 500000,
      'bajo': 500000,
      'medio': 1500000,
      'alto': 3000000,
      'premium': 5000000
    };
    return ranges[range.toLowerCase()] || 1000000;
  }

  /**
   * Obtener estadísticas del sistema
   */
  static async getStats() {
    const ollamaAvailable = await OllamaAssistantService.checkAvailability();
    
    return {
      ollamaAvailable,
      model: process.env.OLLAMA_MODEL || 'llama3:latest',
      baseUrl: process.env.OLLAMA_BASE_URL,
      localResponsesCount: Object.keys(this.localResponses).length
    };
  }
}
