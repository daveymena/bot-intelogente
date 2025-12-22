/**
 * Flujo de conversación para productos físicos
 * Maneja laptops, motos, accesorios físicos
 * 
 * REGLAS CRÍTICAS:
 * - Si está en BD = DISPONIBLE
 * - Preguntar por recogida o envío
 * - Consultar stock en base de datos
 */

import { sendWithFallback, type GroqMessage } from '../ai/groqClient';
import { construirPromptSistema, construirPromptFisico, type ProductoInfo } from '../ai/promptBuilder';
import { obtenerHistorialParaIA, type ContextoConversacion } from '../utils/obtenerContexto';

export async function procesarFlujoFisico(
  mensaje: string,
  producto: ProductoInfo,
  contexto: ContextoConversacion
): Promise<string> {
  try {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: construirPromptSistema() + '\n\n' + construirPromptFisico(producto),
      },
    ];

    // Agregar historial reciente
    const historial = obtenerHistorialParaIA(contexto, 4);
    messages.push(...historial);

    // Agregar mensaje actual
    messages.push({
      role: 'user',
      content: mensaje,
    });

    const respuesta = await sendWithFallback(messages, {
      temperature: 0.7,
      maxTokens: 500,
    });

    // Validar que la respuesta no invente información
    let contenido = respuesta.content;
    
    // Verificar que el precio mencionado coincida
    const precioReal = producto.precio;
    const precioMencionado = contenido.match(/\$\s*(\d{1,3}(?:[.,]\d{3})*)/);
    if (precioMencionado) {
      const precioEnRespuesta = parseInt(precioMencionado[1].replace(/[.,]/g, ''));
      if (Math.abs(precioEnRespuesta - precioReal) > 1000) {
        // Si el precio difiere mucho, reemplazarlo
        contenido = contenido.replace(
          /\$\s*\d{1,3}(?:[.,]\d{3})*/g,
          `${precioReal.toLocaleString('es-CO')}`
        );
      }
    }

    return contenido;
  } catch (error) {
    console.error('[FlujoFisico] Error:', error);
    return generarRespuestaFisicaSegura(producto);
  }
}

/**
 * Genera respuesta segura para productos físicos
 */
function generarRespuestaFisicaSegura(producto: ProductoInfo): string {
  // Si está en BD = disponible
  const disponibilidad = producto.stock && producto.stock > 0
    ? `✅ Disponible (${producto.stock} unidades)`
    : '✅ Disponible';

  return `¡Claro! Te cuento sobre *${producto.nombre}* 📦

${producto.descripcion ? producto.descripcion.substring(0, 200) + '...\n\n' : ''}💰 *Precio:* ${producto.precio.toLocaleString('es-CO')} COP
${disponibilidad}

🚚 *Opciones de entrega:*
• 🏪 Recogida en tienda
• 📮 Envío a domicilio (costo adicional según ciudad)

💳 *Métodos de pago:*
• MercadoPago (link de pago)
• PayPal (link de pago)
• Nequi / Daviplata
• Transferencia bancaria
• Efectivo (en tienda)

¿Prefieres recogerlo en tienda o envío a domicilio? 😊`;
}
