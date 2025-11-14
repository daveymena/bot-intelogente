/**
 * Flujo de conversación general
 * Maneja saludos, consultas generales, despedidas
 */

import { sendWithFallback, type GroqMessage } from '../ai/groqClient';
import { construirPromptSistema, construirPromptGeneral } from '../ai/promptBuilder';
import { obtenerHistorialParaIA, type ContextoConversacion } from '../utils/obtenerContexto';
import { type Intencion } from '../utils/detectarIntencion';

export async function procesarFlujoGeneral(
  mensaje: string,
  intencion: Intencion,
  contexto: ContextoConversacion
): Promise<string> {
  // Respuestas rápidas para intenciones comunes
  if (intencion === 'saludo') {
    return generarSaludo();
  }

  if (intencion === 'despedida') {
    return generarDespedida();
  }

  // Para otras consultas generales, usar IA
  try {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: construirPromptSistema() + '\n\n' + construirPromptGeneral(),
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
      temperature: 0.8,
      maxTokens: 400,
    });

    return respuesta.content;
  } catch (error) {
    console.error('[FlujoGeneral] Error:', error);
    return `¡Hola! 👋 Soy tu asistente de ventas de Tecnovariedades D&S.

¿En qué puedo ayudarte hoy?
- 💻 Computadores y laptops
- 🏍️ Motos
- 💎 Cursos y megapacks digitales
- 🔧 Servicio técnico

¡Pregúntame lo que necesites! 😊`;
  }
}

function generarSaludo(): string {
  const saludos = [
    `¡Hola! 👋 Bienvenido a *Tecnovariedades D&S*

¿Qué te gustaría ver hoy?
💻 Computadores
🏍️ Motos
💎 Productos digitales
🔧 Servicios

¡Estoy aquí para ayudarte! 😊`,
    
    `¡Hola! 😊 ¿Cómo estás?

Soy tu asistente de ventas. Puedo ayudarte con:
- Información de productos
- Precios y disponibilidad
- Métodos de pago
- Envíos

¿Qué necesitas? 💬`,
    
    `¡Bienvenido! 🎉

Estoy aquí para ayudarte a encontrar lo que buscas.

¿Te interesa algún producto en particular? 🔍`,
  ];

  return saludos[Math.floor(Math.random() * saludos.length)];
}

function generarDespedida(): string {
  const despedidas = [
    `¡Gracias por escribir! 😊

Si necesitas algo más, aquí estaré.
¡Que tengas un excelente día! 🌟`,
    
    `¡Hasta pronto! 👋

Recuerda que estoy disponible cuando me necesites.
¡Feliz día! ☀️`,
    
    `¡Nos vemos! 😊

Cualquier duda, no dudes en escribir.
¡Cuídate! 💙`,
  ];

  return despedidas[Math.floor(Math.random() * despedidas.length)];
}
