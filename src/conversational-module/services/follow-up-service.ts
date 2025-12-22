/**
 * Servicio de Seguimiento Automático
 * Gestiona seguimientos programados para leads y clientes
 */

import { db } from '@/lib/db';

interface FollowUpTask {
  id: string;
  userId: string; // Cliente
  botUserId: string; // Dueño del bot
  type: 'abandoned_cart' | 'post_purchase' | 'no_response' | 'interest_shown';
  scheduledFor: Date;
  message: string;
  productId?: string;
  productName?: string;
  status: 'pending' | 'sent' | 'cancelled';
  metadata?: any;
}

interface FollowUpConfig {
  type: FollowUpTask['type'];
  delayMinutes: number;
  message: string;
}

/**
 * Servicio de Seguimiento Automático
 */
export class FollowUpService {
  private static followUpConfigs: FollowUpConfig[] = [
    {
      type: 'abandoned_cart',
      delayMinutes: 60, // 1 hora después
      message: '¡Hola! 👋\n\nVi que estabas interesado en {productName} pero no completaste la compra.\n\n¿Hay algo en lo que pueda ayudarte? 🤔\n\n¿Tienes alguna duda sobre el producto o el proceso de pago?',
    },
    {
      type: 'no_response',
      delayMinutes: 1440, // 24 horas después
      message: '¡Hola! 😊\n\n¿Sigues interesado en {productName}?\n\nEstoy aquí para resolver cualquier duda que tengas.\n\n¿Hay algo específico que quieras saber?',
    },
    {
      type: 'post_purchase',
      delayMinutes: 2880, // 48 horas después
      message: '¡Hola! 🎉\n\n¿Cómo va todo con tu {productName}?\n\n¿Necesitas ayuda con algo? Estoy aquí para asistirte.\n\nTambién tengo algunas recomendaciones que podrían interesarte 😊',
    },
    {
      type: 'interest_shown',
      delayMinutes: 720, // 12 horas después
      message: '¡Hola! 👋\n\nRecordé que te interesaba {productName}.\n\n¿Ya tomaste una decisión?\n\nSi tienes dudas, con gusto te ayudo 😊',
    },
  ];

  /**
   * Programa un seguimiento automático
   */
  static async scheduleFollowUp(
    userId: string,
    botUserId: string,
    type: FollowUpTask['type'],
    productId?: string,
    productName?: string,
    metadata?: any
  ): Promise<void> {
    try {
      const config = this.followUpConfigs.find(c => c.type === type);
      if (!config) {
        console.error('[FollowUpService] Configuración no encontrada para tipo:', type);
        return;
      }

      const scheduledFor = new Date();
      scheduledFor.setMinutes(scheduledFor.getMinutes() + config.delayMinutes);

      // Personalizar mensaje
      let message = config.message;
      if (productName) {
        message = message.replace('{productName}', productName);
      }

      console.log(`[FollowUpService] 📅 Programando seguimiento ${type} para ${userId}`);
      console.log(`[FollowUpService] ⏰ Fecha programada: ${scheduledFor.toISOString()}`);

      // Guardar en base de datos (simulado - necesitarías una tabla de follow_ups)
      // Por ahora, lo guardamos en el contexto del usuario
      const { ConversationContextHybrid } = await import('@/lib/conversation-context-hybrid');
      
      const followUpData = {
        type,
        scheduledFor: scheduledFor.toISOString(),
        message,
        productId,
        productName,
        status: 'pending',
        metadata,
      };

      // Guardar en metadata del contexto
      const context = await ConversationContextHybrid.getContext(botUserId, userId);
      const currentFollowUps = context?.metadata?.followUps || [];
      
      await ConversationContextHybrid.updateContext(botUserId, userId, {
        metadata: {
          ...context?.metadata,
          followUps: [...currentFollowUps, followUpData],
        },
      });

      console.log('[FollowUpService] ✅ Seguimiento programado exitosamente');

    } catch (error) {
      console.error('[FollowUpService] Error programando seguimiento:', error);
    }
  }

  /**
   * Cancela todos los seguimientos pendientes para un usuario
   */
  static async cancelFollowUps(
    userId: string,
    botUserId: string,
    reason?: string
  ): Promise<void> {
    try {
      console.log(`[FollowUpService] ❌ Cancelando seguimientos para ${userId}`);
      console.log(`[FollowUpService] Razón: ${reason || 'No especificada'}`);

      const { ConversationContextHybrid } = await import('@/lib/conversation-context-hybrid');
      const context = await ConversationContextHybrid.getContext(botUserId, userId);
      
      if (context?.metadata?.followUps) {
        // Marcar todos como cancelados
        const updatedFollowUps = context.metadata.followUps.map((f: any) => ({
          ...f,
          status: 'cancelled',
          cancelReason: reason,
        }));

        await ConversationContextHybrid.updateContext(botUserId, userId, {
          metadata: {
            ...context.metadata,
            followUps: updatedFollowUps,
          },
        });

        console.log('[FollowUpService] ✅ Seguimientos cancelados');
      }

    } catch (error) {
      console.error('[FollowUpService] Error cancelando seguimientos:', error);
    }
  }

  /**
   * Obtiene seguimientos pendientes que deben ejecutarse
   */
  static async getPendingFollowUps(
    botUserId: string
  ): Promise<FollowUpTask[]> {
    try {
      // Aquí deberías consultar una tabla de follow_ups
      // Por ahora, retornamos un array vacío
      console.log('[FollowUpService] 🔍 Buscando seguimientos pendientes...');
      return [];

    } catch (error) {
      console.error('[FollowUpService] Error obteniendo seguimientos:', error);
      return [];
    }
  }

  /**
   * Ejecuta un seguimiento programado
   */
  static async executeFollowUp(
    followUp: FollowUpTask,
    sendMessage: (userId: string, message: string) => Promise<void>
  ): Promise<void> {
    try {
      console.log(`[FollowUpService] 📤 Ejecutando seguimiento ${followUp.type} para ${followUp.userId}`);

      // Enviar mensaje
      await sendMessage(followUp.userId, followUp.message);

      // Marcar como enviado
      const { ConversationContextHybrid } = await import('@/lib/conversation-context-hybrid');
      const context = await ConversationContextHybrid.getContext(followUp.botUserId, followUp.userId);
      
      if (context?.metadata?.followUps) {
        const updatedFollowUps = context.metadata.followUps.map((f: any) =>
          f.scheduledFor === followUp.scheduledFor
            ? { ...f, status: 'sent', sentAt: new Date().toISOString() }
            : f
        );

        await ConversationContextHybrid.updateContext(followUp.botUserId, followUp.userId, {
          metadata: {
            ...context.metadata,
            followUps: updatedFollowUps,
          },
        });
      }

      console.log('[FollowUpService] ✅ Seguimiento ejecutado exitosamente');

    } catch (error) {
      console.error('[FollowUpService] Error ejecutando seguimiento:', error);
    }
  }

  /**
   * Genera mensaje de seguimiento personalizado
   */
  static generateFollowUpMessage(
    type: FollowUpTask['type'],
    productName?: string,
    customerName?: string
  ): string {
    const config = this.followUpConfigs.find(c => c.type === type);
    if (!config) {
      return '¡Hola! ¿En qué puedo ayudarte hoy? 😊';
    }

    let message = config.message;

    // Personalizar con nombre del cliente si está disponible
    if (customerName) {
      message = `¡Hola ${customerName}! 👋\n\n` + message.replace('¡Hola! 👋\n\n', '');
    }

    // Reemplazar nombre del producto
    if (productName) {
      message = message.replace('{productName}', `*${productName}*`);
    }

    return message;
  }

  /**
   * Programa seguimiento por carrito abandonado
   */
  static async scheduleAbandonedCartFollowUp(
    userId: string,
    botUserId: string,
    productId: string,
    productName: string
  ): Promise<void> {
    await this.scheduleFollowUp(
      userId,
      botUserId,
      'abandoned_cart',
      productId,
      productName,
      { reason: 'payment_not_completed' }
    );
  }

  /**
   * Programa seguimiento post-compra
   */
  static async schedulePostPurchaseFollowUp(
    userId: string,
    botUserId: string,
    productId: string,
    productName: string,
    orderId?: string
  ): Promise<void> {
    await this.scheduleFollowUp(
      userId,
      botUserId,
      'post_purchase',
      productId,
      productName,
      { orderId, purpose: 'satisfaction_check' }
    );
  }

  /**
   * Programa seguimiento por falta de respuesta
   */
  static async scheduleNoResponseFollowUp(
    userId: string,
    botUserId: string,
    productId?: string,
    productName?: string
  ): Promise<void> {
    await this.scheduleFollowUp(
      userId,
      botUserId,
      'no_response',
      productId,
      productName,
      { reason: 'customer_went_silent' }
    );
  }

  /**
   * Programa seguimiento por interés mostrado
   */
  static async scheduleInterestFollowUp(
    userId: string,
    botUserId: string,
    productId: string,
    productName: string
  ): Promise<void> {
    await this.scheduleFollowUp(
      userId,
      botUserId,
      'interest_shown',
      productId,
      productName,
      { reason: 'product_inquiry' }
    );
  }

  /**
   * Obtiene estadísticas de seguimientos
   */
  static async getFollowUpStats(
    botUserId: string,
    userId?: string
  ): Promise<{
    total: number;
    pending: number;
    sent: number;
    cancelled: number;
    byType: Record<string, number>;
  }> {
    try {
      // Aquí deberías consultar la base de datos
      // Por ahora, retornamos estadísticas vacías
      return {
        total: 0,
        pending: 0,
        sent: 0,
        cancelled: 0,
        byType: {},
      };

    } catch (error) {
      console.error('[FollowUpService] Error obteniendo estadísticas:', error);
      return {
        total: 0,
        pending: 0,
        sent: 0,
        cancelled: 0,
        byType: {},
      };
    }
  }
}

/**
 * Helper para determinar si debe programarse un seguimiento
 */
export function shouldScheduleFollowUp(
  context: any,
  type: FollowUpTask['type']
): boolean {
  // No programar si ya hay un seguimiento pendiente del mismo tipo
  const existingFollowUps = context?.metadata?.followUps || [];
  const hasPendingOfType = existingFollowUps.some(
    (f: any) => f.type === type && f.status === 'pending'
  );

  return !hasPendingOfType;
}
