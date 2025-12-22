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
    return generarSaludo(contexto);
  }

  if (intencion === 'despedida') {
    return generarDespedida();
  }

  // 🧠 PASO 1: Intentar responder con Knowledge Base (sin IA)
  try {
    const { getBusinessInfo } = await import('../../knowledge/business-info');
    const respuestaDirecta = getBusinessInfo(mensaje);
    
    if (respuestaDirecta) {
      console.log('[FlujoGeneral] ✅ Respondido con Knowledge Base (sin gastar IA)');
      return `${respuestaDirecta}\n\n¿Te puedo ayudar en algo más? 😊`;
    }
  } catch (error) {
    console.log('[FlujoGeneral] Knowledge Base no disponible, usando IA');
  }

  // 🤖 PASO 2: Usar OLLAMA para razonamiento inteligente
  try {
    const { AIMultiProvider } = await import('@/lib/ai-multi-provider');
    const { BusinessKnowledge } = await import('../../knowledge/business-info');
    
    // 🧠 CARGAR CONTEXTO SAAS PARA PERSONALIZACIÓN
    const { SaasContextService } = await import('../services/saasContextService');
    const userId = contexto?.userId || process.env.DEFAULT_USER_ID;
    const tenantConfig = await SaasContextService.getTenantConfig(userId);

    // Construir contexto de negocio completo para la IA
    const businessContext = `
INFORMACIÓN DEL NEGOCIO:
- Nombre: ${tenantConfig?.businessName || BusinessKnowledge.negocio.nombre}
- Ubicación: ${BusinessKnowledge.negocio.ubicacion}
- WhatsApp: ${BusinessKnowledge.negocio.whatsapp}
- Horario: ${BusinessKnowledge.horarios.dias} de ${BusinessKnowledge.horarios.horario}

MÉTODOS DE PAGO:
${BusinessKnowledge.metodosPago.disponibles.join(', ')}

GARANTÍAS:
${BusinessKnowledge.garantias.productosElectronicos}

ENVÍOS:
${BusinessKnowledge.envios.nacional}
En Cali: ${BusinessKnowledge.envios.cali}

INSTRUCCIONES:
- Responde como un vendedor profesional y amigable
- Usa la información del negocio para responder preguntas
- Si no sabes algo, sé honesto y ofrece contactar con soporte
- Usa emojis con moderación para ser cercano pero profesional
- Respuestas cortas y directas (máximo 3-4 líneas)
`;

    const messages = [
      {
        role: 'system' as const,
        content: businessContext
      },
      {
        role: 'user' as const,
        content: mensaje
      }
    ];

    console.log('[FlujoGeneral] 🤖 Usando OLLAMA para razonamiento inteligente');
    const respuesta = await AIMultiProvider.generateCompletion(messages, {
      temperature: 0.7,
      max_tokens: 300
    });

    return respuesta.content;
  } catch (error) {
    console.error('[FlujoGeneral] Error:', error);
    return `¡Hola! 👋 Soy **Alex**, tu asesor de ventas de *Tecnovariedades D&S*.

¿En qué puedo ayudarte hoy?
- 💻 Computadores y laptops
- 🏍️ Motos
- 💎 Cursos y megapacks digitales
- 🔧 Servicio técnico

¡Pregúntame lo que necesites! 😊`;
  }
}

/**
 * Genera saludo inteligente basado en contexto
 * USA SISTEMA DINÁMICO para evitar detección de Meta
 */
async function generarSaludo(contexto?: any): Promise<string> {
  // 🧠 VERIFICAR SI YA HUBO CONVERSACIÓN
  const historial = contexto?.historialMensajes || [];
  const yaHuboConversacion = historial.length > 2; // Más de 2 mensajes = ya conversaron
  
  // Si ya conversaron, NO saludar de nuevo, ir directo al grano
  if (yaHuboConversacion) {
    console.log('[FlujoGeneral] ✅ Ya hubo conversación previa - Respuesta directa');
    
    // Variaciones de respuesta directa
    const respuestasDirectas = [
      '😊 ¿En qué puedo ayudarte?',
      '✨ ¿Qué necesitas?',
      '👋 ¿En qué te puedo colaborar?',
      '🙌 ¿Qué buscas hoy?',
      '😄 ¿Cómo te ayudo?'
    ];
    
    return respuestasDirectas[Math.floor(Math.random() * respuestasDirectas.length)];
  }
  
  // Primera vez que hablan - USAR SISTEMA DINÁMICO SAAS
  console.log('[FlujoGeneral] 👋 Primera conversación - Saludo dinámico profesional');
  
  try {
    // Cargar configuración del Tenant (SaaS)
    const { SaasContextService } = await import('../services/saasContextService');
    const { generateDynamicGreeting } = await import('../utils/dynamic-greetings');
    
    // Obtener userId del contexto o usar default
    const userId = contexto?.userId || process.env.DEFAULT_USER_ID;
    let tenantConfig = null;
    
    if (userId) {
      tenantConfig = await SaasContextService.getTenantConfig(userId);
      if (tenantConfig) {
        console.log(`[FlujoGeneral] 🏢 Tenant cargado: ${tenantConfig.businessName}`);
      }
    }

    return generateDynamicGreeting({
      isFirstMessage: true,
      previousInteraction: false,
      tenantConfig
    });
  } catch (error) {
    console.error('[FlujoGeneral] Error cargando saludos dinámicos:', error);
    return '¡Hola! 👋 ¿En qué puedo ayudarte hoy?';
  }
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
