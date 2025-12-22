/**
 * 💳 CONFIGURACIÓN DE MÉTODOS DE PAGO
 * Define qué métodos están disponibles según el tipo de producto
 */

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  availableFor: 'all' | 'physical' | 'digital';
  instructions: string;
  accountInfo?: {
    number?: string;
    bank?: string;
    accountType?: string;
    holder?: string;
  };
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  // Métodos para TODOS los productos
  {
    id: 'mercadopago',
    name: 'MercadoPago',
    icon: '💳',
    description: 'Tarjeta, PSE, Efectivo',
    availableFor: 'all',
    instructions: `*Pasos:*
1️⃣ Haz clic en el link
2️⃣ Elige tu método (tarjeta, PSE, efectivo)
3️⃣ Completa el pago`,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '💰',
    description: 'Tarjeta internacional',
    availableFor: 'all',
    instructions: `*Pasos:*
1️⃣ Haz clic en el link
2️⃣ Ingresa con tu cuenta PayPal
3️⃣ Confirma el pago`,
  },
  {
    id: 'consignacion',
    name: 'Consignación Bancaria',
    icon: '🏦',
    description: 'Bancolombia y otros bancos',
    availableFor: 'all',
    instructions: `*Pasos:*
1️⃣ Realiza la consignación en cualquier corresponsal
2️⃣ Guarda el comprobante
3️⃣ 📸 *IMPORTANTE: Envíame una foto del comprobante aquí mismo* para procesar tu pedido`,
    accountInfo: {
      bank: 'Bancolombia',
      accountType: 'Ahorros',
      number: '123-456789-01',
      holder: 'Tecnovariedades D&S',
    },
  },
  
  // Métodos solo para productos FÍSICOS
  {
    id: 'nequi',
    name: 'Nequi',
    icon: '📱',
    description: 'Transferencia móvil instantánea',
    availableFor: 'physical',
    instructions: `*Pasos para pagar:*
1️⃣ Abre tu app Nequi
2️⃣ Selecciona "Enviar plata"
3️⃣ Ingresa el número: *3136174267*
4️⃣ Envía el monto exacto
5️⃣ 📸 *Toma captura del comprobante*
6️⃣ *Envíame la captura por aquí*

✅ *Confirmación:* Tu pedido se procesa inmediatamente al recibir el comprobante`,
    accountInfo: {
      number: '3136174267',
    },
  },
  {
    id: 'daviplata',
    name: 'Daviplata',
    icon: '📱',
    description: 'Transferencia móvil instantánea',
    availableFor: 'physical',
    instructions: `*Pasos para pagar:*
1️⃣ Abre tu app Daviplata
2️⃣ Selecciona "Enviar plata"
3️⃣ Ingresa el número: *3136174267*
4️⃣ Envía el monto exacto
5️⃣ 📸 *Toma captura del comprobante*
6️⃣ *Envíame la captura por aquí*

✅ *Confirmación:* Tu pedido se procesa inmediatamente al recibir el comprobante`,
    accountInfo: {
      number: '3136174267',
    },
  },
  {
    id: 'contraentrega',
    name: 'Contraentrega',
    icon: '🚚',
    description: 'Pago al recibir (solo algunas zonas)',
    availableFor: 'physical',
    instructions: `*Pasos:*
1️⃣ Confirma tu dirección de entrega
2️⃣ Pagas cuando recibas el producto
3️⃣ Verifica el producto antes de pagar

⚠️ *Nota:* Disponible solo en algunas zonas.
Confirma disponibilidad con nosotros.`,
  },
];

export class PaymentMethodsConfig {
  /**
   * Obtiene los métodos de pago disponibles para un producto
   */
  static getAvailableMethods(isDigital: boolean): PaymentMethod[] {
    if (isDigital) {
      // Productos digitales: solo métodos virtuales y consignación
      return PAYMENT_METHODS.filter(
        method => method.availableFor === 'all' || method.availableFor === 'digital'
      );
    } else {
      // Productos físicos: todos los métodos
      return PAYMENT_METHODS;
    }
  }
  
  /**
   * Obtiene un método de pago por ID
   */
  static getMethodById(methodId: string): PaymentMethod | null {
    return PAYMENT_METHODS.find(m => m.id === methodId) || null;
  }
  
  /**
   * Determina si un producto es digital
   */
  static isDigitalProduct(product: any): boolean {
    const category = (product.category || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    const type = (product.type || '').toLowerCase();
    
    const digitalKeywords = [
      'curso', 'megapack', 'digital', 'online',
      'ebook', 'software', 'licencia', 'descarga',
      'virtual', 'electronico', 'electrónico'
    ];
    
    return digitalKeywords.some(keyword => 
      category.includes(keyword) || 
      name.includes(keyword) ||
      type.includes(keyword)
    );
  }
  
  /**
   * Formatea la lista de métodos de pago para WhatsApp
   */
  static formatMethodsList(isDigital: boolean): string {
    const methods = this.getAvailableMethods(isDigital);
    
    let text = '📱 *Métodos de Pago (Tecnovariedades D&S):*\n\n';
    
    methods.forEach((method, index) => {
      text += `${index + 1}️⃣ *${method.name}* ${method.icon}\n`;
      text += `   ${method.description}\n\n`;
    });
    
    return text;
  }
  
  /**
   * Genera las instrucciones de pago para un método específico
   */
  static generatePaymentInstructions(
    methodId: string,
    product: any,
    price: string
  ): string {
    const method = this.getMethodById(methodId);
    
    if (!method) {
      return `Para pagar con ${methodId}, contáctanos directamente.`;
    }
    
    let text = `${method.icon} *${method.name} (Tecnovariedades D&S):*\n\n`;
    
    // Agregar información de cuenta si existe
    if (method.accountInfo) {
      if (method.accountInfo.bank) {
        text += `*Banco:* ${method.accountInfo.bank}\n`;
      }
      if (method.accountInfo.accountType) {
        text += `*Tipo de cuenta:* ${method.accountInfo.accountType}\n`;
      }
      if (method.accountInfo.number) {
        text += `*Número:* ${method.accountInfo.number}\n`;
      }
      if (method.accountInfo.holder) {
        text += `*Titular:* ${method.accountInfo.holder}\n`;
      }
      text += `*Monto:* ${price}\n`;
      text += `*Concepto:* ${product.name}\n\n`;
    }
    
    // Agregar instrucciones
    text += method.instructions;
    
    return text;
  }
  
  /**
   * Valida si un método está disponible para un producto
   */
  static isMethodAvailable(methodId: string, isDigital: boolean): boolean {
    const method = this.getMethodById(methodId);
    
    if (!method) return false;
    
    if (method.availableFor === 'all') return true;
    if (method.availableFor === 'digital' && isDigital) return true;
    if (method.availableFor === 'physical' && !isDigital) return true;
    
    return false;
  }
  
  /**
   * Obtiene mensaje de error si el método no está disponible
   */
  static getUnavailableMessage(methodId: string, isDigital: boolean): string {
    const method = this.getMethodById(methodId);
    
    if (!method) {
      return `⚠️ El método de pago "${methodId}" no está disponible.`;
    }
    
    if (isDigital && method.availableFor === 'physical') {
      return `⚠️ *${method.name}* no está disponible para productos digitales.\n\nPor favor elige otro método de pago.`;
    }
    
    return `⚠️ *${method.name}* no está disponible para este producto.\n\nPor favor elige otro método de pago.`;
  }
}
