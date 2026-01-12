/**
 * Agente de Preguntas Generales
 * Maneja preguntas que NO son sobre productos usando IA
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory } from './shared-memory';

export class GeneralQAAgent extends BaseAgent {
  constructor() {
    super('GeneralQAAgent');
  }
  
  /**
   * Ejecuta el agente
   */
  async execute(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('🤔 Manejando pregunta general con IA');
    
    // Siempre usar IA para preguntas generales
    return this.handleWithAI(message, memory);
  }
  
  /**
   * Determina si puede manejar localmente (nunca)
   */
  canHandleLocally(message: string, memory: SharedMemory): boolean {
    return false; // Siempre usar IA para preguntas generales
  }
  
  /**
   * Maneja localmente (no implementado)
   */
  async handleLocally(message: string, memory: SharedMemory): Promise<AgentResponse> {
    // No se usa, pero debe implementarse
    return this.handleWithAI(message, memory);
  }
  
  /**
   * Maneja con IA o KnowledgeService
   */
  async handleWithAI(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('Intentando responder con KnowledgeService primero');
    
    try {
      // 1. PRIMERO: Intentar responder con KnowledgeService (datos reales)
      const { KnowledgeService } = await import('@/lib/knowledge-service');
      
      const productId = memory.currentProduct?.id;
      const productName = memory.currentProduct?.name;
      
      const answer = await KnowledgeService.answerProductQuestion(
        message,
        productId,
        productName
      );
      
      // Si la respuesta tiene alta confianza, usarla directamente
      if (answer.confidence === 'high' || answer.confidence === 'medium') {
        this.log(`✅ Respondido con KnowledgeService (${answer.confidence} confidence)`);
        
        return {
          text: answer.answer,
          nextAgent: answer.requiresHumanAssistance ? 'closing' : 'search',
          confidence: answer.confidence === 'high' ? 0.95 : 0.75,
        };
      }
      
      // 2. Si KnowledgeService no puede responder con confianza, usar IA SOLO para reformular
      this.log('KnowledgeService no pudo responder, usando IA como fallback');
      
      const { AIMultiProvider } = await import('@/lib/ai-multi-provider');
      
      // Construir contexto
      const context = this.buildContext(memory);
      
      // Prompt MUY RESTRICTIVO - solo reformular, NO inventar
      const systemPrompt = `Eres un asistente de Tecnovariedades D&S.

REGLA CRÍTICA: NUNCA inventes información sobre productos. Solo usa información REAL.

Si el cliente pregunta algo que no sabes, di:
"No tengo esa información específica. ¿Puedo ayudarte con algo más?"

INFORMACIÓN REAL:
- Métodos de pago: MercadoPago, PayPal, Nequi, Daviplata, Contraentrega
- Envíos: A toda Colombia (2-5 días hábiles)
- Garantía: 7 días
- WhatsApp: +57 304 274 8687

${context}`;

      const userPrompt = `Pregunta: "${message}"

Responde SOLO si tienes información real. Si no, admite que no sabes.
Máximo 2-3 líneas.`;

      const response = await AIMultiProvider.generateResponse(
        systemPrompt,
        userPrompt,
        {
          temperature: 0.3, // Baja temperatura = menos creatividad = menos invención
          maxTokens: 150,
        }
      );
      
      return {
        text: response,
        nextAgent: 'search',
        confidence: 0.6,
      };
      
    } catch (error) {
      this.log('Error en Q&A:', error);
      
      // Fallback ultra-simple
      return {
        text: `No tengo esa información. ¿Puedo ayudarte con algo más sobre nuestros productos?`,
        nextAgent: 'search',
        confidence: 0.4,
      };
    }
  }
  
  /**
   * Construye contexto de la conversación
   */
  private buildContext(memory: SharedMemory): string {
    let context = '';
    
    if (memory.currentProduct) {
      context += `\nProducto actual en conversación: ${memory.currentProduct.name}`;
    }
    
    if (memory.interestedProducts.length > 0) {
      context += `\nProductos que ha visto: ${memory.interestedProducts.map(p => p.name).join(', ')}`;
    }
    
    if (memory.lastQuery) {
      context += `\nÚltima búsqueda: ${memory.lastQuery}`;
    }
    
    return context;
  }
}
