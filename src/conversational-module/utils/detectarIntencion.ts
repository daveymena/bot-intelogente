/**
 * Detector de intención del usuario
 * Clasifica el mensaje en categorías para dirigir al flujo correcto
 */

import type { ContextoConversacion } from './obtenerContexto';
import { AIMultiProvider } from '@/lib/ai-multi-provider';

export type Intencion =
  | 'saludo'
  | 'busqueda_producto'
  | 'consulta_precio'
  | 'consulta_disponibilidad'
  | 'solicitud_pago'
  | 'solicitud_envio'
  | 'servicio_tecnico'
  | 'queja_reclamo'
  | 'despedida'
  | 'objecion_precio'        // NUEVO: "Es muy caro"
  | 'objecion_tiempo'        // NUEVO: "Lo voy a pensar"
  | 'objecion_confianza'     // NUEVO: "No estoy seguro"
  | 'solicitud_descuento'    // NUEVO: "Hay descuento?"
  | 'general';

export interface ResultadoIntencion {
  intencion: Intencion;
  confianza: number;
  entidades?: {
    producto?: string;
    precio?: number;
    ubicacion?: string;
  };
}

interface DetectarIntencionOpciones {
  contexto?: ContextoConversacion;
  forzarIA?: boolean;
}

const INTENT_DESCRIPTIONS: Record<Intencion, string> = {
  saludo: 'Mensajes de bienvenida o cortesía inicial',
  despedida: 'Mensajes para terminar la conversación o agradecer',
  busqueda_producto: 'Consultas para encontrar o comparar productos específicos',
  consulta_precio: 'Preguntas directas sobre el precio o el costo',
  consulta_disponibilidad: 'Preguntas sobre stock o existencia del producto',
  solicitud_pago: 'Mensajes pidiendo links, métodos o procesos de pago',
  solicitud_envio: 'Preguntas sobre envíos, ciudades o entregas',
  servicio_tecnico: 'Problemas técnicos, reparaciones o soporte',
  queja_reclamo: 'Inconformidades, devoluciones o solicitudes de escalamiento',
  objecion_precio: 'Objeciones sobre el precio o costo del producto',
  objecion_tiempo: 'Cliente necesita tiempo para pensar o decidir',
  objecion_confianza: 'Dudas sobre la confiabilidad o garantía',
  solicitud_descuento: 'Solicitudes de descuentos, ofertas o promociones',
  general: 'Cualquier otro mensaje no cubierto por los anteriores',
};

type IntentCacheEntry = { resultado: ResultadoIntencion; expiresAt: number };
const semanticCache = new Map<string, IntentCacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutos

/**
 * Detecta la intención aplicando heurística + comprensión semántica
 */
export async function detectarIntencion(
  mensaje: string,
  opciones: DetectarIntencionOpciones = {}
): Promise<ResultadoIntencion> {
  const heuristica = detectarIntencionHeuristica(mensaje, opciones.contexto);

  if (!opciones.forzarIA && heuristica.confianza >= 0.85 && heuristica.intencion !== 'general') {
    return heuristica;
  }

  const cacheKey = `${opciones.contexto?.userId || 'anon'}:${mensaje}`;
  const cached = semanticCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.resultado;
  }

  const semantica = await detectarIntencionSemantica(mensaje, opciones.contexto).catch(error => {
    console.error('[Intencion] ⚠️ Error en clasificación semántica:', error.message);
    return null;
  });

  if (semantica) {
    semanticCache.set(cacheKey, {
      resultado: semantica,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return semantica;
  }

  return heuristica;
}

/**
 * Detecta intención usando solo reglas heurísticas (fallback)
 */
function detectarIntencionHeuristica(mensaje: string, contexto?: ContextoConversacion): ResultadoIntencion {
  const textoLower = mensaje.toLowerCase().trim();

  // 🔥 DETECCIÓN DE REFERENCIAS AL PRODUCTO EN CONTEXTO
  // Si hay un producto en contexto y el mensaje hace referencia a él, es búsqueda de producto
  if (contexto?.ultimoProductoId) {
    const referencias = [
      // Referencias directas
      /\b(ese|este|esta|esa|el|la|lo)\s+(producto|curso|laptop|computador|moto|megapack|servicio)/i,
      // Preguntas sobre el producto
      /\b(qué|que|cuál|cual|cómo|como)\s+(incluye|trae|tiene|viene|contiene|ofrece)/i,
      // Solicitudes de información
      /\b(más|mas)\s+(información|info|detalles|datos)/i,
      /\b(tienes?|hay|envías?|envias?|muestras?)\s+(fotos?|imágenes?|imagenes?|pics?)/i,
      // Referencias implícitas
      /\b(incluye|trae|tiene|viene con|características|especificaciones|detalles)/i,
      /\b(fotos?|imágenes?|imagenes?|ver|mostrar)/i,
      // Pronombres que refieren al producto
      /^(lo|la|le)\s+/i,
    ];
    
    const tieneReferencia = referencias.some(regex => regex.test(textoLower));
    
    if (tieneReferencia) {
      console.log('[Intención] 🎯 Detectada referencia al producto en contexto');
      return { 
        intencion: 'busqueda_producto', 
        confianza: 0.9,
        entidades: { producto: contexto.ultimoProductoNombre }
      };
    }
  }

  // 1. Priorizar intenciones específicas (precio, pago, envío) sobre saludo
  // Si el mensaje tiene contenido específico, NO es solo un saludo
  
  // Detectar palabras clave de intención fuerte
  const tieneIntencionFuerte = /(precio|costo|valor|cuánto|venden|tienen|disponible|envío|pago|comprar|quiero|necesito|busco|interesa|información|detalles|portátil|laptop|computador|moto|curso|megapack)/i.test(textoLower);
  
  // Si empieza con saludo pero tiene intención fuerte, NO devolver saludo aquí
  // Dejar que pase a las siguientes reglas
  
  if (/^(hola|buenos días|buenas tardes|buenas noches|hey|hi|saludos)/i.test(textoLower)) {
    // Solo es saludo si NO tiene intención fuerte y es corto
    if (!tieneIntencionFuerte && textoLower.length < 30) {
      return { intencion: 'saludo', confianza: 0.95 };
    }
  }
  
  // Si solo dice "hola" sin más, es saludo
  if (/^(hola|hey|hi)$/i.test(textoLower)) {
    return { intencion: 'saludo', confianza: 0.95 };
  }

  // CORTESÍA Y CONFIRMACIÓN (Evitar que pasen a pago o IA)
  if (/^(ok|vale|bien|entendido|perfecto|listo|dale|bueno)$/i.test(textoLower) || 
      /^(ok gracias|vale gracias|perfecto gracias|muchas gracias|mil gracias)$/i.test(textoLower)) {
    return { intencion: 'general', confianza: 0.95 }; // General para que responda algo amable
  }

  if (/^(adiós|chao|hasta luego|gracias|bye|nos vemos|feliz dia|feliz tarde|feliz noche)/i.test(textoLower)) {
    return { intencion: 'despedida', confianza: 0.9 };
  }

  // DETECCIÓN AGRESIVA DE SOLICITUD DE PAGO
  if (/(cómo pago|como pago|métodos de pago|metodos de pago|método de pago|metodo de pago|pagar|comprar|adquirir|link de pago|lik de pago|enlace de pago|paypal|mercadopago|mercado pago|nequi|daviplata|quiero pagar|voy a pagar|listo para pagar|proceder con el pago|realizar el pago|hacer el pago|efectuar el pago|me lo llevo|lo compro|lo quiero|dame el link|envía el link|envia el link|pasa el link|manda el link|información de pago|info de pago|datos de pago|detalles de pago|cómo es el pago|como es el pago|proceso de pago|formas de pago|opciones de pago)/i.test(textoLower)) {
    return { intencion: 'solicitud_pago', confianza: 0.95 };
  }
  
  // Detectar "pago" o "comprar" como palabra única (muy común)
  if (/^(pago|pagar|comprar|compro|adquirir)$/i.test(textoLower)) {
    return { intencion: 'solicitud_pago', confianza: 0.9 };
  }

  if (/(cuánto cuesta|precio|valor|cuánto vale|cuánto es|cuánto sale)/i.test(textoLower)) {
    return { intencion: 'consulta_precio', confianza: 0.8 };
  }

  if (/(tienen|hay|disponible|stock|existencia|queda)/i.test(textoLower)) {
    return { intencion: 'consulta_disponibilidad', confianza: 0.8 };
  }

  if (/(envío|enviar|domicilio|entrega|dirección|despacho|contrareembolso)/i.test(textoLower)) {
    return { intencion: 'solicitud_envio', confianza: 0.8 };
  }

  if (/(reparar|arreglar|no funciona|dañado|problema|falla|técnico|soporte)/i.test(textoLower)) {
    return { intencion: 'servicio_tecnico', confianza: 0.8 };
  }

  if (/(queja|reclamo|mal servicio|insatisfecho|devolver|reembolso)/i.test(textoLower)) {
    return { intencion: 'queja_reclamo', confianza: 0.8 };
  }

  // NUEVAS OBJECIONES
  if (/(caro|costoso|muy alto|no tengo|no puedo pagar|mucho dinero)/i.test(textoLower)) {
    return { intencion: 'objecion_precio', confianza: 0.9 };
  }

  if (/(lo voy a pensar|déjame pensar|después|más tarde|no estoy seguro|luego te confirmo|te aviso|te digo luego|mañana te digo|ahorita no|luego lo veo|pendiente|te confirmo|te escribo luego)/i.test(textoLower)) {
    return { intencion: 'objecion_tiempo', confianza: 0.9 };
  }

  if (/(no confío|desconfío|es real|funciona|garantía)/i.test(textoLower)) {
    return { intencion: 'objecion_confianza', confianza: 0.8 };
  }

  if (/(descuento|rebaja|oferta|promoción|más barato)/i.test(textoLower)) {
    return { intencion: 'solicitud_descuento', confianza: 0.85 };
  }

  // DETECCIÓN AGRESIVA DE BÚSQUEDA DE PRODUCTOS
  if (/(computador|portátil|portatil|laptop|notebook|moto|motocicleta|curso|megapack|audífonos|audifonos|mouse|teclado|monitor|impresora|celular|telefono|teléfono|tablet)/i.test(textoLower)) {
    return { intencion: 'busqueda_producto', confianza: 0.9 };
  }
  
  // Detectar preguntas sobre disponibilidad de productos
  if (/(tienen|tienes|hay|venden|vendes|manejan|manejas)\s+(computador|portátil|portatil|laptop|moto|curso|megapack)/i.test(textoLower)) {
    return { intencion: 'busqueda_producto', confianza: 0.95 };
  }

  // 🔥 DETECCIÓN DE SEGUIMIENTO CONTEXTUAL
  // "necesito uno para...", "lo quiero para...", "me sirve para..."
  if (/(necesito|quiero|busco|me sirve|requiero|estoy buscando)\s+(uno|una|alguno|alguna)?\s*(para|que)/i.test(textoLower)) {
    return { intencion: 'busqueda_producto', confianza: 0.85 };
  }
  
  // "para estudio", "para trabajar", "para gaming", etc.
  if (/(para\s+(estudio|estudiar|trabajar|trabajo|gaming|juegos|diseño|edición|programar|oficina|casa|universidad))/i.test(textoLower)) {
    return { intencion: 'busqueda_producto', confianza: 0.8 };
  }

  return { intencion: 'general', confianza: 0.4 };
}

async function detectarIntencionSemantica(
  mensaje: string,
  contexto?: ContextoConversacion
): Promise<ResultadoIntencion | null> {
  const historialResumen = contexto?.historialMensajes
    ?.slice(-4)
    .map(msg => `${msg.rol === 'user' ? 'Cliente' : 'Bot'}: ${msg.contenido}`)
    .join('\n');

  const messages = [
    {
      role: 'system' as const,
      content: `Eres un detector de intenciones para un bot de ventas.
Debes clasificar el mensaje del cliente en UNA sola de las siguientes intenciones:
${Object.entries(INTENT_DESCRIPTIONS)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

Reglas:
- Responde SOLO con JSON.
- Campo "intencion" debe ser uno de: ${Object.keys(INTENT_DESCRIPTIONS).join(', ')}
- Campo "confianza" entre 0 y 1.
- Incluir entidades detectadas relevantes (producto, precio, ubicacion) si aparecen explícitamente.`,
    },
    {
      role: 'user' as const,
      content: `Mensaje recibido:
"${mensaje}"

Contexto reciente:
${historialResumen || 'sin historial'}

Devuelve JSON con forma:
{
  "intencion": "valor",
  "confianza": 0.0-1.0,
  "entidades": {
    "producto": "...",
    "precio": 0,
    "ubicacion": "..."
  }
}`,
    },
  ];

  const respuesta = await AIMultiProvider.generateCompletion(messages, {
    temperature: 0.1,
    max_tokens: 200,
  });

  const parsed = parseIntentResponse(respuesta.content);
  return parsed;
}

function parseIntentResponse(texto: string): ResultadoIntencion | null {
  try {
    const jsonMatch = texto.match(/\{[\s\S]*\}/);
    const raw = jsonMatch ? jsonMatch[0] : texto;
    const data = JSON.parse(raw);

    if (!data.intencion || !(data.intencion in INTENT_DESCRIPTIONS)) {
      return null;
    }

    return {
      intencion: data.intencion as Intencion,
      confianza: normalizarConfianza(Number(data.confianza ?? 0.75)),
      entidades: data.entidades || {},
    };
  } catch (error) {
    console.warn('[Intencion] No se pudo parsear la respuesta:', texto);
    return null;
  }
}

function normalizarConfianza(valor: number): number {
  if (Number.isNaN(valor)) {
    return 0.6;
  }
  return Math.min(1, Math.max(0, valor));
}

/**
 * Extrae entidades del mensaje (productos, precios, ubicaciones)
 */
export function extraerEntidades(mensaje: string): {
  producto?: string;
  precio?: number;
  ubicacion?: string;
} {
  const entidades: any = {};

  // Extraer mención de producto
  const productoMatch = mensaje.match(/(computador|portátil|laptop|moto|curso|megapack|audífonos|mouse|teclado|ns160|akt|yamaha)/i);
  if (productoMatch) {
    entidades.producto = productoMatch[0];
  }

  // Extraer precio mencionado
  const precioMatch = mensaje.match(/\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/);
  if (precioMatch) {
    entidades.precio = parseFloat(precioMatch[1].replace(/[.,]/g, ''));
  }

  // Extraer ubicación
  const ubicacionMatch = mensaje.match(/(bogotá|medellín|cali|barranquilla|cartagena|bucaramanga|pereira|manizales|ibagué|santa marta)/i);
  if (ubicacionMatch) {
    entidades.ubicacion = ubicacionMatch[0];
  }

  return entidades;
}
