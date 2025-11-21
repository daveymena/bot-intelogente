"use strict";
/**
 * Gestión de contexto de conversación
 * Mantiene el estado de cada usuario
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerContexto = obtenerContexto;
exports.actualizarContexto = actualizarContexto;
exports.agregarMensajeAlHistorial = agregarMensajeAlHistorial;
exports.limpiarContexto = limpiarContexto;
exports.obtenerHistorialParaIA = obtenerHistorialParaIA;
const db_1 = require("@/lib/db");
const contextosEnMemoria = new Map();
/**
 * Obtiene el contexto de conversación de un usuario
 */
async function obtenerContexto(userId) {
    // Primero intentar desde memoria
    if (contextosEnMemoria.has(userId)) {
        return contextosEnMemoria.get(userId);
    }
    // Si no está en memoria, buscar en BD
    try {
        const conversacion = await db_1.db.conversation.findFirst({
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
            const contexto = {
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
    }
    catch (error) {
        console.error('[Contexto] Error al obtener de BD:', error);
    }
    // Crear nuevo contexto
    const nuevoContexto = {
        userId,
        historialMensajes: [],
    };
    contextosEnMemoria.set(userId, nuevoContexto);
    return nuevoContexto;
}
/**
 * Actualiza el contexto de conversación
 */
async function actualizarContexto(userId, actualizacion) {
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
async function agregarMensajeAlHistorial(userId, rol, contenido) {
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
async function limpiarContexto(userId) {
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
function obtenerHistorialParaIA(contexto, limite = 6) {
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
