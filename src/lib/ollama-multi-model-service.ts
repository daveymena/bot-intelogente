/**
 * Servicio Multi-Modelo de Ollama
 * Permite usar múltiples modelos de Ollama y comparar resultados
 */

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
}

interface ModelResponse {
  model: string;
  content: string;
  duration: number;
  metrics?: {
    totalDuration: number;
    loadDuration: number;
    promptEvalDuration: number;
    evalDuration: number;
  };
}

export class OllamaMultiModelService {
  private static baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  private static primaryModel = process.env.OLLAMA_MODEL || 'llama3:latest';
  private static secondaryModel = process.env.OLLAMA_MODEL_SECONDARY || 'mistral:latest';
  private static timeout = parseInt(process.env.OLLAMA_TIMEOUT || '180000');
  private static maxTokens = parseInt(process.env.OLLAMA_MAX_TOKENS || '600');

  /**
   * Llamar a un modelo específico de Ollama
   */
  private static async callModel(
    model: string,
    messages: OllamaMessage[],
    temperature: number = 0.7
  ): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: false,
          options: {
            temperature: temperature,
            num_predict: this.maxTokens
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      const duration = Date.now() - startTime;

      return {
        model: model,
        content: data.message.content,
        duration: duration,
        metrics: data.total_duration ? {
          totalDuration: data.total_duration / 1e9,
          loadDuration: data.load_duration ? data.load_duration / 1e9 : 0,
          promptEvalDuration: data.prompt_eval_duration ? data.prompt_eval_duration / 1e9 : 0,
          evalDuration: data.eval_duration ? data.eval_duration / 1e9 : 0
        } : undefined
      };

    } catch (error: any) {
      console.error(`❌ Error en modelo ${model}:`, error.message);
      throw error;
    }
  }

  /**
   * Obtener respuesta del modelo primario (llama3)
   */
  static async getPrimaryResponse(
    messages: OllamaMessage[],
    temperature: number = 0.7
  ): Promise<ModelResponse> {
    console.log(`🤖 Usando modelo primario: ${this.primaryModel}`);
    return this.callModel(this.primaryModel, messages, temperature);
  }

  /**
   * Obtener respuesta del modelo secundario (mistral)
   */
  static async getSecondaryResponse(
    messages: OllamaMessage[],
    temperature: number = 0.7
  ): Promise<ModelResponse> {
    console.log(`🤖 Usando modelo secundario: ${this.secondaryModel}`);
    return this.callModel(this.secondaryModel, messages, temperature);
  }

  /**
   * Obtener respuestas de ambos modelos en paralelo
   */
  static async getBothResponses(
    messages: OllamaMessage[],
    temperature: number = 0.7
  ): Promise<{ primary: ModelResponse; secondary: ModelResponse }> {
    console.log(`🤖 Consultando ambos modelos en paralelo...`);

    const [primary, secondary] = await Promise.all([
      this.callModel(this.primaryModel, messages, temperature),
      this.callModel(this.secondaryModel, messages, temperature)
    ]);

    return { primary, secondary };
  }

  /**
   * Obtener la mejor respuesta comparando ambos modelos
   */
  static async getBestResponse(
    messages: OllamaMessage[],
    temperature: number = 0.7
  ): Promise<ModelResponse> {
    try {
      const responses = await this.getBothResponses(messages, temperature);

      // Criterios de selección:
      // 1. Longitud de respuesta (más detallada es mejor)
      // 2. Velocidad (más rápido es mejor si la calidad es similar)
      
      const primaryScore = responses.primary.content.length / responses.primary.duration;
      const secondaryScore = responses.secondary.content.length / responses.secondary.duration;

      console.log(`📊 Scores - ${this.primaryModel}: ${primaryScore.toFixed(2)}, ${this.secondaryModel}: ${secondaryScore.toFixed(2)}`);

      if (primaryScore >= secondaryScore) {
        console.log(`✅ Seleccionado: ${this.primaryModel}`);
        return responses.primary;
      } else {
        console.log(`✅ Seleccionado: ${this.secondaryModel}`);
        return responses.secondary;
      }

    } catch (error) {
      console.error(`❌ Error al comparar modelos, usando primario por defecto`);
      return this.getPrimaryResponse(messages, temperature);
    }
  }

  /**
   * Obtener respuesta con fallback automático
   */
  static async getResponseWithFallback(
    messages: OllamaMessage[],
    temperature: number = 0.7
  ): Promise<ModelResponse> {
    try {
      // Intentar con modelo primario
      return await this.getPrimaryResponse(messages, temperature);
    } catch (error) {
      console.log(`⚠️  Modelo primario falló, intentando con secundario...`);
      try {
        // Fallback a modelo secundario
        return await this.getSecondaryResponse(messages, temperature);
      } catch (secondError) {
        console.error(`❌ Ambos modelos fallaron`);
        throw new Error('Todos los modelos de Ollama fallaron');
      }
    }
  }

  /**
   * Verificar disponibilidad de modelos
   */
  static async checkModelsAvailability(): Promise<{
    primary: boolean;
    secondary: boolean;
    available: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      
      const availableModels = data.models.map((m: any) => m.name);
      
      return {
        primary: availableModels.includes(this.primaryModel),
        secondary: availableModels.includes(this.secondaryModel),
        available: availableModels
      };
    } catch (error) {
      console.error(`❌ Error al verificar modelos:`, error);
      return {
        primary: false,
        secondary: false,
        available: []
      };
    }
  }

  /**
   * Obtener información de los modelos configurados
   */
  static getModelsInfo() {
    return {
      baseUrl: this.baseUrl,
      primary: this.primaryModel,
      secondary: this.secondaryModel,
      timeout: this.timeout,
      maxTokens: this.maxTokens
    };
  }
}
