/**
 * Manejador de Respuestas Locales
 * Responde sin usar IA para casos simples (0 tokens)
 */

import { Product } from '@/agents/shared-memory';

export class LocalResponseHandler {
  
  /**
   * Verifica si puede responder localmente (sin IA)
   */
  static canHandleLocally(message: string, context?: any): boolean {
    // 🚫 DESACTIVADO: Forzar uso de Ollama para todo
    if (process.env.DISABLE_LOCAL_RESPONSES === 'true') {
      console.log('🚫 [LOCAL] Respuestas locales desactivadas - Usando Ollama');
      return false;
    }
    
    const lower = message.toLowerCase().trim();
    
    // 1. Saludos
    if (this.isGreeting(lower)) return true;
    
    // 2. Consulta de precio directo
    if (this.isPriceQuery(lower)) return true;
    
    // 3. Solicitud de fotos
    if (this.isPhotoRequest(lower)) return true;
    
    // 4. Ver más información
    if (this.isMoreInfoRequest(lower)) return true;
    
    // 5. Información de pago
    if (this.isPaymentInfoRequest(lower)) return true;
    
    // 6. Confirmación simple (sí/no)
    if (this.isSimpleConfirmation(lower)) return true;
    
    return false;
  }
  
  /**
   * Genera respuesta local (sin IA)
   */
  static async generateLocalResponse(
    message: string,
    context: {
      currentProduct?: Product;
      businessInfo?: any;
      paymentMethods?: any;
    }
  ): Promise<string> {
    const lower = message.toLowerCase().trim();
    
    // 1. SALUDOS
    if (this.isGreeting(lower)) {
      return this.getGreetingResponse();
    }
    
    // 2. PRECIO
    if (this.isPriceQuery(lower) && context.currentProduct) {
      return this.getPriceResponse(context.currentProduct);
    }
    
    // 3. FOTOS
    if (this.isPhotoRequest(lower) && context.currentProduct) {
      return this.getPhotoResponse(context.currentProduct);
    }
    
    // 4. MÁS INFORMACIÓN
    if (this.isMoreInfoRequest(lower) && context.currentProduct) {
      return this.getMoreInfoResponse(context.currentProduct);
    }
    
    // 5. INFORMACIÓN DE PAGO
    if (this.isPaymentInfoRequest(lower)) {
      return this.getPaymentInfoResponse(context.paymentMethods);
    }
    
    // 6. CONFIRMACIÓN
    if (this.isSimpleConfirmation(lower)) {
      return this.getConfirmationResponse(context.currentProduct);
    }
    
    return '';
  }
  
  // ==================== DETECTORES ====================
  
  private static isGreeting(message: string): boolean {
    const greetings = [
      'hola', 'buenos dias', 'buenas tardes', 'buenas noches',
      'buen dia', 'buena tarde', 'buena noche', 'saludos',
      'hey', 'ey', 'holi', 'holaaa', 'que tal', 'como estas'
    ];
    return greetings.some(g => message.includes(g));
  }
  
  private static isPriceQuery(message: string): boolean {
    const patterns = [
      /cuanto cuesta/i,
      /cual es el precio/i,
      /que precio/i,
      /cuanto vale/i,
      /precio/i,
      /valor/i,
      /costo/i
    ];
    return patterns.some(p => p.test(message));
  }
  
  private static isPhotoRequest(message: string): boolean {
    const patterns = [
      /foto/i,
      /imagen/i,
      /ver.*foto/i,
      /muestra.*foto/i,
      /envia.*foto/i,
      /manda.*foto/i,
      /como.*se.*ve/i,
      /como.*es/i
    ];
    return patterns.some(p => p.test(message));
  }
  
  private static isMoreInfoRequest(message: string): boolean {
    const patterns = [
      /mas.*informacion/i,
      /más.*información/i,
      /mas.*info/i,
      /más.*info/i,
      /detalles/i,
      /caracteristicas/i,
      /especificaciones/i,
      /cuentame.*mas/i,
      /dime.*mas/i
    ];
    return patterns.some(p => p.test(message));
  }
  
  private static isPaymentInfoRequest(message: string): boolean {
    const patterns = [
      /como.*pago/i,
      /metodos.*pago/i,
      /formas.*pago/i,
      /puedo.*pagar/i,
      /acepta/i,
      /nequi/i,
      /daviplata/i,
      /transferencia/i,
      /efectivo/i,
      /consignacion/i,
      /consignar/i,
      /cuenta/i
    ];
    return patterns.some(p => p.test(message));
  }
  
  private static isSimpleConfirmation(message: string): boolean {
    const confirmations = ['si', 'sí', 'ok', 'vale', 'dale', 'claro', 'perfecto', 'bueno'];
    return confirmations.some(c => message === c || message === c + '!');
  }
  
  // ==================== GENERADORES DE RESPUESTAS ====================
  
  private static async getGreetingResponse(): Promise<string> {
    // Usar el GreetingDetector para respuestas con presentación del negocio
    const { GreetingDetector } = await import('./greeting-detector');
    return GreetingDetector.generateGreetingResponse();
  }
  
  private static getPriceResponse(product: Product): string {
    return `💰 **${product.name}**\n\nPrecio: $${product.price.toLocaleString()} COP\n\n¿Te gustaría más información o ver fotos? 📸`;
  }
  
  private static getPhotoResponse(product: Product): string {
    return `📸 Te envío las fotos de **${product.name}**\n\n¿Te interesa? Puedo darte más información. 😊`;
  }
  
  private static getMoreInfoResponse(product: Product): string {
    let response = `📋 **${product.name}**\n\n`;
    
    if (product.description) {
      response += `${product.description}\n\n`;
    }
    
    response += `💰 Precio: $${product.price.toLocaleString()} COP\n`;
    response += `📦 Categoría: ${product.category}\n\n`;
    response += `¿Quieres que te envíe fotos o información de pago? 🤔`;
    
    return response;
  }
  
  private static getPaymentInfoResponse(paymentMethods?: any): string {
    let response = '💳 **Métodos de Pago Disponibles:**\n\n';
    
    // Información REAL de pago (nunca inventar)
    const nequiNumber = process.env.NEQUI_NUMBER || '3136174267';
    const daviplataNumber = process.env.DAVIPLATA_NUMBER || '3136174267';
    
    response += `✅ **Nequi:** ${nequiNumber}\n`;
    response += `✅ **Daviplata:** ${daviplataNumber}\n`;
    response += '✅ **Transferencia bancaria**\n';
    response += '✅ **Efectivo** (contraentrega)\n\n';
    
    response += '¿Con cuál método te gustaría pagar? 😊';
    
    return response;
  }
  
  private static getConfirmationResponse(product?: Product): string {
    if (product) {
      return `¡Perfecto! 🎉 Te ayudo con **${product.name}**.\n\n¿Quieres proceder con la compra o necesitas más información?`;
    }
    return '¡Perfecto! 👍 ¿En qué más puedo ayudarte?';
  }
}
