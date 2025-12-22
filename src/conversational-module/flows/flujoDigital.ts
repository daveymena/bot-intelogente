/**
 * Flujo de conversación para productos digitales
 * Maneja cursos, megapacks, software
 * 
 * ✅ USA METODOLOGÍA AIDA PARA VENTAS PROFESIONALES
 * 
 * REGLAS CRÍTICAS:
 * - NO preguntar por recogida en tienda
 * - NO preguntar por envío a domicilio
 * - NO consultar disponibilidad (siempre disponible)
 * - USA AIDA: Atención, Interés, Deseo, Acción
 */

import { type ProductoInfo } from '../ai/promptBuilder-simple';
import { type ContextoConversacion } from '../utils/obtenerContexto';
import { SocialProofService } from '../services/social-proof-service';
import { UpsellingEngine } from '../services/upselling-engine';

/**
 * Flujo PROFESIONAL para productos digitales con AIDA
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
  
  // 🧠 DETECTAR SI ES PREGUNTA ESPECÍFICA vs SOLO INTERÉS
  const esPreguntaEspecifica = /(sirve|funciona|vale la pena|recomend|nivel|principiante|avanzado|incluye|contiene|qué|cuál|cómo)/i.test(mensaje);
  
  if (esPreguntaEspecifica) {
    console.log('[FlujoDigital] 🧠 Pregunta específica detectada - Usando IA para razonamiento');
    
    try {
      const { AIMultiProvider } = await import('@/lib/ai-multi-provider');
      
      const prompt = `
PRODUCTO:
Nombre: ${producto.nombre}
Precio: $${producto.precio.toLocaleString('es-CO')}
Categoría: ${producto.categoria}
Descripción: ${producto.descripcion || 'Producto digital de alta calidad'}

PREGUNTA DEL CLIENTE:
"${mensaje}"

INSTRUCCIONES:
- Responde la pregunta usando la información del producto
- Sé específico y útil
- Usa emojis moderadamente
- Máximo 4-5 líneas
- Si el producto puede resolver su necesidad, explica CÓMO
- Termina preguntando si quiere conocer formas de pago

Responde:`;

      const messages = [
        {
          role: 'system' as const,
          content: 'Eres un asesor de ventas experto en productos digitales. Respondes preguntas con conocimiento profundo y profesionalismo.'
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      const respuesta = await AIMultiProvider.generateCompletion(messages, {
        temperature: 0.7,
        max_tokens: 250
      });

      return respuesta.content;
    } catch (error) {
      console.error('[FlujoDigital] Error en IA, usando AIDA:', error);
      return generarRespuestaAIDA(producto);
    }
  }
  
  // 🎯 INTERÉS GENERAL: Usar respuesta AIDA optimizada
  console.log('[FlujoDigital] ✅ Interés general - Usando AIDA');
  return generarRespuestaAIDA(producto);
}

/**
 * Genera respuesta usando metodología AIDA COMPACTA
 * (Atención, Interés, Deseo, Acción)
 * OPTIMIZADO para caber en UN solo mensaje de WhatsApp (~400 caracteres)
 */
function generarRespuestaAIDA(producto: ProductoInfo): string {
  // 🎯 ATENCIÓN + INTERÉS: Hook + Info clave
  let respuesta = `¡Excelente elección! 🎯 ${getProductEmoji(producto.categoria)}\n\n`;
  respuesta += `✨ *${producto.nombre}*\n`;
  respuesta += `💰 *$${producto.precio.toLocaleString('es-CO')}*\n\n`;
  
  // Descripción mejorada (máximo 300 caracteres para más información)
  if (producto.descripcion) {
    const descripcionMejorada = producto.descripcion.substring(0, 300);
    respuesta += `${descripcionMejorada}${producto.descripcion.length > 300 ? '...' : ''}\n\n`;
  }
  
  // 🔥 DESEO: Beneficios clave (compacto)
  respuesta += `🎁 Acceso inmediato y de por vida\n`;
  respuesta += `✅ Soporte incluido\n\n`;
  
  // ✅ ACCIÓN: Call-to-Action claro
  respuesta += `💬 ¿Te gustaría conocer los métodos de pago? 🔗`;
  
  return respuesta;
}

/**
 * Genera táctica de urgencia/escasez con ANCHOR PRICING
 * (Precio Normal inflado, Precio Oferta = Precio Real)
 */
function generarUrgencia(producto: ProductoInfo): string {
  // Estrategia: Mostrar precio real como "Oferta" y un precio mayor como "Normal"
  // Esto mantiene el precio original de venta
  const sobreprecio = 1.25; // 25% más
  const precioNormal = Math.round(producto.precio * sobreprecio);
  const precioOferta = producto.precio; // El precio real de la BD
  const descuento = Math.round(((precioNormal - precioOferta) / precioNormal) * 100);
  const horas = 3;

  return `⏰ *OFERTA ESPECIAL - SOLO ${horas} HORAS*
🔥 ${descuento}% de descuento
💰 Precio de lista: $${precioNormal.toLocaleString('es-CO')}
✅ Precio HOY: $${precioOferta.toLocaleString('es-CO')}

⚡ Ahorro: $${(precioNormal - precioOferta).toLocaleString('es-CO')}`;
}

/**
 * Obtiene emoji según categoría del producto
 */
function getProductEmoji(categoria: string): string {
  const categoryLower = categoria.toLowerCase();
  
  if (categoryLower.includes('curso') || categoryLower.includes('digital')) {
    return '📚';
  }
  if (categoryLower.includes('software')) {
    return '💻';
  }
  if (categoryLower.includes('megapack')) {
    return '🎁';
  }
  
  return '✨';
}

/**
 * Formatea detalles del producto de forma atractiva
 */
function formatearDetallesProducto(producto: ProductoInfo): string {
  let detalles = `━━━━━━━━━━━━━━━━━━━━\n`;
  detalles += `✨ *${producto.nombre}*\n`;
  detalles += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  if (producto.descripcion) {
    // Tomar primeras 3 líneas de descripción
    const lineas = producto.descripcion.split('\n').slice(0, 3);
    detalles += `📝 *Descripción:*\n${lineas.join('\n')}\n\n`;
  }
  
  detalles += `━━━━━━━━━━━━━━━━━━━━\n`;
  detalles += `💰 *PRECIO: $ ${producto.precio.toLocaleString('es-CO')}*\n`;
  detalles += `━━━━━━━━━━━━━━━━━━━━`;
  
  return detalles;
}

/**
 * Genera sección de DESEO con beneficios
 */
function generarSeccionDeseo(producto: ProductoInfo): string {
  const categoryLower = producto.categoria.toLowerCase();
  
  // Beneficios según tipo de producto
  if (categoryLower.includes('curso') || categoryLower.includes('digital')) {
    return `🎁 *¿Qué obtienes?*
✅ Acceso inmediato y de por vida
✅ Aprende a tu propio ritmo
✅ Certificado al finalizar
✅ Soporte incluido

🚀 *Inversión en tu futuro profesional*`;
  }
  
  if (categoryLower.includes('megapack')) {
    return `🎁 *¿Qué incluye?*
✅ Múltiples cursos en un solo paquete
✅ Acceso de por vida
✅ Actualizaciones gratuitas
✅ Ahorro del 70% vs compra individual

💎 *Máximo valor por tu inversión*`;
  }
  
  // Genérico para productos digitales
  return `🎁 *Beneficios:*
✅ Entrega digital inmediata
✅ Acceso de por vida
✅ Sin costos de envío
✅ Soporte incluido

💡 *Comienza hoy mismo*`;
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
