/**
 * Agente de Pago
 * Maneja todo el proceso de pago (funciona SIN IA externa)
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory } from './shared-memory';
import { PaymentMethodsConfig } from '@/lib/payment-methods-config';

export class PaymentAgent extends BaseAgent {
  constructor() {
    super('PaymentAgent');
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
    return true; // Los pagos NUNCA necesitan IA externa
  }
  
  /**
   * Maneja el pago localmente
   */
  async handleLocally(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('Manejando pago localmente');
    
    const product = memory.currentProduct;
    
    // Si no hay producto en contexto
    if (!product) {
      return {
        text: `Primero necesito saber qué producto quieres comprar 😊

¿Qué te interesa?`,
        nextAgent: 'search',
        confidence: 0.9,
      };
    }
    
    // Detectar si está seleccionando un método específico
    const selectedMethod = this.detectPaymentMethod(message);
    
    if (selectedMethod) {
      return await this.generatePaymentLink(product, selectedMethod, memory);
    }
    
    // Mostrar todos los métodos de pago
    return this.showAllPaymentMethods(product, memory);
  }
  
  /**
   * Detecta el método de pago seleccionado
   */
  private detectPaymentMethod(message: string): string | null {
    const msg = message.toLowerCase().trim();
    
    // Métodos virtuales
    if (msg.includes('mercadopago') || msg.includes('mercado pago') || msg === 'mercadopago') {
      return 'mercadopago';
    }
    if (msg.includes('paypal') || msg === 'paypal') {
      return 'paypal';
    }
    
    // Transferencias móviles
    if (msg.includes('nequi') || msg === 'nequi') {
      return 'nequi';
    }
    if (msg.includes('daviplata') || msg === 'daviplata') {
      return 'daviplata';
    }
    
    // Consignación bancaria
    if (msg.includes('consignacion') || msg.includes('consignación') || 
        msg.includes('bancaria') || msg.includes('banco') ||
        msg === 'consignacion' || msg === 'consignación') {
      return 'consignacion';
    }
    
    // Contraentrega
    if (msg.includes('contraentrega') || msg.includes('contra entrega') ||
        msg === 'contraentrega') {
      return 'contraentrega';
    }
    
    // Métodos genéricos
    if (msg.includes('tarjeta')) return 'mercadopago'; // Redirigir a MercadoPago
    if (msg.includes('efectivo')) return 'mercadopago'; // Redirigir a MercadoPago
    if (msg.includes('pse')) return 'mercadopago'; // Redirigir a MercadoPago
    
    return null;
  }
  
  /**
   * Muestra todos los métodos de pago disponibles según el tipo de producto
   */
  private showAllPaymentMethods(product: any, memory: SharedMemory): AgentResponse {
    this.log('Mostrando todos los métodos de pago');
    
    const price = this.formatPrice(product.price);
    const isDigital = PaymentMethodsConfig.isDigitalProduct(product);
    
    let text = `¡Perfecto! 💳 Puedes pagar *${product.name}* por:\n\n`;
    text += `💰 *Monto:* ${price}\n\n`;
    
    // Usar configuración centralizada
    text += PaymentMethodsConfig.formatMethodsList(isDigital);
    
    text += `¿Con cuál método prefieres pagar? 🤔`;
    
    // Marcar intención de pago
    memory.paymentIntent = true;
    
    return {
      text,
      nextAgent: 'payment',
      confidence: 0.95,
    };
  }
  
  /**
   * Genera link de pago para un método específico
   */
  private async generatePaymentLink(
    product: any,
    method: string,
    memory: SharedMemory
  ): Promise<AgentResponse> {
    this.log(`Generando link de pago para: ${method}`);
    
    const price = this.formatPrice(product.price);
    const isDigital = PaymentMethodsConfig.isDigitalProduct(product);
    
    // Validar que el método esté disponible para este producto
    if (!PaymentMethodsConfig.isMethodAvailable(method, isDigital)) {
      const errorMessage = PaymentMethodsConfig.getUnavailableMessage(method, isDigital);
      
      return {
        text: errorMessage,
        nextAgent: 'payment',
        confidence: 0.9,
      };
    }
    
    // Guardar método preferido
    memory.preferredPaymentMethod = method;
    memory.paymentLinkSent = true;
    
    // Generar instrucciones usando la configuración
    const instructions = PaymentMethodsConfig.generatePaymentInstructions(
      method,
      product,
      price
    );
    
    let text = `¡Excelente elección! 💳\n\n`;
    text += `📦 *Producto:* ${product.name}\n`;
    text += `💰 *Monto:* ${price}\n\n`;
    
    // Para PayPal, mostrar email directamente (más simple y siempre funciona)
    if (method === 'paypal') {
      const paypalEmail = process.env.PAYPAL_EMAIL || 'deinermena25@gmail.com';
      const priceUSD = (product.price / 4000).toFixed(2);
      
      text += `💰 *PayPal:*\n`;
      text += `📧 Email: ${paypalEmail}\n`;
      text += `💵 Monto a enviar: $${priceUSD} USD\n\n`;
      text += `*Pasos:*\n`;
      text += `1️⃣ Abre PayPal o tu app de banco\n`;
      text += `2️⃣ Envía $${priceUSD} USD a:\n`;
      text += `   ${paypalEmail}\n`;
      text += `3️⃣ En el concepto escribe: ${product.name}\n`;
      text += `4️⃣ Envíame captura del comprobante\n\n`;
    }
    // Para MercadoPago, generar link DINÁMICO
    else if (method === 'mercadopago') {
      // Usar el generador de links dinámicos
      const { BotPaymentLinkGenerator } = await import('@/lib/bot-payment-link-generator');
      const paymentResult = await BotPaymentLinkGenerator.generatePaymentLinks(
        product.id,
        memory.userId,
        1
      );
      
      if (paymentResult.success && paymentResult.mercadoPagoLink) {
        text += `🔗 *Link de MercadoPago:*\n${paymentResult.mercadoPagoLink}\n\n`;
        text += `${instructions}\n\n`;
      } else {
        // Fallback si falla la generación
        text += `${instructions}\n\n`;
        text += `⚠️ Por favor contacta con nosotros para procesar tu pago:\n`;
        text += `📱 WhatsApp: +57 304 274 8687\n\n`;
      }
    }
    // Para otros métodos, usar instrucciones
    else {
      text += `${instructions}\n\n`;
    }
    
    // Mensaje de entrega según tipo de producto
    if (isDigital) {
      text += `📧 *Entrega:* Recibirás el acceso por correo inmediatamente después de confirmar el pago ✅`;
    } else {
      text += `📦 *Envío:* Procesaremos tu pedido inmediatamente después de confirmar el pago ✅`;
    }
    
    // 🔍 DEBUG: Verificar que el texto tenga el número
    console.log('[PaymentAgent] 📝 Texto generado (primeros 300 chars):', text.substring(0, 300));
    console.log('[PaymentAgent] 🔍 Contiene número de Nequi:', text.includes('3136174267'));
    
    return {
      text,
      nextAgent: 'closing',
      confidence: 0.95,
      actions: [
        {
          type: 'send_specific_payment_method',
          method,
          product,
          formattedText: text, // Enviar el texto completo formateado
        },
      ],
    };
  }
  
  /**
   * Maneja con IA (no se usa, pero debe implementarse)
   */
  async handleWithAI(message: string, memory: SharedMemory): Promise<AgentResponse> {
    // Los pagos nunca necesitan IA, pero por si acaso
    return this.handleLocally(message, memory);
  }
}
