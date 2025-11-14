/**
 * Flujo de conversación para productos digitales
 * Maneja cursos, megapacks, software
 * 
 * REGLAS CRÍTICAS:
 * - NO preguntar por recogida en tienda
 * - NO preguntar por envío a domicilio
 * - NO consultar disponibilidad (siempre disponible)
 */

import { 
  respuestaDirectaProductoDigital, 
  respuestaDetalladaProductoDigital,
  type ProductoInfo 
} from '../ai/promptBuilder-simple';
import { type ContextoConversacion } from '../utils/obtenerContexto';

/**
 * Flujo ULTRA SIMPLE para productos digitales
 * SIN IA - Solo respuestas directas con información REAL
 */
export async function procesarFlujoDigital(
  mensaje: string,
  producto: ProductoInfo,
  contexto: ContextoConversacion
): Promise<string> {
  console.log('[FlujoDigital] 🎯 PRODUCTO EN FLUJO:');
  console.log('[FlujoDigital]    ID:', producto.id);
  console.log('[FlujoDigital]    Nombre:', producto.nombre);
  console.log('[FlujoDigital]    Precio:', producto.precio);
  console.log('[FlujoDigital]    Descripción:', producto.descripcion?.substring(0, 50) + '...');
  
  // Detectar si pide más información
  const mensajeLower = mensaje.toLowerCase();
  const pideInformacion = 
    mensajeLower.includes('más información') ||
    mensajeLower.includes('mas información') ||
    mensajeLower.includes('más info') ||
    mensajeLower.includes('mas info') ||
    mensajeLower.includes('detalles') ||
    mensajeLower.includes('cuéntame más') ||
    mensajeLower.includes('cuentame mas') ||
    mensajeLower.includes('qué incluye') ||
    mensajeLower.includes('que incluye');
  
  let respuesta: string;
  
  if (pideInformacion) {
    console.log('[FlujoDigital] 📋 Cliente pide MÁS INFORMACIÓN - Respuesta detallada');
    respuesta = respuestaDetalladaProductoDigital(producto);
  } else {
    console.log('[FlujoDigital] ✅ Respuesta DIRECTA básica');
    respuesta = respuestaDirectaProductoDigital(producto);
  }
  
  console.log('[FlujoDigital] 📤 RESPUESTA GENERADA (primeras 100 chars):');
  console.log(respuesta.substring(0, 100) + '...');
  
  return respuesta;
}

/**
 * Genera respuesta segura para productos digitales sin mencionar entrega física
 */
function generarRespuestaDigitalSegura(producto: ProductoInfo): string {
  return `✅ *${producto.nombre}*

💰 Precio: ${producto.precio.toLocaleString('es-CO')} COP
📲 Entrega digital inmediata

¿Quieres comprarlo? Te genero el link de pago 🔗`;
}
