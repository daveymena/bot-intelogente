/**
 * Generación de links de pago
 * Usa el sistema existente BotPaymentLinkGenerator
 */

import { Product } from '../types';

export async function generatePaymentLinks(product: Product, userId: string): Promise<string | null> {
  try {
    console.log('[Payments] 💳 Generando links para:', product.name);

    const { BotPaymentLinkGenerator } = await import('@/lib/bot-payment-link-generator');
    
    const result = await BotPaymentLinkGenerator.generatePaymentLinks(
      product.id,
      userId,
      1
    );

    if (result.success && result.message) {
      console.log('[Payments] ✅ Links generados');
      return result.message;
    }

    console.log('[Payments] ⚠️ No se generaron links');
    return null;
  } catch (error) {
    console.error('[Payments] Error:', error);
    return null;
  }
}
