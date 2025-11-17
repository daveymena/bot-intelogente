/**
 * Agente de Cierre
 * Maneja cierre de ventas, despedidas y soporte (funciona SIN IA externa)
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory } from './shared-memory';

export class ClosingAgent extends BaseAgent {
  constructor() {
    super('ClosingAgent');
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
    return true; // Cierre y soporte NUNCA necesitan IA externa
  }
  
  /**
   * Maneja el cierre localmente
   */
  async handleLocally(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('Manejando cierre/soporte localmente');
    
    const cleanMsg = this.cleanMessage(message);
    
    // Detectar tipo de mensaje
    if (this.isFarewell(cleanMsg)) {
      return this.handleFarewell(memory);
    }
    
    if (this.isComplaint(cleanMsg)) {
      return this.handleComplaint(memory);
    }
    
    if (this.isPaymentConfirmation(cleanMsg)) {
      return this.handlePaymentConfirmation(memory);
    }
    
    // Cierre general
    return this.handleGeneralClosing(memory);
  }
  
  /**
   * Maneja despedida
   */
  private handleFarewell(memory: SharedMemory): AgentResponse {
    this.log('Manejando despedida');
    
    const farewells = [
      `¡Gracias por escribir! 😊

Si necesitas algo más, aquí estaré.

¡Que tengas un excelente día! 🌟`,
      
      `¡Hasta pronto! 👋

Recuerda que estamos disponibles 24/7 para ayudarte.

¡Feliz día! ☀️`,
      
      `¡Nos vemos! 😊

Cualquier duda, no dudes en escribir.

¡Cuídate! 💙`,
    ];
    
    const farewell = farewells[Math.floor(Math.random() * farewells.length)];
    
    return {
      text: farewell,
      nextAgent: 'greeting',
      confidence: 0.95,
    };
  }
  
  /**
   * Maneja queja o reclamo
   */
  private handleComplaint(memory: SharedMemory): AgentResponse {
    this.log('Manejando queja/reclamo');
    
    return {
      text: `Lamento mucho que hayas tenido un inconveniente 😔

Tu satisfacción es muy importante para nosotros.

¿Podrías contarme qué sucedió? Voy a ayudarte a resolverlo lo antes posible 🙏

También puedes contactarnos directamente:
📱 WhatsApp: +57 300 556 0186
📧 Email: deinermena25@gmail.com`,
      nextAgent: 'support',
      confidence: 0.9,
    };
  }
  
  /**
   * Maneja confirmación de pago
   */
  private handlePaymentConfirmation(memory: SharedMemory): AgentResponse {
    this.log('Manejando confirmación de pago');
    
    const product = memory.currentProduct;
    
    if (!product) {
      return {
        text: `¡Gracias por tu pago! 🎉

¿Qué producto compraste? Así puedo ayudarte con la entrega.`,
        nextAgent: 'search',
        confidence: 0.8,
      };
    }
    
    return {
      text: `¡Excelente! 🎉 Gracias por tu compra de *${product.name}*

📧 *Próximos pasos:*

1️⃣ Recibirás un correo de confirmación
2️⃣ Te enviaremos las instrucciones de entrega
3️⃣ Si es un producto digital, recibirás acceso inmediato

⏱️ *Tiempo de entrega:*
• Productos digitales: Inmediato
• Productos físicos: 1-3 días hábiles

¿Necesitas algo más? 😊

Estamos aquí para ayudarte 24/7 💙`,
      nextAgent: 'greeting',
      confidence: 0.95,
      actions: [
        {
          type: 'mark_as_sold',
          data: { product },
        },
        {
          type: 'send_email',
          data: { type: 'confirmation', product },
        },
      ],
    };
  }
  
  /**
   * Maneja cierre general
   */
  private handleGeneralClosing(memory: SharedMemory): AgentResponse {
    this.log('Manejando cierre general');
    
    return {
      text: `¿Hay algo más en lo que pueda ayudarte? 😊

Puedo ayudarte con:
• Información de productos
• Precios y disponibilidad
• Métodos de pago
• Soporte técnico

¿Qué necesitas? 💡`,
      nextAgent: 'search',
      confidence: 0.7,
    };
  }
  
  /**
   * Detecta si es despedida
   */
  private isFarewell(msg: string): boolean {
    const farewells = [
      'adios', 'chao', 'hasta luego', 'nos vemos', 'bye',
      'gracias', 'muchas gracias', 'ok gracias', 'perfecto gracias',
      'eso es todo', 'nada mas', 'nada más'
    ];
    return farewells.some(f => msg.includes(f));
  }
  
  /**
   * Detecta si es queja
   */
  private isComplaint(msg: string): boolean {
    return (
      msg.includes('queja') ||
      msg.includes('reclamo') ||
      msg.includes('problema') ||
      msg.includes('mal') ||
      msg.includes('no funciona') ||
      msg.includes('no llego') ||
      msg.includes('no llegó')
    );
  }
  
  /**
   * Detecta si es confirmación de pago
   */
  private isPaymentConfirmation(msg: string): boolean {
    return (
      msg.includes('ya pague') ||
      msg.includes('ya pagué') ||
      msg.includes('listo') && msg.includes('pago') ||
      msg.includes('transferi') ||
      msg.includes('envie') && msg.includes('dinero') ||
      msg.includes('comprobante')
    );
  }
  
  /**
   * Maneja con IA (no se usa, pero debe implementarse)
   */
  async handleWithAI(message: string, memory: SharedMemory): Promise<AgentResponse> {
    // El cierre nunca necesita IA, pero por si acaso
    return this.handleLocally(message, memory);
  }
}
