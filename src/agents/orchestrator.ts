/**
 * Orquestador Principal - OLLAMA COMO CEREBRO CENTRAL
 * Todo el razonamiento y conversación manejado por SearchAgent (Ollama)
 * EXCEPTO pagos que usa PaymentAgent especializado
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory, SharedMemoryService } from './shared-memory';
import { UnifiedMemoryService } from '../lib/unified-memory-service';

// Importar agentes
import { SearchAgent } from './search-agent';
import { PaymentAgent } from './payment-agent';

export class Orchestrator {
  private memoryService: SharedMemoryService;
  private unifiedMemoryService: UnifiedMemoryService;
  private searchAgent: SearchAgent;
  private paymentAgent: PaymentAgent;

  constructor() {
    this.memoryService = SharedMemoryService.getInstance();
    this.unifiedMemoryService = UnifiedMemoryService.getInstance();
    this.searchAgent = new SearchAgent();
    this.paymentAgent = new PaymentAgent();
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

    // 🎯 DETECCIÓN DE INTENCIÓN DE PAGO (PRIORIDAD MÁXIMA)
    const isPaymentRequest = this.detectPaymentIntent(message, memory);
    
    if (isPaymentRequest) {
      console.log('💳 [ORCHESTRATOR] ⭐ INTENCIÓN DE PAGO DETECTADA - Usando PaymentAgent');
      
      // CRÍTICO: Sincronizar memoria con UnifiedMemoryService para asegurar productHistory
      const freshMemory = this.memoryService.get(chatId, userId);
      console.log(`💳 [ORCHESTRATOR] DEBUG - freshMemory.currentProduct: ${freshMemory.currentProduct ? freshMemory.currentProduct.name : 'NINGUNO'}`);
      console.log(`💳 [ORCHESTRATOR] DEBUG - freshMemory.productHistory: ${freshMemory.productHistory?.length || 0}`);
      console.log(`💳 [ORCHESTRATOR] DEBUG - freshMemory.interestedProducts: ${freshMemory.interestedProducts?.length || 0}`);
      
      // Si no hay productHistory, intentar recuperar del UnifiedMemoryService
      if (!freshMemory.productHistory || freshMemory.productHistory.length === 0) {
        console.log('💳 [ORCHESTRATOR] ⚠️ productHistory vacío, intentando recuperar de UnifiedMemory');
        // Agregar el currentProduct a productHistory si existe
        if (unifiedMemory.currentProduct) {
          freshMemory.productHistory = [{
            product: unifiedMemory.currentProduct,
            timestamp: new Date(),
            stage: 'viewed'
          }];
          freshMemory.currentProduct = unifiedMemory.currentProduct;
          console.log(`💳 [ORCHESTRATOR] ✅ Recuperado producto de UnifiedMemory: ${unifiedMemory.currentProduct.name}`);
        }
      }
      
      const response = await this.paymentAgent.execute(message, freshMemory);
      await this.unifiedMemoryService.addMessage(chatId, userId, 'assistant', response.text);
      return response;
    }

    // 🧠 OLLAMA COMO CEREBRO CENTRAL (Maneja TODO lo demás)
    // En lugar de agentes especializados, Ollama ahora maneja:
    // - Saludos
    // - Búsquedas de productos
    // - Preguntas de pago/envío
    // - Comparaciones
    // - Cierres de venta
    // - Cualquier pregunta compleja
    
    console.log('🧠 [ORCHESTRATOR] ⭐ OLLAMA MANEJA LA CONVERSACIÓN');
    const response = await this.searchAgent.execute(message, memory);
    
    // Guardar respuesta y retornar
    await this.unifiedMemoryService.addMessage(chatId, userId, 'assistant', response.text);
    return response;
  }
  
  /**
   * Detecta si el mensaje es una intención de pago
   * MEJORADO: Más estricto para evitar falsos positivos con cortesía
   */
  private detectPaymentIntent(message: string, memory: SharedMemory): boolean {
    const lower = message.toLowerCase().trim();
    
    // ❌ RECHAZAR respuestas de cortesía que NO son intención de pago
    const courtesyPatterns = [
      /^(ok|vale|bien|entendido|perfecto|gracias|de acuerdo)$/i,
      /^(ok gracias|vale gracias|perfecto gracias)$/i,
      /^(si|sí|no)$/i,
    ];
    
    for (const pattern of courtesyPatterns) {
      if (pattern.test(lower)) {
        console.log('[Orchestrator] 💬 Mensaje de cortesía detectado, NO es intención de pago');
        return false;
      }
    }
    
    // ✅ Patrones de intención de pago EXPLÍCITA
    const paymentPatterns = [
      // Solicitud directa de pago
      /\b(quiero|deseo|me interesa)\s+(pagar|comprar|adquirir)/i,
      /\b(cómo|como)\s+(pago|compro|puedo pagar)/i,
      /\b(link|enlace)\s+(de\s+)?(pago|compra)/i,
      /\b(métodos?|formas?|opciones?)\s+(de\s+)?pago/i,
      
      // Métodos específicos con contexto de pago
      /\b(pagar|comprar)\s+(con|por|mediante)\s+(mercadopago|paypal|nequi|daviplata)/i,
      /\b(dame|envía|envia|pasa|manda)\s+(el\s+)?(link|enlace)\s+(de\s+)?pago/i,
      
      // Proceder con compra
      /\b(proceder|continuar|seguir)\s+(con\s+)?(el\s+|la\s+)?(pago|compra)/i,
      /\b(me\s+lo\s+llevo|lo\s+compro|estoy\s+listo\s+para\s+pagar)/i,
      
      // Respuestas a selección de método (solo números 1-5 en contexto de pago)
      // NOTA: Solo si ya hay paymentIntent en memoria
    ];
    
    const hasPaymentPattern = paymentPatterns.some(p => p.test(lower));
    
    // Si ya está en contexto de pago, números del 1-5 son válidos
    if (memory.paymentIntent && /^[1-5]$/.test(lower)) {
      console.log('[Orchestrator] 💳 Selección de método de pago detectada');
      return true;
    }
    
    if (hasPaymentPattern) {
      console.log('[Orchestrator] 💳 Intención de pago EXPLÍCITA detectada');
      return true;
    }
    
    console.log('[Orchestrator] 💬 Sin intención de pago detectada');
    return false;
  }
}
