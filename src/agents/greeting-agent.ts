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
    
    // Cliente nuevo
    const greetings = [
      `¡Hola! 👋 Bienvenido a *Tecnovariedades D&S*

¿Qué te gustaría ver?
💻 Computadores y laptops
🏍️ Motos
💎 Cursos digitales (Megapacks)
🔧 Servicios técnicos`,
      
      `¡Hola! 😊 Bienvenido a *Tecnovariedades D&S*

Tenemos:
• 💻 Tecnología (laptops, accesorios)
• 🏍️ Motos
• 💎 Cursos digitales
• 🔧 Servicios

¿Qué te interesa?`,
      
      `¡Hola! 👋 ¿Cómo estás?

Soy el asistente de *Tecnovariedades D&S*

Puedo ayudarte con:
✅ Información de productos
✅ Precios y disponibilidad
✅ Métodos de pago
✅ Envíos

¿Qué necesitas? 😊`,
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
