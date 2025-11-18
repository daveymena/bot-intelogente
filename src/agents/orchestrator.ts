/**
 * Orquestador Principal
 * Coordina todos los agentes y decide cuál debe responder
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory, SharedMemoryService } from './shared-memory';
import { IntentDetector, Intent } from './utils/intent-detector';
import { ObjectionHandler } from './objection-handler';
import { DeepReasoningAgent } from './deep-reasoning-agent';

// Importar agentes
import { GreetingAgent } from './greeting-agent';
import { SearchAgent } from './search-agent';
import { ProductAgent } from './product-agent';
import { PaymentAgent } from './payment-agent';
import { PhotoAgent } from './photo-agent';
import { ClosingAgent } from './closing-agent';

export class Orchestrator {
  private memoryService: SharedMemoryService;
  private agents: Map<string, BaseAgent>;
  
  constructor() {
    this.memoryService = SharedMemoryService.getInstance();
    this.agents = new Map();
    
    // Registrar agentes
    this.registerAgent('greeting', new GreetingAgent());
    this.registerAgent('search', new SearchAgent());
    this.registerAgent('product', new ProductAgent());
    this.registerAgent('payment', new PaymentAgent());
    this.registerAgent('photo', new PhotoAgent());
    this.registerAgent('closing', new ClosingAgent());
  }
  
  /**
   * Registra un agente
   */
  private registerAgent(name: string, agent: BaseAgent): void {
    this.agents.set(name, agent);
  }
  
  /**
   * Procesa un mensaje del usuario
   */
  async processMessage(params: {
    chatId: string;
    userId: string;
    message: string;
    userName?: string;
  }): Promise<AgentResponse> {
    const { chatId, userId, message, userName } = params;
    
    console.log('[Orchestrator] 📥 Procesando mensaje:', {
      chatId,
      userId,
      mensaje: message.substring(0, 50),
    });
    
    // 1. Obtener o crear memoria
    const memory = this.memoryService.get(chatId, userId);
    if (userName && !memory.userName) {
      memory.userName = userName;
    }
    
    // 2. Agregar mensaje del usuario al historial
    this.memoryService.addMessage(chatId, 'user', message);
    
    console.log('[Orchestrator] 🧠 Contexto actual:', {
      salesStage: memory.salesStage,
      currentProduct: memory.currentProduct?.name || 'ninguno',
      messageCount: memory.messageCount,
    });
    
    // 🧠 PASO 1: RAZONAMIENTO PROFUNDO (SIEMPRE PRIMERO)
    console.log('\n🧠 ========================================');
    console.log('🧠 INICIANDO RAZONAMIENTO PROFUNDO');
    console.log('🧠 ========================================\n');
    
    const reasoningResult = await DeepReasoningAgent.analyzeContext(
      chatId,
      message,
      memory
    );
    
    console.log('\n🎯 RESULTADO DEL RAZONAMIENTO:');
    console.log('✅ Entendido:', reasoningResult.understood);
    console.log('🎯 Intención:', reasoningResult.userIntent.primary);
    console.log('📦 Producto actual:', reasoningResult.currentProduct?.name || 'Ninguno');
    console.log('💡 Razonamiento:', reasoningResult.reasoning);
    console.log('📋 Recomendaciones:', reasoningResult.recommendations);
    console.log('\n🧠 ========================================\n');
    
    // Si el razonamiento recomienda enviar foto, hacerlo directamente
    if (reasoningResult.recommendations.shouldSendPhoto && reasoningResult.recommendations.productId) {
      console.log('📸 [REASONING] Enviando foto del producto según razonamiento');
      
      // Usar PhotoAgent para enviar la foto
      const photoAgent = this.agents.get('photo')!;
      const photoResponse = await photoAgent.handleLocally(message, memory);
      
      // Marcar que se envió la foto
      memory.photoSent = true;
      
      // Agregar respuesta al historial
      this.memoryService.addMessage(chatId, 'assistant', photoResponse.text);
      
      return {
        ...photoResponse,
        context: {
          currentProduct: memory.currentProduct,
          paymentIntent: memory.paymentIntent,
          preferredPaymentMethod: memory.preferredPaymentMethod,
          salesStage: memory.salesStage,
          reasoning: reasoningResult.reasoning
        }
      };
    }
    
    // Si necesita clarificación, pedirla
    if (reasoningResult.recommendations.shouldAskClarification) {
      console.log('❓ [REASONING] Solicitando clarificación');
      
      const clarificationResponse = reasoningResult.recommendations.clarificationNeeded || 
        '¿Podrías darme más detalles sobre lo que necesitas? 😊';
      
      this.memoryService.addMessage(chatId, 'assistant', clarificationResponse);
      
      return {
        text: clarificationResponse,
        confidence: 0.8,
        context: {
          currentProduct: memory.currentProduct,
          paymentIntent: memory.paymentIntent,
          preferredPaymentMethod: memory.preferredPaymentMethod,
          salesStage: memory.salesStage,
          reasoning: reasoningResult.reasoning
        }
      };
    }
    
    // Actualizar memoria con el producto identificado por el razonamiento
    if (reasoningResult.currentProduct && !memory.currentProduct) {
      memory.currentProduct = reasoningResult.currentProduct;
      console.log('📦 [REASONING] Producto actualizado en memoria:', reasoningResult.currentProduct.name);
    }
    
    // 🛡️ Detectar y manejar objeciones
    const objectionResponse = ObjectionHandler.handleObjection(
      message,
      memory,
      memory.currentProduct
    );
    
    if (objectionResponse && objectionResponse.confidence > 0.7) {
      console.log('[Orchestrator] 🛡️ Objeción detectada:', objectionResponse.type);
      
      // Agregar respuesta al historial
      this.memoryService.addMessage(chatId, 'assistant', objectionResponse.response);
      
      return {
        text: objectionResponse.response,
        confidence: objectionResponse.confidence,
        nextAgent: 'product', // Volver a producto después de manejar objeción
      };
    }
    
    // 3. Detectar intención
    const intentResult = IntentDetector.detect(message, memory);
    
    console.log('[Orchestrator] 🎯 Intención detectada:', {
      intent: intentResult.intent,
      confidence: (intentResult.confidence * 100).toFixed(0) + '%',
    });
    
    // 4. Seleccionar agente
    const agent = this.selectAgent(intentResult.intent, memory);
    
    console.log('[Orchestrator] 🤖 Agente seleccionado:', agent.constructor.name);
    
    // 5. Ejecutar agente
    let response: AgentResponse;
    
    try {
      // Intentar manejar localmente primero (sin IA externa)
      if (agent.canHandleLocally(message, memory)) {
        console.log('[Orchestrator] ⚡ Manejando localmente (sin IA)');
        response = await agent.handleLocally(message, memory);
      } else {
        console.log('[Orchestrator] 🤖 Requiere IA externa');
        response = await agent.handleWithAI(message, memory);
      }
    } catch (error) {
      console.error('[Orchestrator] ❌ Error ejecutando agente:', error);
      
      // Fallback: respuesta genérica
      response = {
        text: 'Disculpa, tuve un problema al procesar tu mensaje. ¿Podrías intentar de nuevo? 🙏',
        confidence: 0.3,
      };
    }
    
    // 6. Agregar respuesta al historial
    this.memoryService.addMessage(chatId, 'assistant', response.text);
    
    // 7. Actualizar stage si el agente lo indica
    if (response.nextAgent) {
      const newStage = this.agentToStage(response.nextAgent);
      if (newStage) {
        this.memoryService.update(chatId, { salesStage: newStage as any });
      }
    }
    
    console.log('[Orchestrator] ✅ Respuesta generada:', {
      length: response.text.length,
      nextAgent: response.nextAgent || 'ninguno',
      actions: response.actions?.length || 0,
    });
    
    // Agregar contexto a la respuesta
    response.context = {
      currentProduct: memory.currentProduct,
      paymentIntent: memory.paymentIntent,
      preferredPaymentMethod: memory.preferredPaymentMethod,
      salesStage: memory.salesStage
    };
    
    return response;
  }
  
  /**
   * Selecciona el agente apropiado según la intención
   */
  private selectAgent(intent: Intent, memory: SharedMemory): BaseAgent {
    // Lógica de selección basada en intención y contexto
    
    switch (intent) {
      case 'greeting':
        return this.agents.get('greeting')!;
      
      case 'farewell':
        return this.agents.get('closing')!;
      
      case 'photo_request':
        return this.agents.get('photo')!;
      
      case 'payment_methods':
      case 'payment_selection':
        return this.agents.get('payment')!;
      
      case 'search_product':
        return this.agents.get('search')!;
      
      case 'product_info':
      case 'price_query':
      case 'availability_query':
        // 🔥 CORRECCIÓN: Si hay producto en contexto O productos interesados, usar ProductAgent
        if (memory.currentProduct || memory.interestedProducts.length > 0) {
          return this.agents.get('product')!;
        }
        // Si no, buscar primero
        return this.agents.get('search')!;
      
      case 'confirmation':
        // Depende del stage actual
        if (memory.salesStage === 'payment') {
          return this.agents.get('closing')!;
        }
        return this.agents.get('product')!;
      
      case 'complaint':
      case 'support':
        return this.agents.get('closing')!; // Closing maneja soporte también
      
      default:
        // General: decidir según el stage actual
        return this.selectAgentByStage(memory.salesStage);
    }
  }
  
  /**
   * Selecciona agente según el stage actual
   */
  private selectAgentByStage(stage: string): BaseAgent {
    switch (stage) {
      case 'greeting':
        return this.agents.get('greeting')!;
      case 'search':
        return this.agents.get('search')!;
      case 'product':
        return this.agents.get('product')!;
      case 'payment':
        return this.agents.get('payment')!;
      case 'closing':
        return this.agents.get('closing')!;
      default:
        return this.agents.get('greeting')!;
    }
  }
  
  /**
   * Convierte nombre de agente a stage
   */
  private agentToStage(agentName: string): string | null {
    const mapping: Record<string, string> = {
      'greeting': 'greeting',
      'search': 'search',
      'product': 'product',
      'payment': 'payment',
      'photo': 'product', // Photo no cambia el stage
      'closing': 'closing',
    };
    return mapping[agentName] || null;
  }
  
  /**
   * Limpia memorias antiguas (llamar periódicamente)
   */
  cleanOldMemories(): void {
    this.memoryService.cleanOldMemories();
  }
  
  /**
   * Obtiene estadísticas
   */
  getStats() {
    return this.memoryService.getStats();
  }
}
