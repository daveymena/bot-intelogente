/**
 * Agente de Saludo
 * Maneja saludos y bienvenidas (funciona SIN IA externa)
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory } from './shared-memory';

export class GreetingAgent extends BaseAgent {
  constructor() {
    super('GreetingAgent');
  }
  
  /**
   * Ejecuta el agente
   */
  async execute(message: string, memory: SharedMemory): Promise<AgentResponse> {
    // Este agente SIEMPRE puede manejar localmente
    return this.handleLocally(message, memory);
  }
  
  /**
   * Determina si puede manejar localmente
   */
  canHandleLocally(message: string, memory: SharedMemory): boolean {
    // ✅ SALUDOS SIEMPRE USAN PLANTILLAS LOCALES
    // No necesitan Ollama porque ya tienen formato profesional perfecto
    this.log('✅ Saludos usan SIEMPRE plantillas locales (formato profesional)');
    return true;
  }
  
  /**
   * Maneja el saludo localmente
   */
  async handleLocally(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('Manejando saludo localmente');

    // 🔥 CORRECCIÓN CRÍTICA: Si ya se envió saludo en esta conversación, NO repetir
    if (memory.greetingSent) {
      this.log('Saludo ya enviado anteriormente - evitando repetición');

      // Si tiene producto en contexto, ir directo a él
      if (memory.currentProduct) {
        return {
          text: `¿Sigues interesado en el *${memory.currentProduct.name}*?

O si prefieres, puedo ayudarte con algo más 🤔`,
          nextAgent: 'product',
          confidence: 0.95,
        };
      }

      // Si no hay producto, ir a búsqueda
      return {
        text: `¿En qué puedo ayudarte? 🤔`,
        nextAgent: 'search',
        confidence: 0.95,
      };
    }

    // Marcar que se va a enviar saludo
    memory.greetingSent = true;

    const isReturningCustomer = memory.messageCount > 1;
    const hasName = !!memory.userName;

    // Cliente recurrente
    if (isReturningCustomer) {
      const greeting = hasName
        ? `¡Hola de nuevo, ${memory.userName}! 😊`
        : `¡Hola de nuevo! 😊`;

      // Si tiene producto en contexto, recordarlo
      if (memory.currentProduct) {
        return {
          text: `${greeting}

¿Sigues interesado en el *${memory.currentProduct.name}*?

O si prefieres, puedo ayudarte con algo más 🤔`,
          nextAgent: 'product',
          confidence: 0.95,
        };
      }

      return {
        text: `${greeting}

¿En qué puedo ayudarte hoy? 💡`,
        nextAgent: 'search',
        confidence: 0.95,
      };
    }
    
    // Cliente nuevo - Usar GreetingDetector con presentación del negocio
    const { GreetingDetector } = await import('../lib/greeting-detector');
    const greeting = GreetingDetector.generateGreetingResponse(memory.userName);
    
    return {
      text: greeting,
      nextAgent: 'search',
      confidence: 0.95,
    };
  }
  
  /**
   * Maneja con IA (Ollama)
   */
  async handleWithAI(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('🦙 Generando saludo con Ollama');
    
    try {
      const { AIMultiProvider } = await import('../lib/ai-multi-provider');
      
      // Construir prompt para saludo profesional
      const systemPrompt = `Eres Alex, asistente de ventas de Tecnovariedades D&S.

Tu negocio vende:
- 💻 Laptops y computadores
- 🎹 Curso de Piano Profesional
- 📚 Megapacks de cursos digitales
- 🏍️ Motos

Responde al saludo de forma amigable, profesional y breve. Preséntate y pregunta en qué puedes ayudar.

IMPORTANTE:
- Usa emojis
- Sé breve (máximo 3 líneas)
- Menciona que vendes productos digitales y físicos
- Pregunta en qué puedes ayudar`;

      const response = await AIMultiProvider.generateCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ], {
        temperature: 0.7,
        max_tokens: 150
      });
      
      this.log(`✅ Saludo generado con ${response.provider}`);
      
      // Marcar que se envió saludo
      memory.greetingSent = true;
      
      return {
        text: response.content,
        nextAgent: 'search',
        confidence: 0.95,
        metadata: {
          provider: response.provider,
          model: response.model
        }
      };
    } catch (error: any) {
      this.log(`❌ Error con IA: ${error.message}`);
      // Fallback a respuesta local
      return this.handleLocally(message, memory);
    }
  }
}
