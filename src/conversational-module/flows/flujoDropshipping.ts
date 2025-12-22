/**
 * Flujo de conversación para dropshipping
 * Maneja productos con envío incluido y contrareembolso
 */

import { sendWithFallback, type GroqMessage } from '../ai/groqClient';
import { construirPromptSistema, construirPromptDropshipping, type ProductoInfo } from '../ai/promptBuilder';
import { obtenerHistorialParaIA, type ContextoConversacion } from '../utils/obtenerContexto';

export async function procesarFlujoDropshipping(
  mensaje: string,
  producto: ProductoInfo,
  contexto: ContextoConversacion
): Promise<string> {
  try {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: construirPromptSistema() + '\n\n' + construirPromptDropshipping(producto),
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

    let contenido = respuesta.content;
    
    // Validar precio
    const precioReal = producto.precio;
    contenido = contenido.replace(
      /\$\s*\d{1,3}(?:[.,]\d{3})*/g,
      `$${precioReal.toLocaleString('es-CO')}`
    );

    return contenido;
  } catch (error) {
    console.error('[FlujoDropshipping] Error:', error);
    return `¡Excelente elección! *${producto.nombre}* 🎁

💰 Precio promocional: $${producto.precio.toLocaleString('es-CO')} COP
🚚 Envío incluido a toda Colombia
📦 Entrega en 3-5 días hábiles

¿A qué ciudad lo necesitas? Te confirmo disponibilidad 📍`;
  }
}
