/**
 * Cliente para Core AI Service (Python FastAPI)
 * Sistema neuronal local con embeddings, RAG y Mini-LLM
 */

import axios, { AxiosInstance } from 'axios';

interface QueryRequest {
  user_id: string;
  text: string;
  context?: Record<string, any>;
  session_id?: string;
}

interface QueryResponse {
  intent: string;
  confidence: number;
  reply: string;
  actions?: Record<string, any>;
  retrieved_docs?: Array<{
    id: string;
    score: number;
  }>;
  metadata?: Record<string, any>;
}

interface HealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  services: {
    intent_classifier: boolean;
    embedding_service: boolean;
    knowledge_retriever: boolean;
    rules_engine: boolean;
    mini_llm: boolean;
    template_engine: boolean;
  };
}

interface StatsResponse {
  intent_classifier: any;
  knowledge_retriever: any;
  mini_llm: any;
  conversation_context: any;
  auto_trainer: any;
}

export class CoreAIClient {
  private client: AxiosInstance;
  private baseURL: string;
  private enabled: boolean;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isHealthy: boolean = false;

  constructor() {
    this.baseURL = process.env.CORE_AI_URL || 'http://localhost:8000';
    this.enabled = process.env.USE_CORE_AI === 'true';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Start health check monitoring
    if (this.enabled) {
      this.startHealthCheck();
    }
  }

  /**
   * Procesa una query del usuario
   */
  async query(request: QueryRequest): Promise<QueryResponse> {
    if (!this.enabled) {
      throw new Error('Core AI is disabled');
    }

    try {
      const response = await this.client.post<QueryResponse>('/query', request);
      
      console.log(`[Core AI] Intent: ${response.data.intent} (${response.data.confidence.toFixed(2)})`);
      
      return response.data;
    } catch (error) {
      console.error('[Core AI] Query error:', error);
      throw error;
    }
  }

  /**
   * Health check del servicio
   */
  async health(): Promise<HealthResponse> {
    try {
      const response = await this.client.get<HealthResponse>('/health');
      this.isHealthy = response.data.status === 'healthy';
      return response.data;
    } catch (error) {
      this.isHealthy = false;
      throw error;
    }
  }

  /**
   * Obtiene estadísticas del sistema
   */
  async stats(): Promise<StatsResponse> {
    const response = await this.client.get<StatsResponse>('/stats');
    return response.data;
  }

  /**
   * Entrena el sistema con una conversación
   */
  async train(data: {
    conversation_id: string;
    messages: Array<{ role: string; content: string }>;
    outcome: 'success' | 'failure' | 'escalated';
    feedback?: string;
  }): Promise<{ status: string; conversation_id: string }> {
    const response = await this.client.post('/train', data);
    return response.data;
  }

  /**
   * Re-indexa la base de conocimiento
   */
  async reindex(): Promise<{ status: string }> {
    const response = await this.client.post('/reindex');
    return response.data;
  }

  /**
   * Verifica si el servicio está disponible
   */
  isAvailable(): boolean {
    return this.enabled && this.isHealthy;
  }

  /**
   * Inicia monitoreo de salud
   */
  private startHealthCheck() {
    // Check immediately
    this.health().catch(() => {
      console.warn('[Core AI] Initial health check failed');
    });

    // Check every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.health();
        if (this.isHealthy) {
          console.log('[Core AI] Health check: OK');
        }
      } catch (error) {
        console.warn('[Core AI] Health check failed');
      }
    }, 30000);
  }

  /**
   * Detiene monitoreo de salud
   */
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Singleton instance
export const coreAI = new CoreAIClient();
