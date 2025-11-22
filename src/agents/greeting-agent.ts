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
   * Determina si puede manejar localmente (siempre SÍ)
   */
  canHandleLocally(message: string, memory: SharedMemory): boolean {
    return true; // Los saludos NUNCA necesitan IA externa
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
    
    // Cliente nuevo - SALUDO NATURAL SIN LISTAR PRODUCTOS
    const greetings = [
      `¡Hola! 👋 Bienvenido a *Tecnovariedades D&S* 😊

¿En qué puedo ayudarte hoy?`,
      
      `¡Hola! 😊 ¿Cómo estás?

Soy tu asistente de *Tecnovariedades D&S* ✨

¿Qué necesitas?`,
      
      `¡Hola! 👋 Bienvenido 😄

¿Qué estás buscando? Cuéntame y te ayudo 💬`,

      `¡Hola! 😊 ¿Cómo te va?

¿En qué te puedo ayudar hoy?`,
      
      `¡Hola! 👋 ¡Qué bueno verte por aquí!

Estoy aquí para ayudarte con lo que necesites 🚀

¿Buscas algo en particular?`,
    ];
    
    // Seleccionar saludo aleatorio
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return {
      text: greeting,
      nextAgent: 'search',
      confidence: 0.95,
    };
  }
  
  /**
   * Maneja con IA (no se usa, pero debe implementarse)
   */
  async handleWithAI(message: string, memory: SharedMemory): Promise<AgentResponse> {
    // Los saludos nunca necesitan IA, pero por si acaso
    return this.handleLocally(message, memory);
  }
}
