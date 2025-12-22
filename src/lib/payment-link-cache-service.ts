/**
 * 💳 SERVICIO DE CACHE DE LINKS DE PAGO
 * 
 * Usa links pre-generados de la BD para respuesta instantánea.
 * Solo regenera si el precio cambió.
 */

import { db } from './db';
import { BotPaymentLinkGenerator } from './bot-payment-link-generator';

export class PaymentLinkCacheService {
  /**
   * Obtener links de pago (usa cache o genera si es necesario)
   */
  static async getPaymentLinks(
    productId: string,
    userId: string,
    quantity: number = 1
  ): Promise<{
    success: boolean;
    mercadoPagoLink?: string;
    payPalLink?: string;
    nequiInfo?: string;
    daviplataInfo?: string;
    message: string;
    fromCache: boolean;
  }> {
    try {
      // 1. Obtener producto de la BD
      const product = await db.product.findFirst({
        where: {
          id: productId,
          userId: userId,
          status: 'AVAILABLE'
        }
      });

      if (!product) {
        return {
          success: false,
          message: 'Producto no encontrado',
          fromCache: false
        };
      }

      // 2. Verificar si tiene links pre-generados
      const hasPreGeneratedLinks = product.paymentLinkMercadoPago || product.paymentLinkPayPal;

      if (hasPreGeneratedLinks) {
        console.log('[PaymentCache] ⚡ Usando links pre-generados (respuesta instantánea)');

        // Construir mensaje con links pre-generados
        const message = this.buildPaymentMessage(
          product.name,
          product.price * quantity,
          product.paymentLinkMercadoPago || undefined,
          product.paymentLinkPayPal || undefined
        );

        return {
          success: true,
          mercadoPagoLink: product.paymentLinkMercadoPago || undefined,
          payPalLink: product.paymentLinkPayPal || undefined,
          nequiInfo: '3136174267',
          daviplataInfo: '3136174267',
          message,
          fromCache: true
        };
      }

      // 3. Si no tiene links, generarlos dinámicamente
      console.log('[PaymentCache] 🔄 Generando links dinámicamente (primera vez)');
      
      const result = await BotPaymentLinkGenerator.generatePaymentLinks(
        productId,
        userId,
        quantity
      );

      // 4. Guardar links generados en la BD para próximas veces
      if (result.success && (result.mercadoPagoLink || result.payPalLink)) {
        await db.product.update({
          where: { id: productId },
          data: {
            paymentLinkMercadoPago: result.mercadoPagoLink || null,
            paymentLinkPayPal: result.payPalLink || null
          }
        });
        console.log('[PaymentCache] 💾 Links guardados en BD para futuras consultas');
      }

      return {
        ...result,
        fromCache: false
      };

    } catch (error) {
      console.error('[PaymentCache] ❌ Error:', error);
      return {
        success: false,
        message: 'Error obteniendo links de pago',
        fromCache: false
      };
    }
  }

  /**
   * Regenerar links si el precio cambió
   */
  static async regenerateIfPriceChanged(
    productId: string,
    userId: string,
    newPrice: number
  ): Promise<void> {
    try {
      const product = await db.product.findUnique({
        where: { id: productId }
      });

      if (!product) return;

      // Si el precio cambió, regenerar links
      if (product.price !== newPrice) {
        console.log('[PaymentCache] 💰 Precio cambió, regenerando links...');
        
        const result = await BotPaymentLinkGenerator.generatePaymentLinks(
          productId,
          userId,
          1
        );

        if (result.success) {
          await db.product.update({
            where: { id: productId },
            data: {
              price: newPrice,
              paymentLinkMercadoPago: result.mercadoPagoLink || null,
              paymentLinkPayPal: result.payPalLink || null
            }
          });
          console.log('[PaymentCache] ✅ Links regenerados con nuevo precio');
        }
      }
    } catch (error) {
      console.error('[PaymentCache] Error regenerando links:', error);
    }
  }

  /**
   * Limpiar links de un producto (forzar regeneración)
   */
  static async clearProductLinks(productId: string): Promise<void> {
    try {
      await db.product.update({
        where: { id: productId },
        data: {
          paymentLinkMercadoPago: null,
          paymentLinkPayPal: null
        }
      });
      console.log('[PaymentCache] 🗑️ Links limpiados, se regenerarán en próxima solicitud');
    } catch (error) {
      console.error('[PaymentCache] Error limpiando links:', error);
    }
  }

  /**
   * Construir mensaje de pago
   */
  private static buildPaymentMessage(
    productName: string,
    totalPrice: number,
    mercadoPagoLink?: string,
    payPalLink?: string
  ): string {
    const formattedPrice = totalPrice.toLocaleString('es-CO');

    let message = `🟢 Tecnovariedades D&S — Opciones de pago\n\n`;
    message += `📦 *Producto:* ${productName}\n`;
    message += `💰 *Total a Pagar:* ${formattedPrice} COP\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*MÉTODOS DE PAGO DISPONIBLES:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // MercadoPago
    if (mercadoPagoLink) {
      message += `💳 *1. Mercado Pago*\n`;
      message += `   💰 Precio: ${formattedPrice} COP\n`;
      message += `   ✅ Tarjetas, PSE, Efectivo\n`;
      message += `   🔒 Pago 100% seguro\n`;
      message += `   👉 Link: ${mercadoPagoLink}\n\n`;
    }

    // PayPal
    if (payPalLink) {
      const priceUSD = (totalPrice / 4000).toFixed(2);
      message += `💙 *2. PayPal*\n`;
      message += `   💰 Precio: ${formattedPrice} COP\n`;
      message += `   💵 Aprox: ${priceUSD} USD\n`;
      message += `   ✅ Tarjetas internacionales\n`;
      message += `   🔒 Protección al comprador\n`;
      message += `   👉 Link: ${payPalLink}\n\n`;
    }

    // Nequi
    message += `📱 *3. Nequi*\n`;
    message += `   💰 Precio: ${formattedPrice} COP\n`;
    message += `   📞 Número: 3136174267\n`;
    message += `   📸 Envía captura del pago\n\n`;

    // Daviplata
    message += `📱 *4. Daviplata*\n`;
    message += `   💰 Precio: ${formattedPrice} COP\n`;
    message += `   📞 Número: 3136174267\n`;
    message += `   📸 Envía captura del pago\n\n`;

    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `✅ *Todos los métodos son seguros*\n`;
    message += `📦 *Entrega inmediata* después del pago\n`;
    message += `🔒 *Compra protegida por Tecnovariedades D&S*\n\n`;
    message += `¿Con cuál método prefieres pagar? 😊`;

    return message;
  }
}
