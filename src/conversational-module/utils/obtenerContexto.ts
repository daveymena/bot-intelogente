/**
 * Gestión de contexto de conversación
 * Mantiene el estado de cada usuario
 */

import { db } from '@/lib/db';

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
 * Obtiene el contexto de conversación de un usuario
 */
export async function obtenerContexto(userId: string): Promise<ContextoConversacion> {
  // Primero intentar desde memoria
  if (contextosEnMemoria.has(userId)) {
    return contextosEnMemoria.get(userId)!;
  }

  // Si no está en memoria, buscar en BD
  try {
    const conversacion = await db.conversation.findFirst({
      where: { 
        customerPhone: userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Últimos 10 mensajes
        },
      },
    });

    if (conversacion) {
      const contexto: ContextoConversacion = {
        userId,
        estado: conversacion.status || undefined,
        ultimoProductoId: conversacion.productId || undefined,
        historialMensajes: conversacion.messages.map(msg => ({
          rol: msg.direction === 'INCOMING' ? 'user' : 'assistant',
          contenido: msg.content,
          timestamp: msg.createdAt,
        })),
      };

      contextosEnMemoria.set(userId, contexto);
      return contexto;
    }
  } catch (error) {
    console.error('[Contexto] Error al obtener de BD:', error);
  }

  // Crear nuevo contexto
  const nuevoContexto: ContextoConversacion = {
    userId,
    historialMensajes: [],
  };

  contextosEnMemoria.set(userId, nuevoContexto);
  return nuevoContexto;
}

/**
 * Actualiza el contexto de conversación
 */
export async function actualizarContexto(
  userId: string,
  actualizacion: Partial<ContextoConversacion>
): Promise<void> {
  const contextoActual = await obtenerContexto(userId);
  const contextoNuevo = { ...contextoActual, ...actualizacion };
  
  contextosEnMemoria.set(userId, contextoNuevo);

  // Guardar en BD de forma asíncrona (opcional - comentado para evitar errores)
  // El sistema funciona solo con memoria, la BD es opcional
  /*
  try {
    await db.conversation.upsert({
      where: { customerPhone: userId },
      create: {
        customerPhone: userId,
        userId: 'default-user-id', // Necesitarías el userId real
        status: contextoNuevo.estado as any,
        productId: contextoNuevo.ultimoProductoId?.toString(),
      },
      update: {
        status: contextoNuevo.estado as any,
        productId: contextoNuevo.ultimoProductoId?.toString(),
        lastMessageAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[Contexto] Error al guardar en BD:', error);
  }
  */
}

/**
 * Agrega un mensaje al historial
 */
export async function agregarMensajeAlHistorial(
  userId: string,
  rol: 'user' | 'assistant',
  contenido: string
): Promise<void> {
  const contexto = await obtenerContexto(userId);
  
  contexto.historialMensajes.push({
    rol,
    contenido,
    timestamp: new Date(),
  });

  // Mantener solo los últimos 20 mensajes en memoria
  if (contexto.historialMensajes.length > 20) {
    contexto.historialMensajes = contexto.historialMensajes.slice(-20);
  }

  contextosEnMemoria.set(userId, contexto);

  // Guardar en BD (opcional - comentado para evitar errores)
  // El sistema funciona solo con memoria, la BD es opcional
  /*
  try {
    await db.message.create({
      data: {
        conversationId: userId,
        direction: rol === 'user' ? 'INCOMING' : 'OUTGOING',
        content: contenido,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[Contexto] Error al guardar mensaje:', error);
  }
  */
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
