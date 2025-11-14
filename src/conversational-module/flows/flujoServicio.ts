/**
 * Flujo de conversación para servicios
 * Maneja servicios técnicos, reparaciones, asesorías
 */

import { sendWithFallback, type GroqMessage } from '../ai/groqClient';
import { construirPromptSistema, construirPromptServicio, type ProductoInfo } from '../ai/promptBuilder';
import { obtenerHistorialParaIA, type ContextoConversacion } from '../utils/obtenerContexto';

export async function procesarFlujoServicio(
  mensaje: string,
  producto: ProductoInfo,
  contexto: ContextoConversacion
): Promise<string> {
  try {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: construirPromptSistema() + '\n\n' + construirPromptServicio(producto),
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

    return respuesta.content;
  } catch (error) {
    console.error('[FlujoServicio] Error:', error);
    return `¡Claro! Ofrecemos *${producto.nombre}* 🔧

💰 Desde: $${producto.precio.toLocaleString('es-CO')} COP

Para darte un precio exacto, cuéntame:
- ¿Qué problema presenta?
- ¿Marca y modelo?

Así puedo ayudarte mejor 😊`;
  }
}
