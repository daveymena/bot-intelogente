/**
 * Gestión de contexto por usuario
 * Simple y directo
 */

import { db } from '@/lib/db';
import { UserContext } from '../types';

// Cache en memoria para velocidad
const contextCache = new Map<string, UserContext>();

export async function getContext(userId: string): Promise<UserContext> {
  // Primero revisar cache
  if (contextCache.has(userId)) {
    return contextCache.get(userId)!;
  }

  // Buscar en BD
  try {
    const conversation = await db.conversation.findFirst({
      where: { customerPhone: userId },
      orderBy: { lastMessageAt: 'desc' },
    });

    const context: UserContext = {
      productId: conversation?.productId || null,
      productName: conversation?.productName || null,
      lastIntent: null,
      lastMessage: null,
    };

    contextCache.set(userId, context);
    return context;
  } catch (error) {
    console.error('[Context] Error:', error);
    return {};
  }
}

export async function updateContext(userId: string, update: Partial<UserContext>): Promise<void> {
  try {
    // Actualizar cache
    const current = contextCache.get(userId) || {};
    const newContext = { ...current, ...update };
    contextCache.set(userId, newContext);

    // Actualizar BD si hay producto
    if (update.productId || update.productName) {
      await db.conversation.updateMany({
        where: { customerPhone: userId },
        data: {
          productId: update.productId || undefined,
          productName: update.productName || undefined,
        },
      });
    }

    console.log('[Context] ✅ Actualizado:', userId, update);
  } catch (error) {
    console.error('[Context] Error actualizando:', error);
  }
}

export function clearContext(userId: string): void {
  contextCache.delete(userId);
}
