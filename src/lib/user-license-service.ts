import { db } from './db';
import crypto from 'crypto';

/**
 * Sistema de licencias para SaaS multi-tenant
 * Cada usuario tiene su propia licencia/suscripción
 */

export interface UserSubscription {
  userId: string;
  email: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  startDate: Date;
  expiresAt: Date;
  features: string[];
  limits: {
    maxMessages: number;
    maxProducts: number;
    maxConversations: number;
  };
}

export class UserLicenseService {
  /**
   * Crea una nueva suscripción para un usuario
   */
  static async createSubscription(
    userId: string,
    email: string,
    plan: 'free' | 'basic' | 'pro' | 'enterprise' = 'free',
    durationDays: number = 30
  ): Promise<UserSubscription> {
    const startDate = new Date();
    const expiresAt = new Date(startDate);
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const subscription: UserSubscription = {
      userId,
      email,
      plan,
      status: plan === 'free' ? 'trial' : 'active',
      startDate,
      expiresAt,
      features: this.getFeaturesForPlan(plan),
      limits: this.getLimitsForPlan(plan),
    };

    // Guardar en base de datos
    await db.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: plan,
        subscriptionStatus: subscription.status,
        subscriptionExpiresAt: expiresAt,
      },
    });

    return subscription;
  }

  /**
   * Verifica si un usuario tiene una suscripción válida
   */
  static async checkUserSubscription(userId: string): Promise<{
    valid: boolean;
    subscription?: UserSubscription;
    message: string;
    daysRemaining?: number;
  }> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          subscriptionExpiresAt: true,
          createdAt: true,
        },
      });

      if (!user) {
        return {
          valid: false,
          message: 'Usuario no encontrado',
        };
      }

      // Si no tiene suscripción, crear trial gratuito
      if (!user.subscriptionPlan || !user.subscriptionExpiresAt) {
        const subscription = await this.createSubscription(
          userId,
          user.email,
          'free',
          10 // 10 días de trial
        );

        return {
          valid: true,
          subscription,
          message: 'Trial gratuito activado (10 días)',
          daysRemaining: 10,
        };
      }

      const now = new Date();
      const expiresAt = new Date(user.subscriptionExpiresAt);
      const daysRemaining = Math.ceil(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Verificar si expiró
      if (now > expiresAt) {
        await db.user.update({
          where: { id: userId },
          data: { subscriptionStatus: 'expired' },
        });

        return {
          valid: false,
          message: 'Suscripción expirada. Renueva tu plan.',
        };
      }

      const subscription: UserSubscription = {
        userId,
        email: user.email,
        plan: user.subscriptionPlan as any,
        status: user.subscriptionStatus as any,
        startDate: user.createdAt,
        expiresAt,
        features: this.getFeaturesForPlan(user.subscriptionPlan as any),
        limits: this.getLimitsForPlan(user.subscriptionPlan as any),
      };

      return {
        valid: true,
        subscription,
        message: 'Suscripción activa',
        daysRemaining,
      };
    } catch (error) {
      console.error('Error checking subscription:', error);
      return {
        valid: false,
        message: 'Error al verificar suscripción',
      };
    }
  }

  /**
   * Actualiza la suscripción de un usuario
   */
  static async upgradeSubscription(
    userId: string,
    newPlan: 'basic' | 'pro' | 'enterprise',
    durationDays: number = 30
  ): Promise<{ success: boolean; message: string }> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      await db.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: newPlan,
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expiresAt,
        },
      });

      return {
        success: true,
        message: `Suscripción actualizada a ${newPlan} hasta ${expiresAt.toLocaleDateString()}`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al actualizar suscripción',
      };
    }
  }

  /**
   * Cancela la suscripción de un usuario
   */
  static async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      await db.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'cancelled',
        },
      });

      return {
        success: true,
        message: 'Suscripción cancelada',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al cancelar suscripción',
      };
    }
  }

  /**
   * Verifica si un usuario puede usar una característica
   */
  static async canUseFeature(userId: string, feature: string): Promise<boolean> {
    const check = await this.checkUserSubscription(userId);
    if (!check.valid || !check.subscription) return false;
    return check.subscription.features.includes(feature);
  }

  /**
   * Verifica si un usuario ha alcanzado un límite
   */
  static async checkLimit(
    userId: string,
    limitType: 'messages' | 'products' | 'conversations'
  ): Promise<{
    allowed: boolean;
    limit: number;
    current: number;
    remaining: number;
  }> {
    const check = await this.checkUserSubscription(userId);
    
    if (!check.valid || !check.subscription) {
      return { allowed: false, limit: 0, current: 0, remaining: 0 };
    }

    const limits = check.subscription.limits;
    let limit = 0;
    let current = 0;

    switch (limitType) {
      case 'messages':
        limit = limits.maxMessages;
        // Contar mensajes del usuario (implementar según tu lógica)
        current = 0;
        break;
      case 'products':
        limit = limits.maxProducts;
        current = await db.product.count({ where: { userId } });
        break;
      case 'conversations':
        limit = limits.maxConversations;
        current = await db.conversation.count({ where: { userId } });
        break;
    }

    const remaining = limit === -1 ? -1 : Math.max(0, limit - current);
    const allowed = limit === -1 || current < limit;

    return { allowed, limit, current, remaining };
  }

  /**
   * Obtiene características por plan
   */
  private static getFeaturesForPlan(plan: string): string[] {
    const features: Record<string, string[]> = {
      free: ['whatsapp', 'basic_ai', 'limited_products'],
      basic: ['whatsapp', 'ai_responses', 'product_management', 'analytics'],
      pro: [
        'whatsapp',
        'ai_responses',
        'product_management',
        'analytics',
        'advanced_ai',
        'priority_support',
        'custom_branding',
      ],
      enterprise: [
        'whatsapp',
        'ai_responses',
        'product_management',
        'analytics',
        'advanced_ai',
        'priority_support',
        'custom_branding',
        'api_access',
        'white_label',
        'dedicated_support',
      ],
    };

    return features[plan] || features.free;
  }

  /**
   * Obtiene límites por plan
   */
  private static getLimitsForPlan(plan: string): {
    maxMessages: number;
    maxProducts: number;
    maxConversations: number;
  } {
    const limits: Record<string, any> = {
      free: {
        maxMessages: 100,
        maxProducts: 20,
        maxConversations: 50,
      },
      basic: {
        maxMessages: 1000,
        maxProducts: 100,
        maxConversations: 500,
      },
      pro: {
        maxMessages: 10000,
        maxProducts: 1000,
        maxConversations: 5000,
      },
      enterprise: {
        maxMessages: -1, // ilimitado
        maxProducts: -1,
        maxConversations: -1,
      },
    };

    return limits[plan] || limits.free;
  }

  /**
   * Obtiene información de precios
   */
  static getPricing() {
    return {
      free: {
        name: 'Gratis',
        price: 0,
        duration: 10, // días
        features: [
          '100 mensajes/mes',
          '20 productos',
          '50 conversaciones',
          'IA básica',
        ],
      },
      basic: {
        name: 'Básico',
        price: 50000, // COP
        duration: 30, // días
        features: [
          '1,000 mensajes/mes',
          '100 productos',
          '500 conversaciones',
          'IA avanzada',
          'Analytics',
        ],
      },
      pro: {
        name: 'Pro',
        price: 150000, // COP
        duration: 30,
        features: [
          '10,000 mensajes/mes',
          '1,000 productos',
          '5,000 conversaciones',
          'IA avanzada',
          'Analytics completo',
          'Soporte prioritario',
          'Marca personalizada',
        ],
      },
      enterprise: {
        name: 'Enterprise',
        price: 500000, // COP
        duration: 30,
        features: [
          'Mensajes ilimitados',
          'Productos ilimitados',
          'Conversaciones ilimitadas',
          'Todo incluido',
          'API access',
          'White label',
          'Soporte dedicado',
        ],
      },
    };
  }
}

export default UserLicenseService;
