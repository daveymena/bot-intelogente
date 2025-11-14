/**
 * 🎭 SISTEMA DE PERSONALIDAD CONVERSACIONAL
 * 
 * Hace que el bot suene más humano y natural, con:
 * - Variedad en respuestas
 * - Emojis contextuales
 * - Tono colombiano amigable
 * - Fluidez conversacional
 * - Técnicas de venta sutiles
 */

export interface PersonalityConfig {
  name: string;
  tone: 'formal' | 'casual' | 'friendly';
  useEmojis: boolean;
  regionalVariant: 'colombia' | 'neutral';
}

const DEFAULT_PERSONALITY: PersonalityConfig = {
  name: 'Tecnovariedades D&S',
  tone: 'friendly',
  useEmojis: true,
  regionalVariant: 'colombia'
};

/**
 * 🎨 Variaciones de saludos naturales
 */
const GREETINGS = [
  '¡Hola! 👋 ¿Cómo estás? Soy de Tecnovariedades D&S',
  '¡Buenas! 😊 Un gusto saludarte',
  '¡Hey! ¿Qué tal? Bienvenido',
  'Hola, ¿cómo te va? 🙌',
  '¡Hola! Qué bueno que escribes'
];

/**
 * 🎨 Variaciones de confirmación
 */
const CONFIRMATIONS = [
  '¡Perfecto!',
  '¡Claro que sí!',
  '¡Dale!',
  '¡Excelente!',
  '¡Súper!',
  '¡Genial!',
  'Entendido',
  'Ok, perfecto'
];

/**
 * 🎨 Transiciones naturales
 */
const TRANSITIONS = [
  'Déjame contarte',
  'Mira',
  'Te cuento',
  'Fíjate que',
  'Ojo con esto',
  'Escucha',
  'Te explico'
];

/**
 * 🎨 Preguntas de seguimiento naturales
 */
const FOLLOW_UPS = [
  '¿Qué te parece?',
  '¿Te sirve?',
  '¿Qué opinas?',
  '¿Te cuadra?',
  '¿Dale?',
  '¿Qué dices?',
  '¿Te interesa?'
];

/**
 * 🎨 Expresiones colombianas naturales
 */
const COLOMBIAN_EXPRESSIONS = {
  agreement: ['¡Listo!', '¡Dale!', '¡Bacano!', '¡Chévere!'],
  surprise: ['¡Uy!', '¡Ala!', '¡Qué nota!'],
  emphasis: ['parcero', 'hermano', 'amigo'],
  positive: ['¡Qué chimba!', '¡Qué bien!', '¡Perfecto!']
};

/**
 * 🎯 Añade personalidad a una respuesta genérica
 */
export function humanizeResponse(response: string, context?: {
  isFirstMessage?: boolean;
  hasProductMatch?: boolean;
  customerName?: string;
  previousInteraction?: boolean;
}): string {
  
  let humanized = response;
  
  // Si es el primer mensaje, añadir saludo natural
  if (context?.isFirstMessage && !response.toLowerCase().startsWith('hola')) {
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    humanized = `${greeting} ${humanized}`;
  }
  
  // Añadir confirmación natural al inicio si es apropiado
  if (context?.hasProductMatch && !response.includes('!')) {
    const confirmation = CONFIRMATIONS[Math.floor(Math.random() * CONFIRMATIONS.length)];
    humanized = `${confirmation} ${humanized}`;
  }
  
  // Añadir pregunta de seguimiento al final si no tiene
  if (!response.includes('?') && context?.hasProductMatch) {
    const followUp = FOLLOW_UPS[Math.floor(Math.random() * FOLLOW_UPS.length)];
    humanized = `${humanized}\n\n${followUp}`;
  }
  
  return humanized;
}

/**
 * 🎯 Genera introducción natural para productos
 */
export function generateProductIntro(productName: string, reason?: string): string {
  const intros = [
    `Mira, te tengo algo perfecto:`,
    `Déjame mostrarte esto:`,
    `Tengo justo lo que necesitas:`,
    `Fíjate en esta opción:`,
    `Te va a gustar esto:`,
    `Ojo con esta belleza:`
  ];
  
  const intro = intros[Math.floor(Math.random() * intros.length)];
  
  if (reason && reason.length > 30) {
    return `${intro}\n\n💡 ${reason}\n`;
  }
  
  return intro;
}

/**
 * 🎯 Genera cierre de venta natural (no agresivo)
 */
export function generateSoftClose(productName: string, price: number): string {
  const closes = [
    `¿Te gustaría llevártelo?`,
    `¿Qué dices, te animas?`,
    `¿Te lo aparto?`,
    `¿Quieres más info o cerramos?`,
    `¿Dale, lo coordinamos?`
  ];
  
  const close = closes[Math.floor(Math.random() * closes.length)];
  
  return `\n\n${close} 😊`;
}

/**
 * 🎯 Maneja objeciones de forma natural
 */
export function handleObjection(objectionType: 'price' | 'trust' | 'thinking', productContext?: any): string {
  
  switch (objectionType) {
    case 'price':
      return `Entiendo que el precio es importante. ${TRANSITIONS[2]}, este producto tiene muy buena relación calidad-precio. ¿Cuál sería tu presupuesto ideal?`;
    
    case 'trust':
      return `${CONFIRMATIONS[0]} Te entiendo perfectamente. Mira, llevamos años en esto y todos nuestros productos tienen garantía real. ¿Qué te haría sentir más seguro?`;
    
    case 'thinking':
      return `${CONFIRMATIONS[6]} Tómate tu tiempo. ${TRANSITIONS[1]}, si quieres te lo puedo apartar con un pequeño anticipo, sin compromiso. ¿Te parece?`;
    
    default:
      return `Claro, entiendo. ¿Hay algo específico que te preocupe?`;
  }
}

/**
 * 🎯 Detecta señales de compra en el mensaje
 */
export function detectBuyingIntent(message: string): {
  hasBuyingIntent: boolean;
  intentType?: 'ready' | 'interested' | 'asking_details';
  confidence: number;
} {
  const normalized = message.toLowerCase();
  
  // Señales fuertes de compra
  const strongSignals = [
    'lo quiero', 'me lo llevo', 'cómo pago', 'dónde pago',
    'cuándo puedo', 'lo aparto', 'me interesa mucho',
    'está disponible', 'tienen en stock', 'lo compro'
  ];
  
  // Señales medias
  const mediumSignals = [
    'precio', 'costo', 'cuánto', 'garantía', 'envío',
    'entrega', 'formas de pago', 'ubicación', 'horario'
  ];
  
  // Señales de interés
  const interestSignals = [
    'me gusta', 'interesante', 'bueno', 'bien',
    'más info', 'fotos', 'especificaciones'
  ];
  
  if (strongSignals.some(signal => normalized.includes(signal))) {
    return { hasBuyingIntent: true, intentType: 'ready', confidence: 90 };
  }
  
  if (mediumSignals.some(signal => normalized.includes(signal))) {
    return { hasBuyingIntent: true, intentType: 'asking_details', confidence: 70 };
  }
  
  if (interestSignals.some(signal => normalized.includes(signal))) {
    return { hasBuyingIntent: true, intentType: 'interested', confidence: 50 };
  }
  
  return { hasBuyingIntent: false, confidence: 0 };
}

/**
 * 🎯 Genera respuesta basada en intención de compra
 */
export function generateIntentBasedResponse(
  intent: ReturnType<typeof detectBuyingIntent>,
  productName?: string
): string | null {
  
  if (!intent.hasBuyingIntent) return null;
  
  switch (intent.intentType) {
    case 'ready':
      return `¡Perfecto! 🎉 ${productName ? `El ${productName} es tuyo.` : 'Cerremos entonces.'} Te paso los datos para el pago:`;
    
    case 'asking_details':
      return null; // Dejar que el sistema normal maneje los detalles
    
    case 'interested':
      return `Me alegra que te guste 😊 ${productName ? `Este ${productName} es excelente.` : ''} ¿Qué más te gustaría saber?`;
    
    default:
      return null;
  }
}

/**
 * 🎯 Añade variedad a respuestas repetitivas
 */
export function varyResponse(baseResponse: string, conversationCount: number): string {
  // Si es la misma respuesta muchas veces, variarla
  if (conversationCount > 3) {
    const variations = [
      `Como te comentaba, ${baseResponse.toLowerCase()}`,
      `Retomando, ${baseResponse.toLowerCase()}`,
      `Entonces, ${baseResponse.toLowerCase()}`
    ];
    return variations[conversationCount % variations.length];
  }
  
  return baseResponse;
}

/**
 * 🎯 Limpia respuestas muy técnicas o robóticas
 */
export function makeMoreCasual(response: string): string {
  return response
    // Reemplazar lenguaje muy formal
    .replace(/Estimado cliente/gi, 'Hola')
    .replace(/A continuación/gi, 'Mira')
    .replace(/Le informamos/gi, 'Te cuento')
    .replace(/Cordialmente/gi, 'Saludos')
    .replace(/Atentamente/gi, '¡Hasta pronto!')
    // Hacer más conversacional
    .replace(/\. Por favor/gi, '. Por fa')
    .replace(/¿Desea /gi, '¿Quieres ')
    .replace(/¿Requiere /gi, '¿Necesitas ')
    // Añadir contracciones naturales
    .replace(/para que/gi, 'pa que')
    .replace(/para el/gi, 'pal');
}

/**
 * 🎯 Añade empatía a respuestas
 */
export function addEmpathy(response: string, context: 'problem' | 'question' | 'objection'): string {
  const empathyPhrases = {
    problem: ['Entiendo tu preocupación.', 'Claro, te entiendo.', 'Sí, es normal que te preguntes eso.'],
    question: ['Buena pregunta.', 'Claro, con gusto te explico.', 'Perfecto que preguntes.'],
    objection: ['Te entiendo perfectamente.', 'Es válido lo que dices.', 'Claro, es importante eso.']
  };
  
  const phrase = empathyPhrases[context][Math.floor(Math.random() * empathyPhrases[context].length)];
  return `${phrase} ${response}`;
}

/**
 * 🎯 Formatea precio de manera natural
 */
export function formatPriceNaturally(price: number): string {
  const formatted = price.toLocaleString('es-CO');
  
  const variations = [
    `$${formatted}`,
    `${formatted} pesos`,
    `$${formatted} COP`,
    `${formatted} pesitos`
  ];
  
  // Usar variación más casual para precios bajos
  if (price < 100000) {
    return variations[Math.floor(Math.random() * variations.length)];
  }
  
  return `$${formatted}`;
}

/**
 * 🎯 Sistema de respuesta completo con personalidad
 */
export function generateNaturalResponse(config: {
  baseMessage: string;
  context?: {
    isFirstMessage?: boolean;
    hasProductMatch?: boolean;
    productName?: string;
    price?: number;
    customerName?: string;
    conversationCount?: number;
  };
  addClose?: boolean;
  addEmpathy?: 'problem' | 'question' | 'objection';
}): string {
  
  let response = config.baseMessage;
  
  // Hacer más casual
  response = makeMoreCasual(response);
  
  // Añadir empatía si es necesario
  if (config.addEmpathy) {
    response = addEmpathy(response, config.addEmpathy);
  }
  
  // Variar si es repetitivo
  if (config.context?.conversationCount) {
    response = varyResponse(response, config.context.conversationCount);
  }
  
  // Humanizar
  response = humanizeResponse(response, config.context);
  
  // Añadir cierre suave si es apropiado
  if (config.addClose && config.context?.productName && config.context?.price) {
    response += generateSoftClose(config.context.productName, config.context.price);
  }
  
  return response;
}

/**
 * 🎯 Formatea respuesta con emojis y bullets para WhatsApp
 */
export function formatForWhatsApp(text: string): string {
  // Si ya tiene buen formato, no tocar
  if (text.includes('•') || text.includes('✓') || text.includes('🔹')) {
    return text;
  }
  
  // Dividir en párrafos
  const paragraphs = text.split('\n\n');
  
  let formatted = '';
  
  for (const para of paragraphs) {
    // Si es una lista (tiene múltiples líneas con guiones o números)
    if (para.includes('\n-') || para.includes('\n•') || /\n\d+\./.test(para)) {
      const lines = para.split('\n');
      formatted += lines[0] + '\n\n'; // Título
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          // Reemplazar guiones por bullets con emoji
          const cleaned = line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '');
          formatted += `🔹 ${cleaned}\n`;
        }
      }
      formatted += '\n';
    } else {
      // Párrafo normal
      formatted += para + '\n\n';
    }
  }
  
  return formatted.trim();
}

/**
 * 🎯 Acorta respuestas muy largas manteniendo lo esencial
 */
export function shortenResponse(text: string, maxLength: number = 400): string {
  if (text.length <= maxLength) return text;
  
  // Dividir en oraciones
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let shortened = '';
  let currentLength = 0;
  
  for (const sentence of sentences) {
    if (currentLength + sentence.length > maxLength) {
      break;
    }
    shortened += sentence;
    currentLength += sentence.length;
  }
  
  // Si cortamos, añadir indicador
  if (shortened.length < text.length) {
    shortened += '\n\n¿Quieres que te cuente más detalles? 😊';
  }
  
  return shortened.trim();
}
