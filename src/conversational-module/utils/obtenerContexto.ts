/**
 * Gestión de contexto de conversación
 * Mantiene el estado de cada usuario usando el sistema híbrido
 */

import { ConversationContextHybrid } from '@/lib/conversation-context-hybrid';

export interface ContextoConversacion {
  userId: string;
  estado?: string;
  ultimoProductoId?: string | number; // ✅ Puede ser string o number
  ultimoProductoNombre?: string;
  ultimaCategoria?: string;
  historialMensajes: Array<{
    rol: 'user' | 'assistant';
    contenido: string;
    timestamp: Date;
  }>;
  metadata?: Record<string, any>;
}

const contextosEnMemoria = new Map<string, ContextoConversacion>();

/**
 * Obtiene el contexto de conversación de un usuario usando el sistema híbrido
 */
export async function obtenerContexto(customerPhone: string, botUserId?: string): Promise<ContextoConversacion> {
  // Primero intentar desde memoria local
  if (contextosEnMemoria.has(customerPhone)) {
    return contextosEnMemoria.get(customerPhone)!;
  }

  // Usar el sistema híbrido para obtener contexto persistente
  try {
    const effectiveBotUserId = botUserId || process.env.DEFAULT_USER_ID || 'default-user-id';
    const hybridContext = await ConversationContextHybrid.getProductContext(effectiveBotUserId, customerPhone);

    if (hybridContext) {
      const contexto: ContextoConversacion = {
        userId: customerPhone,
        ultimoProductoId: hybridContext.lastProductId,
        ultimoProductoNombre: hybridContext.lastProductName,
        ultimaCategoria: hybridContext.productDetails?.category,
        historialMensajes: hybridContext.conversationHistory?.map(msg => ({
          rol: msg.role,
          contenido: msg.message,
          timestamp: msg.timestamp,
        })) || [],
        metadata: {
          lastIntent: hybridContext.lastIntent,
          lastAction: hybridContext.lastAction,
          userPreferences: hybridContext.userPreferences,
        }
      };

      contextosEnMemoria.set(customerPhone, contexto);
      return contexto;
    }
  } catch (error) {
    console.error('[Contexto] Error al obtener del sistema híbrido:', error);
  }

  // Crear nuevo contexto si no hay ninguno
  const nuevoContexto: ContextoConversacion = {
    userId: customerPhone,
    historialMensajes: [],
  };

  contextosEnMemoria.set(customerPhone, nuevoContexto);
  return nuevoContexto;
}

/**
 * Actualiza el contexto de conversación usando el sistema híbrido
 */
export async function actualizarContexto(
  customerPhone: string,
  actualizacion: Partial<ContextoConversacion>,
  botUserId?: string
): Promise<void> {
  const contextoActual = await obtenerContexto(customerPhone, botUserId);
  const contextoNuevo = { ...contextoActual, ...actualizacion };

  contextosEnMemoria.set(customerPhone, contextoNuevo);

  // Usar el sistema híbrido para persistencia
  try {
    const effectiveBotUserId = botUserId || process.env.DEFAULT_USER_ID || 'default-user-id';

    // Si hay actualización de producto, usar el sistema híbrido
    if (actualizacion.ultimoProductoId && actualizacion.ultimoProductoNombre) {
      await ConversationContextHybrid.saveProductContext(
        effectiveBotUserId,
        customerPhone,
        actualizacion.ultimoProductoId.toString(),
        actualizacion.ultimoProductoNombre,
        {
          price: 0, // Precio por defecto, será actualizado cuando se conozca
          category: actualizacion.ultimaCategoria || 'PHYSICAL',
          type: actualizacion.ultimaCategoria === 'DIGITAL' ? 'digital' : 'physical'
        }
      );
    }

    // Actualizar otros datos del contexto
    if (actualizacion.metadata) {
      await ConversationContextHybrid.addMessage(
        effectiveBotUserId,
        customerPhone,
        'bot', // Este es un mensaje del sistema
        JSON.stringify(actualizacion.metadata),
        'context_update'
      );
    }
  } catch (error) {
    console.error('[Contexto] Error al guardar en sistema híbrido:', error);
  }
}

/**
 * Agrega un mensaje al historial usando el sistema híbrido
 */
export async function agregarMensajeAlHistorial(
  customerPhone: string,
  rol: 'user' | 'assistant',
  contenido: string,
  botUserId?: string
): Promise<void> {
  const contexto = await obtenerContexto(customerPhone, botUserId);

  contexto.historialMensajes.push({
    rol,
    contenido,
    timestamp: new Date(),
  });

  // Mantener solo los últimos 20 mensajes en memoria
  if (contexto.historialMensajes.length > 20) {
    contexto.historialMensajes = contexto.historialMensajes.slice(-20);
  }

  contextosEnMemoria.set(customerPhone, contexto);

  // Usar el sistema híbrido para guardar mensajes
  try {
    const effectiveBotUserId = botUserId || process.env.DEFAULT_USER_ID || 'default-user-id';

    await ConversationContextHybrid.addMessage(
      effectiveBotUserId,
      customerPhone,
      rol === 'user' ? 'user' : 'bot',
      contenido,
      'message'
    );
  } catch (error) {
    console.error('[Contexto] Error al guardar mensaje en sistema híbrido:', error);
  }
}

/**
 * Limpia el contexto de un usuario
 */
export async function limpiarContexto(userId: string): Promise<void> {
  contextosEnMemoria.delete(userId);
  
  // BD opcional - comentado
  /*
  try {
    await db.conversation.update({
      where: { customerPhone: userId },
      data: {
        status: 'ACTIVE',
        productId: null,
      },
    });
  } catch (error) {
    console.error('[Contexto] Error al limpiar:', error);
  }
  */
}

/**
 * Obtiene el historial formateado para la IA
 */
export function obtenerHistorialParaIA(contexto: ContextoConversacion, limite: number = 6): Array<{
  role: 'user' | 'assistant';
  content: string;
}> {
  if (!contexto.historialMensajes || contexto.historialMensajes.length === 0) {
    return [];
  }
  
  return contexto.historialMensajes
    .slice(-limite)
    .map(msg => ({
      role: msg.rol,
      content: msg.contenido,
    }));
}
