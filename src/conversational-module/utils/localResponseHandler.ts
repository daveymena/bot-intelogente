/**
 * Manejador de respuestas locales (sin IA)
 * Ahorra tokens respondiendo casos simples sin llamar a la API
 */

import { type ProductoInfo } from '../ai/promptBuilder';

export interface LocalResponse {
  canHandle: boolean;
  response?: string;
  requiresAI?: boolean;
}

/**
 * Intenta generar una respuesta local sin usar IA
 */
export async function tryLocalResponse(
  mensaje: string,
  intencion: string,
  producto?: ProductoInfo
): Promise<LocalResponse> {
  const textoLower = mensaje.toLowerCase().trim();

  // 1. SALUDOS SIMPLES (sin IA) - AHORA CON VARIACIONES PROFESIONALES
  if (intencion === 'saludo') {
    return {
      canHandle: true,
      response: await generarSaludoLocal(),
    };
  }

  // 2. DESPEDIDAS (sin IA)
  if (intencion === 'despedida') {
    return {
      canHandle: true,
      response: generarDespedidaLocal(),
    };
  }

  // 3. CONSULTA DE PRECIO SIMPLE (sin IA)
  if (intencion === 'consulta_precio' && producto) {
    if (esPreguntaPrecioSimple(textoLower)) {
      return {
        canHandle: true,
        response: generarRespuestaPrecioLocal(producto),
      };
    }
  }

  // 4. CONSULTA DE DISPONIBILIDAD SIMPLE (sin IA)
  if (intencion === 'consulta_disponibilidad' && producto) {
    if (esPreguntaDisponibilidadSimple(textoLower)) {
      return {
        canHandle: true,
        response: generarRespuestaDisponibilidadLocal(producto),
      };
    }
  }

  // 5. CONFIRMACIONES SIMPLES (sin IA)
  if (esConfirmacionSimple(textoLower)) {
    return {
      canHandle: true,
      response: '¡Perfecto! 😊 ¿En qué más puedo ayudarte?',
    };
  }

  // 6. AGRADECIMIENTOS (sin IA)
  if (esAgradecimiento(textoLower)) {
    return {
      canHandle: true,
      response: '¡Con gusto! 😊 Estoy aquí para ayudarte. ¿Necesitas algo más?',
    };
  }

  // 7. MENSAJES MUY CORTOS (sin IA)
  if (textoLower.length < 3) {
    return {
      canHandle: true,
      response: '¿En qué puedo ayudarte? 😊',
    };
  }

  // Si no puede manejar localmente, requiere IA
  return {
    canHandle: false,
    requiresAI: true,
  };
}

/**
 * Genera saludo local aleatorio usando sistema dinámico profesional
 * ANTI-BAN: Usa variaciones profesionales para evitar detección de WhatsApp
 */
async function generarSaludoLocal(): Promise<string> {
  try {
    // Importar sistema de saludos dinámicos profesionales
    const { generateDynamicGreeting } = await import('./dynamic-greetings');
    const { SaasContextService } = await import('../services/saasContextService');
    
    // Obtener configuración del tenant
    const userId = process.env.DEFAULT_USER_ID || 'default-user-id';
    const tenantConfig = await SaasContextService.getTenantConfig(userId);
    
    // Generar saludo profesional aleatorio
    return generateDynamicGreeting({
      isFirstMessage: true,
      previousInteraction: false,
      tenantConfig
    });
  } catch (error) {
    console.error('[LocalResponse] Error generando saludo dinámico:', error);
    // Fallback simple
    return '¡Hola! 👋 ¿En qué puedo ayudarte hoy?';
  }
}

/**
 * Genera despedida local aleatoria
 */
function generarDespedidaLocal(): string {
  const despedidas = [
    '¡Gracias por escribir! 😊\n\nSi necesitas algo más, aquí estaré.\n¡Que tengas un excelente día! 🌟',
    '¡Hasta pronto! 👋\n\nRecuerda que estoy disponible cuando me necesites.\n¡Feliz día! ☀️',
    '¡Nos vemos! 😊\n\nCualquier duda, no dudes en escribir.\n¡Cuídate! 💙',
  ];

  return despedidas[Math.floor(Math.random() * despedidas.length)];
}

/**
 * Genera respuesta de precio local
 */
function generarRespuestaPrecioLocal(producto: ProductoInfo): string {
  const precio = `$${producto.precio.toLocaleString('es-CO')} COP`;
  
  if (producto.categoria === 'digital' || producto.tipoVenta?.includes('digital')) {
    return `*${producto.nombre}*\n💰 ${precio}\n✅ Acceso inmediato\n\n¿Te genero el link de pago? 🔗`;
  }

  if (producto.tipoVenta?.includes('dropshipping')) {
    return `*${producto.nombre}*\n💰 ${precio}\n🚚 Envío incluido\n\n¿A qué ciudad lo necesitas? 📍`;
  }

  const disponibilidad = producto.stock && producto.stock > 0 
    ? '✅ Disponible' 
    : '⚠️ Consultar disponibilidad';

  return `*${producto.nombre}*\n💰 ${precio}\n${disponibilidad}\n\n¿Te gustaría más información? 😊`;
}

/**
 * Genera respuesta de disponibilidad local
 */
function generarRespuestaDisponibilidadLocal(producto: ProductoInfo): string {
  const disponible = producto.stock && producto.stock > 0;
  const precio = `$${producto.precio.toLocaleString('es-CO')} COP`;

  if (disponible) {
    return `¡Sí! *${producto.nombre}* está disponible 😊\n\n💰 ${precio}\n📦 ${producto.stock} unidades\n\n¿Te interesa?`;
  }

  return `*${producto.nombre}*\n⚠️ Déjame verificar disponibilidad\n💰 ${precio}\n\n¿Te gustaría que te avise cuando llegue? 📲`;
}

/**
 * Detecta si es una pregunta de precio simple
 */
function esPreguntaPrecioSimple(texto: string): boolean {
  const patronesSimples = [
    /^cuánto cuesta$/,
    /^cuánto vale$/,
    /^cuánto es$/,
    /^precio$/,
    /^valor$/,
    /^cuánto$/,
    /^precio\??$/,
  ];

  return patronesSimples.some(patron => patron.test(texto));
}

/**
 * Detecta si es una pregunta de disponibilidad simple
 */
function esPreguntaDisponibilidadSimple(texto: string): boolean {
  const patronesSimples = [
    /^tienen$/,
    /^hay$/,
    /^disponible$/,
    /^stock$/,
    /^tienen\??$/,
    /^hay\??$/,
    /^está disponible$/,
  ];

  return patronesSimples.some(patron => patron.test(texto));
}

/**
 * Detecta confirmaciones simples
 */
function esConfirmacionSimple(texto: string): boolean {
  return /^(sí|si|ok|vale|dale|perfecto|bien|bueno|claro)$/i.test(texto);
}

/**
 * Detecta agradecimientos
 */
function esAgradecimiento(texto: string): boolean {
  return /^(gracias|muchas gracias|thanks|thx|grax)$/i.test(texto);
}

/**
 * Estadísticas de ahorro
 */
export class LocalResponseStats {
  private static localResponses = 0;
  private static aiResponses = 0;

  static incrementLocal() {
    this.localResponses++;
  }

  static incrementAI() {
    this.aiResponses++;
  }

  static getStats() {
    const total = this.localResponses + this.aiResponses;
    const localPercentage = total > 0 ? (this.localResponses / total * 100).toFixed(1) : '0';
    
    return {
      local: this.localResponses,
      ai: this.aiResponses,
      total,
      localPercentage: `${localPercentage}%`,
      estimatedTokensSaved: this.localResponses * 500, // Estimado: 500 tokens por respuesta
    };
  }

  static reset() {
    this.localResponses = 0;
    this.aiResponses = 0;
  }
}
