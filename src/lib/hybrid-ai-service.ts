/**
 * Servicio Híbrido de IA
 * Combina Core AI (neuronal), Ollama y generador local con fallback inteligente
 */

import { coreAI } from './core-ai-client';
import { OllamaService } from './ollama-service';
import { LocalResponseGenerator } from './local-response-generator';
import { ProductIntelligenceService } from './product-intelligence-service';

interface ResponseOptions {
  userPhone: string;
  message: string;
  context?: any;
  forceLocal?: boolean;
  minConfidence?: number;
}

interface AIResponse {
  text: string;
  source: 'core-ai' | 'ollama' | 'local';
  confidence: number;
  intent?: string;
  actions?: Record<string, any>;
  metadata?: Record<string, any>;
}

export class HybridAIService {
  private ollama: OllamaService;
  private localGenerator: LocalResponseGenerator;
  private productIntelligence: ProductIntelligenceService;
  private useCoreAI: boolean;
  private useOllama: boolean;
  private minConfidenceThreshold: number;

  constructor() {
    this.ollama = new OllamaService();
    this.localGenerator = new LocalResponseGenerator();
    this.productIntelligence = new ProductIntelligenceService();
    
    this.useCoreAI = process.env.USE_CORE_AI === 'true';
    this.useOllama = process.env.USE_OLLAMA === 'true';
    this.minConfidenceThreshold = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.75');
  }

  /**
   * Genera respuesta usando el mejor sistema disponible
   */
  async generateResponse(options: ResponseOptions): Promise<AIResponse> {
    const {
      userPhone,
      message,
      context = {},
      forceLocal = false,
      minConfidence = this.minConfidenceThreshold
    } = options;

    // Si se fuerza local, usar directamente
    if (forceLocal) {
      return this.useLocalGenerator(message, context);
    }

    // 1. Intentar con Core AI (sistema neuronal)
    if (this.useCoreAI) {
      try {
        const coreAIResponse = await this.tryCoreAI(userPhone, message, context, minConfidence);
        if (coreAIResponse) {
          return coreAIResponse;
        }
      } catch (error) {
        console.warn('[Hybrid AI] Core AI failed:', error.message);
      }
    }

    // 2. Intentar con Ollama (LLM local)
    if (this.useOllama) {
      try {
        const ollamaResponse = await this.tryOllama(message, context);
        if (ollamaResponse) {
          return ollamaResponse;
        }
      } catch (error) {
        console.warn('[Hybrid AI] Ollama failed:', error.message);
      }
    }

    // 3. Fallback a generador local (siempre funciona)
    return this.useLocalGenerator(message, context);
  }

  /**
   * Intenta generar respuesta con Core AI
   */
  private async tryCoreAI(
    userPhone: string,
    message: string,
    context: any,
    minConfidence: number
  ): Promise<AIResponse | null> {
    // Verificar si está disponible
    if (!coreAI.isAvailable()) {
      console.log('[Hybrid AI] Core AI not available');
      return null;
    }

    try {
      const response = await coreAI.query({
        user_id: userPhone,
        text: message,
        context: {
          ...context,
          recent_messages: context.recentMessages || [],
          user_preferences: context.userPreferences || {}
        }
      });

      // Verificar confianza
      if (response.confidence < minConfidence) {
        console.log(`[Hybrid AI] Core AI confidence too low: ${response.confidence.toFixed(2)} < ${minConfidence}`);
        return null;
      }

      console.log(`✅ [Hybrid AI] Using Core AI (confidence: ${response.confidence.toFixed(2)})`);

      return {
        text: response.reply,
        source: 'core-ai',
        confidence: response.confidence,
        intent: response.intent,
        actions: response.actions,
        metadata: response.metadata
      };

    } catch (error) {
      console.error('[Hybrid AI] Core AI error:', error);
      return null;
    }
  }

  /**
   * Intenta generar respuesta con Ollama
   */
  private async tryOllama(
    message: string,
    context: any
  ): Promise<AIResponse | null> {
    try {
      // Verificar si Ollama está disponible
      const isAvailable = await this.ollama.isAvailable();
      if (!isAvailable) {
        console.log('[Hybrid AI] Ollama not available');
        return null;
      }

      // Generar respuesta
      const response = await this.ollama.generateResponse(message, {
        conversationHistory: context.recentMessages || [],
        userContext: context.userPreferences || {}
      });

      console.log('✅ [Hybrid AI] Using Ollama');

      return {
        text: response,
        source: 'ollama',
        confidence: 0.8, // Ollama no da confidence, asumimos 0.8
        metadata: {
          model: this.ollama.getModelName()
        }
      };

    } catch (error) {
      console.error('[Hybrid AI] Ollama error:', error);
      return null;
    }
  }

  /**
   * Usa el generador local (fallback garantizado)
   */
  private async useLocalGenerator(
    message: string,
    context: any
  ): Promise<AIResponse> {
    console.log('✅ [Hybrid AI] Using Local Generator (fallback)');

    const response = await this.localGenerator.generate(message, context);

    return {
      text: response,
      source: 'local',
      confidence: 0.6, // Local tiene menor confidence
      metadata: {
        fallback: true
      }
    };
  }

  /**
   * Entrena Core AI con una conversación exitosa
   */
  async trainFromConversation(data: {
    conversationId: string;
    messages: Array<{ role: string; content: string }>;
    outcome: 'success' | 'failure' | 'escalated';
    feedback?: string;
  }): Promise<boolean> {
    if (!this.useCoreAI || !coreAI.isAvailable()) {
      console.log('[Hybrid AI] Core AI not available for training');
      return false;
    }

    try {
      await coreAI.train({
        conversation_id: data.conversationId,
        messages: data.messages,
        outcome: data.outcome,
        feedback: data.feedback
      });

      console.log(`✅ [Hybrid AI] Conversation ${data.conversationId} sent for training`);
      return true;

    } catch (error) {
      console.error('[Hybrid AI] Training error:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de todos los sistemas
   */
  async getStats(): Promise<{
    coreAI?: any;
    ollama?: any;
    local: any;
  }> {
    const stats: any = {
      local: {
        enabled: true,
        status: 'active'
      }
    };

    // Core AI stats
    if (this.useCoreAI && coreAI.isAvailable()) {
      try {
        stats.coreAI = await coreAI.stats();
      } catch (error) {
        stats.coreAI = { error: error.message };
      }
    }

    // Ollama stats
    if (this.useOllama) {
      try {
        const isAvailable = await this.ollama.isAvailable();
        stats.ollama = {
          available: isAvailable,
          model: this.ollama.getModelName()
        };
      } catch (error) {
        stats.ollama = { error: error.message };
      }
    }

    return stats;
  }

  /**
   * Verifica salud de todos los sistemas
   */
  async healthCheck(): Promise<{
    coreAI: boolean;
    ollama: boolean;
    local: boolean;
  }> {
    const health = {
      coreAI: false,
      ollama: false,
      local: true // Local siempre está disponible
    };

    // Check Core AI
    if (this.useCoreAI) {
      try {
        const coreHealth = await coreAI.health();
        health.coreAI = coreHealth.status === 'healthy';
      } catch {
        health.coreAI = false;
      }
    }

    // Check Ollama
    if (this.useOllama) {
      try {
        health.ollama = await this.ollama.isAvailable();
      } catch {
        health.ollama = false;
      }
    }

    return health;
  }

  /**
   * Obtiene el sistema activo actual
   */
  async getActiveSystem(): Promise<'core-ai' | 'ollama' | 'local'> {
    if (this.useCoreAI && coreAI.isAvailable()) {
      return 'core-ai';
    }

    if (this.useOllama) {
      try {
        const isAvailable = await this.ollama.isAvailable();
        if (isAvailable) {
          return 'ollama';
        }
      } catch {
        // Continue to local
      }
    }

    return 'local';
  }
}

// Singleton instance
export const hybridAI = new HybridAIService();
