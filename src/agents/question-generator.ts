/**
 * 🎯 GENERADOR DE PREGUNTAS INTELIGENTES
 * Genera preguntas contextuales para guiar la conversación
 */

import { SharedMemory, Product } from './shared-memory';

export interface GeneratedQuestion {
  question: string;
  purpose: 'discovery' | 'qualification' | 'objection_handling' | 'closing';
  expectedAnswers: string[];
  confidence: number;
}

export class QuestionGenerator {
  /**
   * Genera pregunta de descubrimiento (para entender qué busca)
   */
  static generateDiscoveryQuestion(memory: SharedMemory): GeneratedQuestion {
    const messageCount = memory.messageCount;
    
    // Primera interacción
    if (messageCount <= 1) {
      return {
        question: '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
        purpose: 'discovery',
        expectedAnswers: ['producto', 'servicio', 'información'],
        confidence: 0.9,
      };
    }
    
    // Segunda interacción - ser más específico
    if (messageCount === 2) {
      return {
        question: '¿Buscas algo en particular? Por ejemplo:\n• Computadores 💻\n• Motos 🏍️\n• Cursos digitales 🎓\n• Servicios técnicos 🔧',
        purpose: 'discovery',
        expectedAnswers: ['computador', 'moto', 'curso', 'servicio'],
        confidence: 0.85,
      };
    }
    
    // Tercera interacción - preguntar presupuesto
    return {
      question: '¿Tienes un presupuesto en mente? 💰',
      purpose: 'discovery',
      expectedAnswers: ['presupuesto', 'precio', 'rango'],
      confidence: 0.8,
    };
  }
  
  /**
   * Genera pregunta de calificación (para evaluar interés)
   */
  static generateQualificationQuestion(
    memory: SharedMemory,
    product: Product
  ): GeneratedQuestion {
    // Si ya envió info del producto, preguntar si le interesa
    if (memory.productInfoSent) {
      return {
        question: '¿Qué te parece? ¿Te gustaría comprarlo? 🛒',
        purpose: 'qualification',
        expectedAnswers: ['si', 'no', 'dudas', 'precio'],
        confidence: 0.9,
      };
    }
    
    // Preguntas según categoría del producto
    const category = product.category?.toLowerCase() || '';
    
    if (category.includes('curso') || category.includes('digital')) {
      return {
        question: '¿Para qué área te gustaría aprender? 🎓',
        purpose: 'qualification',
        expectedAnswers: ['diseño', 'programación', 'marketing', 'idiomas'],
        confidence: 0.85,
      };
    }
    
    if (category.includes('laptop') || category.includes('computador')) {
      return {
        question: '¿Para qué lo vas a usar? (trabajo, estudio, gaming, diseño) 💻',
        purpose: 'qualification',
        expectedAnswers: ['trabajo', 'estudio', 'gaming', 'diseño'],
        confidence: 0.85,
      };
    }
    
    if (category.includes('moto')) {
      return {
        question: '¿Qué tipo de moto buscas? (trabajo, paseo, deportiva) 🏍️',
        purpose: 'qualification',
        expectedAnswers: ['trabajo', 'paseo', 'deportiva'],
        confidence: 0.85,
      };
    }
    
    // Pregunta genérica
    return {
      question: '¿Este producto cumple con lo que buscas? 🤔',
      purpose: 'qualification',
      expectedAnswers: ['si', 'no', 'mas_info'],
      confidence: 0.75,
    };
  }
  
  /**
   * Genera pregunta para manejar objeciones
   */
  static generateObjectionHandlingQuestion(
    memory: SharedMemory,
    objectionType: string
  ): GeneratedQuestion {
    switch (objectionType) {
      case 'price':
        return {
          question: 'Entiendo tu preocupación por el precio 💰\n\n¿Te gustaría ver opciones de pago flexibles? Tenemos:\n• Pago en cuotas\n• Descuentos por pago de contado\n• Planes especiales',
          purpose: 'objection_handling',
          expectedAnswers: ['cuotas', 'descuento', 'planes'],
          confidence: 0.85,
        };
      
      case 'doubt':
        return {
          question: '¿Qué dudas tienes? 🤔 Estoy aquí para resolverlas todas',
          purpose: 'objection_handling',
          expectedAnswers: ['garantia', 'calidad', 'entrega', 'soporte'],
          confidence: 0.8,
        };
      
      case 'comparison':
        return {
          question: '¿Con qué otro producto lo estás comparando? 🔍\n\nPuedo ayudarte a ver las diferencias',
          purpose: 'objection_handling',
          expectedAnswers: ['otro_producto', 'marca', 'precio'],
          confidence: 0.8,
        };
      
      case 'timing':
        return {
          question: '¿Cuándo estarías listo para comprarlo? 📅\n\nPuedo guardarte el precio actual',
          purpose: 'objection_handling',
          expectedAnswers: ['pronto', 'semana', 'mes'],
          confidence: 0.75,
        };
      
      default:
        return {
          question: '¿Hay algo que te preocupa sobre este producto? 🤔',
          purpose: 'objection_handling',
          expectedAnswers: ['precio', 'calidad', 'garantia'],
          confidence: 0.7,
        };
    }
  }
  
  /**
   * Genera pregunta de cierre (para cerrar la venta)
   */
  static generateClosingQuestion(memory: SharedMemory): GeneratedQuestion {
    const product = memory.currentProduct;
    
    if (!product) {
      return {
        question: '¿Te gustaría ver más productos? 🔍',
        purpose: 'closing',
        expectedAnswers: ['si', 'no'],
        confidence: 0.7,
      };
    }
    
    // Si ya mostró métodos de pago
    if (memory.paymentIntent) {
      return {
        question: '¿Con qué método prefieres pagar? 💳',
        purpose: 'closing',
        expectedAnswers: ['mercadopago', 'paypal', 'nequi', 'daviplata'],
        confidence: 0.95,
      };
    }
    
    // Si ya envió link de pago
    if (memory.paymentLinkSent) {
      return {
        question: '¿Ya pudiste realizar el pago? 💳\n\nCuando lo hagas, envíame el comprobante para activar tu producto inmediatamente ✅',
        purpose: 'closing',
        expectedAnswers: ['si', 'no', 'problema'],
        confidence: 0.9,
      };
    }
    
    // Pregunta de cierre estándar
    return {
      question: '¿Procedemos con la compra? 🛒\n\nPuedo mostrarte los métodos de pago disponibles',
      purpose: 'closing',
      expectedAnswers: ['si', 'metodos', 'precio'],
      confidence: 0.85,
    };
  }
  
  /**
   * Detecta el tipo de objeción en el mensaje
   */
  static detectObjectionType(message: string): string | null {
    const msg = message.toLowerCase();
    
    if (msg.includes('caro') || msg.includes('costoso') || msg.includes('precio')) {
      return 'price';
    }
    
    if (msg.includes('duda') || msg.includes('no estoy seguro') || msg.includes('pensarlo')) {
      return 'doubt';
    }
    
    if (msg.includes('comparar') || msg.includes('otras opciones') || msg.includes('ver más')) {
      return 'comparison';
    }
    
    if (msg.includes('después') || msg.includes('luego') || msg.includes('más tarde')) {
      return 'timing';
    }
    
    return null;
  }
  
  /**
   * Genera pregunta de seguimiento basada en la respuesta anterior
   */
  static generateFollowUpQuestion(
    memory: SharedMemory,
    lastUserMessage: string
  ): GeneratedQuestion | null {
    const msg = lastUserMessage.toLowerCase();
    
    // Si mencionó presupuesto
    if (msg.includes('presupuesto') || msg.includes('precio')) {
      return {
        question: '¿Cuál es tu presupuesto aproximado? 💰',
        purpose: 'qualification',
        expectedAnswers: ['monto', 'rango'],
        confidence: 0.85,
      };
    }
    
    // Si mencionó uso específico
    if (msg.includes('trabajo') || msg.includes('estudio') || msg.includes('gaming')) {
      return {
        question: '¿Qué características son más importantes para ti? 🎯',
        purpose: 'qualification',
        expectedAnswers: ['velocidad', 'memoria', 'pantalla', 'bateria'],
        confidence: 0.8,
      };
    }
    
    // Si mencionó tiempo
    if (msg.includes('cuando') || msg.includes('cuándo') || msg.includes('fecha')) {
      return {
        question: '¿Para cuándo lo necesitas? 📅',
        purpose: 'qualification',
        expectedAnswers: ['urgente', 'semana', 'mes'],
        confidence: 0.8,
      };
    }
    
    return null;
  }
}
