/**
 * Integración opcional del FlowEngine con Baileys
 * Este módulo puede reemplazar el sistema clean-bot cuando se active
 */

import { FlowIntegration } from './flow-integration';
import { db } from './db';
import type { WASocket } from '@whiskeysockets/baileys';

export class FlowBaileysIntegration {
  /**
   * Procesa un mensaje usando el FlowEngine en lugar del clean-bot
   */
  static async handleMessageWithFlow(params: {
    sock: WASocket;
    userId: string;
    from: string;
    messageText: string;
    conversationId: string;
  }) {
    const { sock, userId, from, messageText, conversationId } = params;

    console.log('[FlowBaileys] 🎯 Procesando mensaje con FlowEngine');

    try {
      // Obtener nombre del usuario si está disponible
      const userName = await this.getUserName(from, sock);

      // Procesar con FlowEngine
      const result = await FlowIntegration.processMessage({
        sock,
        chatId: from,
        userName,
        text: messageText
      });

      console.log(`[FlowBaileys] ✅ ${result.responsesCount} respuestas enviadas`);

      // Guardar respuestas en la base de datos
      const session = FlowIntegration.getSession(from);
      const lastBotMessage = session.history
        .filter(h => h.from === 'bot')
        .pop();

      if (lastBotMessage) {
        await db.message.create({
          data: {
            conversationId,
            content: lastBotMessage.text,
            direction: 'OUTGOING',
            type: 'TEXT'
          }
        });
      }

      // Actualizar conversación
      await db.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          productId: session.context.product?.id || undefined
        }
      });

      return {
        success: true,
        responsesCount: result.responsesCount,
        productId: session.context.product?.id
      };

    } catch (error) {
      console.error('[FlowBaileys] ❌ Error procesando mensaje:', error);
      
      // Fallback a mensaje de error
      await sock.sendMessage(from, {
        text: 'Disculpa, tuve un problema procesando tu mensaje. Por favor intenta de nuevo.'
      });

      return {
        success: false,
        error
      };
    }
  }

  /**
   * Obtiene el nombre del usuario desde WhatsApp
   */
  private static async getUserName(jid: string, sock: WASocket): Promise<string | undefined> {
    try {
      // Intentar obtener el nombre del contacto desde el store
      const pushName = sock.user?.name;
      if (pushName) return pushName;
      
      // Extraer número de teléfono como fallback
      const phoneNumber = jid.split('@')[0];
      return phoneNumber;
    } catch (error) {
      console.error('[FlowBaileys] Error obteniendo nombre de usuario:', error);
    }
    return undefined;
  }

  /**
   * Detecta si el mensaje es una intención de pago
   */
  static isPaymentIntent(text: string): boolean {
    const paymentKeywords = [
      'pagar',
      'pago',
      'link',
      'enlace',
      'comprar',
      'mercado pago',
      'paypal',
      'nequi',
      'daviplata',
      'método de pago',
      'formas de pago'
    ];

    const normalized = text.toLowerCase();
    return paymentKeywords.some(keyword => normalized.includes(keyword));
  }

  /**
   * Obtiene estadísticas de la sesión
   */
  static getSessionStats(chatId: string) {
    const session = FlowIntegration.getSession(chatId);
    return {
      state: session.state,
      messageCount: session.history.length,
      hasProduct: !!session.context.product,
      hasOrder: !!session.context.order,
      paymentMethod: session.context.paymentMethod
    };
  }
}

/**
 * Función helper para activar el FlowEngine en lugar del clean-bot
 * Usar en wa-service.ts
 */
export async function handleMessageWithFlowEngine(params: {
  sock: WASocket;
  userId: string;
  from: string;
  messageText: string;
  conversationId: string;
}) {
  return FlowBaileysIntegration.handleMessageWithFlow(params);
}

