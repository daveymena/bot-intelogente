/**
 * Orquestador Principal (SIMPLIFICADO)
 * Coordina los agentes basándose EXCLUSIVAMENTE en el DeepReasoningAgent.
 * Elimina la lógica conflictiva y centraliza la toma de decisiones.
 * 
 * NUEVO: Integración con Sistema Híbrido de Aprendizaje
 * - Intenta responder con conocimiento local primero
 * - Fallback inteligente a IA externa (Groq/Ollama)
 * - Aprende automáticamente de las respuestas de IA
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory, SharedMemoryService } from './shared-memory';
import { DeepReasoningAgent } from './deep-reasoning-agent';
import { UnifiedMemoryService } from '../lib/unified-memory-service';
import { CoherentResponseSystem } from '../lib/coherent-response-system';
import { ConversationLearningService } from '../lib/conversation-learning-service';
import { ObjectionHandlerService } from '../lib/objection-handler-service';
import { HybridLearningSystem } from '../lib/hybrid-learning-system';

// Importar agentes
import { InterpreterAgent } from './interpreter-agent';
import { GreetingAgent } from './greeting-agent';
import { SearchAgent } from './search-agent';
import { ProductAgent } from './product-agent';
import { PaymentAgent } from './payment-agent';
import { PhotoAgent } from './photo-agent';
import { ClosingAgent } from './closing-agent';
import { GeneralQAAgent } from './general-qa-agent';

export class Orchestrator {
  private memoryService: SharedMemoryService;
  private unifiedMemoryService: UnifiedMemoryService;
  private coherentResponseSystem: CoherentResponseSystem;
  private agents: Map<string, BaseAgent>;

  constructor() {
    this.memoryService = SharedMemoryService.getInstance();
    this.unifiedMemoryService = UnifiedMemoryService.getInstance();
    this.coherentResponseSystem = CoherentResponseSystem.getInstance();
    this.agents = new Map();

    this.registerAgent('interpreter', new InterpreterAgent());
    this.registerAgent('greeting', new GreetingAgent());
    this.registerAgent('search', new SearchAgent());
    this.registerAgent('product', new ProductAgent());
    this.registerAgent('payment', new PaymentAgent());
    this.registerAgent('photo', new PhotoAgent());
    this.registerAgent('closing', new ClosingAgent());
    this.registerAgent('general_qa', new GeneralQAAgent());
  }
  
  private registerAgent(name: string, agent: BaseAgent): void {
    this.agents.set(name, agent);
  }
  
  async processMessage(params: {
    chatId: string;
    userId: string;
    message: string;
    userName?: string;
  }): Promise<AgentResponse> {
    const { chatId, userId, message, userName } = params;

    console.log(`\n🤖 [ORCHESTRATOR] Procesando: "${message.substring(0, 50)}..."`);

    // 1. Gestión de Memoria Inicial
    const unifiedMemory = await this.unifiedMemoryService.getUnifiedMemory(chatId, userId);
    if (userName && !unifiedMemory.userName) {
      await this.unifiedMemoryService.updateUnifiedMemory(chatId, userId, { userName });
    }
    await this.unifiedMemoryService.addMessage(chatId, userId, 'user', message);
    const memory = this.memoryService.get(chatId, userId);

    // 2. Interpretación Rápida (Regex) - Solo como input para el razonamiento
    const interpreterAgent = this.agents.get('interpreter')!;
    const interpretation = await interpreterAgent.execute(message, memory);

    // 3. RAZONAMIENTO PROFUNDO (CEREBRO CENTRAL)
    // Aquí es donde ocurre la "magia" de la IA real.
    const reasoning = await DeepReasoningAgent.analyzeContext(
      chatId,
      message,
      memory,
      interpretation.metadata?.interpretation
    );

    // 4. Actualización de Contexto basada en Razonamiento
    if (reasoning.currentProduct) {
        // Si la IA detectó un producto, actualizamos la memoria INMEDIATAMENTE
        if (memory.currentProduct?.id !== reasoning.currentProduct.id) {
            console.log(`🔄 [ORCHESTRATOR] Actualizando producto: ${reasoning.currentProduct.name}`);
            memory.currentProduct = reasoning.currentProduct;
            await this.unifiedMemoryService.updateUnifiedMemory(chatId, userId, {
                currentProduct: reasoning.currentProduct
            });
        }
    }

    // 5. Selección de Agente (Basada en la decisión de la IA)
    const selectedAgentName = reasoning.suggestedAgent;
    const agent = this.agents.get(selectedAgentName) || this.agents.get('search')!;
    
    console.log(`👉 [ORCHESTRATOR] Delegando a: ${agent.constructor.name}`);

    // 6. Ejecución del Agente con Sistema Híbrido
    let response: AgentResponse;
    try {
      if (agent.canHandleLocally(message, memory)) {
        response = await agent.handleLocally(message, memory);
        
        // Si la respuesta local tiene baja confianza, usar sistema híbrido
        const currentConfidence = response.confidence ?? 0.5;
        if (currentConfidence < 0.7) {
          console.log(`⚠️ [ORCHESTRATOR] Confianza baja (${(currentConfidence * 100).toFixed(0)}%), usando sistema híbrido...`);
          
          const hybridResponse = await HybridLearningSystem.processWithLearning({
            message,
            context: memory,
            chatId,
            userId,
            intent: reasoning.userIntent.primary,
            productId: memory.currentProduct?.id
          });
          
          if (hybridResponse.confidence > currentConfidence) {
            console.log(`✅ [ORCHESTRATOR] Sistema híbrido mejoró la respuesta (${(hybridResponse.confidence * 100).toFixed(0)}%)`);
            if (hybridResponse.learned) {
              console.log(`🎓 [ORCHESTRATOR] Bot aprendió algo nuevo!`);
            }
            response.text = hybridResponse.text;
            response.confidence = hybridResponse.confidence;
          }
        }
      } else {
        console.log(`🤖 [ORCHESTRATOR] Agente no puede manejar localmente - Usando sistema híbrido`);
        
        // Usar sistema híbrido directamente con parámetros completos
        const hybridResponse = await HybridLearningSystem.processWithLearning({
          message,
          context: memory,
          chatId,
          userId,
          intent: reasoning.userIntent.primary,
          productId: memory.currentProduct?.id
        });
        
        response = {
          text: hybridResponse.text,
          confidence: hybridResponse.confidence,
          nextAgent: selectedAgentName
        };
        
        if (hybridResponse.learned) {
          console.log(`🎓 [ORCHESTRATOR] Bot aprendió de ${hybridResponse.source}`);
        }
      }
    } catch (error) {
      console.error('❌ Error en agente, usando sistema híbrido como fallback:', error);
      // Fallback final: Sistema híbrido
      try {
        const hybridResponse = await HybridLearningSystem.processWithLearning({
          message,
          context: memory,
          chatId,
          userId,
          intent: reasoning.userIntent.primary,
          productId: memory.currentProduct?.id
        });
        
        response = {
          text: hybridResponse.text,
          confidence: hybridResponse.confidence,
          nextAgent: 'search'
        };
        
        if (hybridResponse.learned) {
          console.log(`🎓 [ORCHESTRATOR] Bot aprendió en fallback`);
        }
      } catch (fallbackError) {
        console.error('❌ Error en fallback híbrido:', fallbackError);
        response = {
          text: '¿Podrías decirme de otra forma qué necesitas? 😊',
          nextAgent: 'search',
          confidence: 0.5
        };
      }
    }

    // 7. Post-Procesamiento y Coherencia
    this.memoryService.addMessage(chatId, 'assistant', response.text);
    
    // Aplicar personalidad y coherencia
    const coherentResponse = this.coherentResponseSystem.generateCoherentResponse({
      intent: reasoning.userIntent.primary,
      context: unifiedMemory,
      baseResponse: response.text,
      tone: 'friendly',
      includePersonalization: true
    });
    
    response.text = coherentResponse;

    // 8. Aprendizaje (Background)
    this.recordLearning(userId, chatId, message, response, reasoning);

    return response;
  }

  private async recordLearning(userId: string, chatId: string, message: string, response: AgentResponse, reasoning: any) {
      try {
        await ConversationLearningService.recordSuccessfulPattern(
            userId, chatId, message, response.text, reasoning.userIntent.primary,
            { productCategory: reasoning.currentProduct?.category }
        );
      } catch (e) { /* Silent fail */ }
  }

  async cleanOldMemories(): Promise<void> {
    this.memoryService.cleanOldMemories();
  }

  async getStats() {
    return {
      sharedMemory: this.memoryService.getStats(),
      unifiedMemory: await this.unifiedMemoryService.getStats()
    };
  }
}
