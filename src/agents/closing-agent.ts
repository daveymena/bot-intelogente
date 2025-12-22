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
    if (this.isPendingPayment(cleanMsg)) {
      return this.handlePendingPayment(memory);
    }
    
    if (this.isFarewell(cleanMsg)) {
      return this.handleFarewell(memory);
    }
    
    if (this.isComplaint(cleanMsg)) {
      return this.handleComplaint(memory);
    }
    
    if (this.isPaymentConfirmation(cleanMsg)) {
      return await this.handlePaymentConfirmation(memory);
    }
    
    if (this.isDeliveryQuery(cleanMsg)) {
      return this.handleDeliveryInfo(memory);
    }

    if (this.isRepairRequest(cleanMsg)) {
      return await this.handleRepairRequest(memory);
    }

    if (this.isAppointmentRequest(cleanMsg)) {
      return await this.handleAppointmentRequest(memory);
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
      `¡Gracias por escribir a Tecnovariedades D&S! 😊

Si necesitas algo más, aquí estaré.

¡Que tengas un excelente día! 🌟`,
      
      `¡Hasta pronto de parte de Tecnovariedades D&S! 👋

Estamos disponibles 24/7 para ayudarte.

¡Feliz día! ☀️`,
      
      `¡Nos vemos! 😊

Cualquier duda, no dudes en escribirnos.

Equipo Tecnovariedades D&S 💙`,
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
      text: `Lamentamos el inconveniente 😔

En Tecnovariedades D&S tu satisfacción es prioridad.

¿Podrías contarme qué sucedió? Te ayudamos a resolverlo de inmediato 🙏

Contacto directo:
📱 WhatsApp: +57 300 556 0186
📧 Email: deinermena25@gmail.com`,
      nextAgent: 'support',
      confidence: 0.9,
    };
  }
  
  /**
   * Maneja confirmación de pago
   */
  private async handlePaymentConfirmation(memory: SharedMemory): Promise<AgentResponse> {
    this.log('Manejando confirmación de pago');
    
    const product = memory.currentProduct;
    
    if (!product) {
      try {
        const { HumanEscalationService } = await import('@/lib/human-escalation-service');
        const customerPhone = memory.chatId.split(':')[1] || memory.chatId;
        await HumanEscalationService.notifyAdmin(
          memory.userId,
          customerPhone,
          memory.userName || 'Cliente',
          'PAGO_CONFIRMADO',
          'Cliente confirmó pago, sin contexto de producto'
        );
      } catch {}
      try {
        const { EmailService } = await import('@/lib/email-service');
        const adminEmail = process.env.ADMIN_EMAIL || 'deinermena25@gmail.com';
        const customerPhone = memory.chatId.split(':')[1] || memory.chatId;
        await EmailService.sendEmail({
          to: adminEmail,
          subject: '✅ Pago confirmado (sin producto en contexto)',
          html: `Cliente: ${memory.userName || 'Cliente'}<br/>Teléfono: ${customerPhone}`,
          text: `Pago confirmado. Cliente: ${memory.userName || 'Cliente'}. Tel: ${customerPhone}`
        });
      } catch {}
      return {
        text: `¡Gracias por tu pago! 🎉

¿Qué producto compraste? Así te ayudamos con la entrega desde Tecnovariedades D&S.`,
        nextAgent: 'search',
        confidence: 0.8,
      };
    }
    
    try {
      const { HumanEscalationService } = await import('@/lib/human-escalation-service');
      const customerPhone = memory.chatId.split(':')[1] || memory.chatId;
      await HumanEscalationService.notifyAdmin(
        memory.userId,
        customerPhone,
        memory.userName || 'Cliente',
        'PAGO_CONFIRMADO',
        `Pago confirmado de ${product.name} por $${product.price.toLocaleString('es-CO')} COP`
      );
    } catch {}
    try {
      const { EmailService } = await import('@/lib/email-service');
      const adminEmail = process.env.ADMIN_EMAIL || 'deinermena25@gmail.com';
      const price = `${product.price.toLocaleString('es-CO')} COP`;
      const customerPhone = memory.chatId.split(':')[1] || memory.chatId;
      await EmailService.sendEmail({
        to: adminEmail,
        subject: '✅ Pago confirmado',
        html: `Cliente: ${memory.userName || 'Cliente'}<br/>Producto: ${product.name}<br/>Monto: ${price}<br/>Teléfono: ${customerPhone}`,
        text: `Pago confirmado. Producto: ${product.name}. Monto: ${price}. Tel: ${customerPhone}`
      });
    } catch {}
    return {
      text: `¡Excelente! 🎉 Gracias por tu compra de *${product.name}* con Tecnovariedades D&S

📧 Próximos pasos:
1️⃣ Recibirás un correo de confirmación
2️⃣ Te enviaremos las instrucciones de entrega
3️⃣ Si es un producto digital, recibirás acceso inmediato

⏱️ Tiempo de entrega:
• Digital: Acceso inmediato
• Físico: 1-3 días hábiles

¿Necesitas algo más? 😊
Estamos para ayudarte 24/7 💙`,
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

  private handleDeliveryInfo(memory: SharedMemory): AgentResponse {
    const product = memory.currentProduct;
    if (!product) {
      return {
        text: `Realizamos envíos a domicilio 🛵

¿Sobre cuál producto te gustaría conocer tiempo y forma de entrega?`,
        nextAgent: 'search',
        confidence: 0.85,
      };
    }
    const isDigital = /curso|digital/i.test(product.category);
    if (isDigital) {
      return {
        text: `Para *${product.name}* la entrega es digital ✅

Acceso inmediato tras confirmar el pago.
Recibirás instrucciones por correo y WhatsApp al instante (Tecnovariedades D&S).`,
        nextAgent: 'greeting',
        confidence: 0.95,
      };
    }
    return {
      text: `Para *${product.name}* manejamos envío a domicilio 🛵

Tiempo estimado: 1-3 días hábiles según tu ciudad.
Coordinamos dirección y horario tras confirmar el pago (Tecnovariedades D&S).`,
      nextAgent: 'greeting',
      confidence: 0.95,
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
   * Detecta si es pago pendiente (luego te envío, etc.)
   */
  private isPendingPayment(msg: string): boolean {
    const pendingPatterns = [
      'luego te envio', 'luego te mando', 'luego te paso',
      'despues te envio', 'despues te mando', 'despues te paso',
      'más tarde te envio', 'mas tarde te envio',
      'ahorita te envio', 'ya te envio',
      'voy a pagar', 'voy a hacer el pago', 'voy a transferir',
      'dame un momento', 'espera un momento', 'dame unos minutos'
    ];
    return pendingPatterns.some(p => msg.includes(p));
  }

  /**
   * Maneja pago pendiente
   */
  private handlePendingPayment(memory: SharedMemory): AgentResponse {
    this.log('Manejando pago pendiente');
    
    const product = memory.currentProduct;
    
    if (!product) {
      return {
        text: `¡Perfecto! 😊 Quedo atento a tu comprobante.

Cuando lo tengas, envíamelo por aquí y te ayudo con la entrega.

¿Hay algo más en lo que pueda ayudarte mientras tanto?`,
        nextAgent: 'greeting',
        confidence: 0.9,
      };
    }
    
    return {
      text: `¡Perfecto! 😊 Quedo atento a tu comprobante de pago de *${product.name}*

📱 Cuando lo tengas, envíamelo por aquí y te ayudo con la entrega inmediata.

💡 Recuerda:
• Precio: ${product.price.toLocaleString('es-CO')} COP
• Métodos: MercadoPago, PayPal, Transferencia, Nequi

¿Necesitas algo más mientras tanto? 💙`,
      nextAgent: 'greeting',
      confidence: 0.95,
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

  private isDeliveryQuery(msg: string): boolean {
    return (
      msg.includes('entrega') ||
      msg.includes('envio') ||
      msg.includes('envío') ||
      msg.includes('domicilio') ||
      msg.includes('como me lo envias') ||
      msg.includes('cómo me lo envías') ||
      msg.includes('cuando llega') ||
      msg.includes('cuándo llega') ||
      msg.includes('tiempo de entrega')
    );
  }
  
  private isRepairRequest(msg: string): boolean {
    return /reparaci[oó]n|reparar|arreglar|arreglo|mantenimiento|formatear|instalar|no funciona|da[ñn]ado/i.test(msg) && /computador|pc|laptop|portatil|port[aá]til|equipo|celular|consola/i.test(msg);
  }

  private isAppointmentRequest(msg: string): boolean {
    if (/agendar|cita|agenda|reservar|visita/i.test(msg)) return true;
    if (/ver/i.test(msg) && /(moto|producto|local|tienda|negocio|laptop|computador)/i.test(msg) && !/(foto|imagen|picture|pic)/i.test(msg)) return true;
    return false;
  }

  private async handleRepairRequest(memory: SharedMemory): Promise<AgentResponse> {
    try {
      const { HumanEscalationService } = await import('@/lib/human-escalation-service');
      const customerPhone = memory.chatId.split(':')[1] || memory.chatId;
      const responseText = HumanEscalationService.generateEscalationResponse('REPARACION');
      await HumanEscalationService.notifyAdmin(
        memory.userId,
        customerPhone,
        memory.userName || 'Cliente',
        'REPARACION',
        'Solicitud de servicio técnico de reparación'
      );
      return {
        text: responseText,
        nextAgent: 'closing',
        confidence: 0.95,
      };
    } catch {
      return {
        text: 'Ofrecemos servicio técnico y reparación. ¿Qué equipo es y qué problema presenta?',
        nextAgent: 'closing',
        confidence: 0.8,
      };
    }
  }

  private async handleAppointmentRequest(memory: SharedMemory): Promise<AgentResponse> {
    try {
      const { HumanEscalationService } = await import('@/lib/human-escalation-service');
      const customerPhone = memory.chatId.split(':')[1] || memory.chatId;
      const responseText = HumanEscalationService.generateEscalationResponse('CITA');
      await HumanEscalationService.notifyAdmin(
        memory.userId,
        customerPhone,
        memory.userName || 'Cliente',
        'CITA',
        'Solicitud de agendamiento de cita'
      );
      return {
        text: responseText,
        nextAgent: 'closing',
        confidence: 0.95,
      };
    } catch {
      return {
        text: '¿Qué producto o servicio quieres ver y cuándo te gustaría venir? (mañana/tarde)',
        nextAgent: 'closing',
        confidence: 0.8,
      };
    }
  }
  
  /**
   * Maneja con IA (no se usa, pero debe implementarse)
   */
  async handleWithAI(message: string, memory: SharedMemory): Promise<AgentResponse> {
    // El cierre nunca necesita IA, pero por si acaso
    return this.handleLocally(message, memory);
  }
}
