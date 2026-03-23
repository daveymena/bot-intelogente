import { db } from '@/lib/db';
import { SubscriptionStatus } from '@prisma/client';

export interface SubscriptionResult {
  success: boolean;
  message: string;
  subscription?: {
    userId: string;
    status: string;
    expiresAt: Date;
    activated: boolean;
  };
}

export const UserLicenseService = {
  async upgradeSubscription(
    userId: string,
    plan: string,
    durationDays: number = 30
  ): Promise<SubscriptionResult> {
    try {
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      await db.subscription.upsert({
        where: { userId },
        update: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: expiresAt,
        },
        create: {
          userId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: expiresAt,
        },
      });

      await db.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: plan,
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expiresAt,
        },
      });

      return {
        success: true,
        message: `Suscripción activada exitosamente`,
        subscription: {
          userId,
          status: 'active',
          expiresAt,
          activated: true,
        },
      };
    } catch (error) {
      console.error('[UserLicenseService] Error upgrading subscription:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al activar suscripción',
      };
    }
  },

  async checkSubscription(userId: string): Promise<{
    active: boolean;
    plan?: string;
    expiresAt?: Date;
    daysRemaining?: number;
  }> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.subscriptionStatus !== 'active' || !user.subscriptionExpiresAt) {
        return { active: false };
      }

      const now = new Date();
      const expiresAt = new Date(user.subscriptionExpiresAt);

      if (now > expiresAt) {
        await db.user.update({
          where: { id: userId },
          data: { subscriptionStatus: 'expired' },
        });
        return { active: false };
      }

      const daysRemaining = Math.ceil(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        active: true,
        plan: user.subscriptionPlan || undefined,
        expiresAt,
        daysRemaining,
      };
    } catch (error) {
      console.error('[UserLicenseService] Error checking subscription:', error);
      return { active: false };
    }
  },

  async cancelSubscription(userId: string): Promise<SubscriptionResult> {
    try {
      await db.user.update({
        where: { id: userId },
        data: { subscriptionStatus: 'canceled' },
      });

      return {
        success: true,
        message: 'Suscripción cancelada',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al cancelar suscripción',
      };
    }
  },
};
