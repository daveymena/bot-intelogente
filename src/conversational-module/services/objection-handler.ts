
import { type ProductoInfo } from '../ai/promptBuilder-simple';

export type ObjectionType = 
  | 'PRICE_TOO_HIGH'      // "Es muy caro"
  | 'TRUST_ISSUES'        // "¿Es seguro?", "¿Es estafa?"
  | 'NEED_MORE_INFO'      // "Quiero saber más detalles"
  | 'TIMING'              // "Ahora no puedo", "A fin de mes"
  | 'COMPETITOR'          // "Vi uno más barato"
  | 'AUTHORITY'           // "Tengo que preguntarle a mi esposa"
  | 'UNKNOWN';

export interface ObjectionResponse {
  type: ObjectionType;
  response: string;
  followUp?: string;
}

export class ObjectionHandler {
  
  /**
   * Detecta si el mensaje contiene una objeción
   */
  static detectObjection(message: string): ObjectionType | null {
    const msg = message.toLowerCase();
    
    // 💰 PRECIO
    if (msg.match(/(caro|costoso|mucha plata|no tengo dinero|muy alto|rebaja|descuento|menos precio)/)) {
      return 'PRICE_TOO_HIGH';
    }
    
    // 🛡️ CONFIANZA
    if (msg.match(/(seguro|estafa|confiable|garantía|real|verdad|miedo|rob|fraude)/)) {
      return 'TRUST_ISSUES';
    }
    
    // ⏳ TIEMPO
    if (msg.match(/(luego|después|fin de mes|quincena|ahora no|momento|esperar)/)) {
      return 'TIMING';
    }
    
    // 👥 AUTORIDAD
    if (msg.match(/(esposa|esposo|pareja|mamá|papá|socio|preguntar|consultar)/)) {
      return 'AUTHORITY';
    }
    
    return null;
  }

  /**
   * Genera una respuesta persuasiva para la objeción
   */
  static handleObjection(type: ObjectionType, product?: ProductoInfo): string {
    switch (type) {
      case 'PRICE_TOO_HIGH':
        return this.handlePriceObjection(product);
      case 'TRUST_ISSUES':
        return this.handleTrustObjection();
      case 'TIMING':
        return this.handleTimingObjection();
      case 'AUTHORITY':
        return this.handleAuthorityObjection();
      default:
        return '';
    }
  }

  private static handlePriceObjection(product?: ProductoInfo): string {
    const precio = product ? `$${product.precio.toLocaleString('es-CO')}` : 'este precio';
    return `Entiendo que el precio es importante. 💰\n\nSin embargo, piensa en esto como una inversión y no un gasto. Por ${precio}, obtienes:\n\n✅ Calidad garantizada\n✅ Soporte incluido\n✅ Acceso inmediato\n\n¿Te gustaría ver facilidades de pago?`;
  }

  private static handleTrustObjection(): string {
    return `Te entiendo perfectamente, hoy en día hay que tener cuidado. 🛡️\n\nPor eso nosotros ofrecemos:\n\n✅ Garantía de devolución\n✅ Pagos seguros (Nequi, Daviplata)\n✅ Cientos de clientes satisfechos\n\n¿Qué te daría más tranquilidad para proceder?`;
  }

  private static handleTimingObjection(): string {
    return `Entiendo. Solo ten en cuenta que esta oferta especial ⏳ tiene cupos limitados y podría cambiar pronto.\n\n¿Te gustaría que te reservemos el precio actual por 24 horas?`;
  }
  
  private static handleAuthorityObjection(): string {
    return `¡Claro! Es importante tomar decisiones en conjunto. 👥\n\n¿Te gustaría que te envíe un resumen con los beneficios clave para que se lo muestres?`;
  }
}
