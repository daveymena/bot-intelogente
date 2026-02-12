/**
 * 🚀 SERVICIO DINÁMICO DE MERCADOPAGO
 * Genera links de pago personalizados para cada producto en tiempo real
 */

import { db } from './db';

interface PaymentPreference {
  id: string;
  init_point: string; // URL de pago
  sandbox_init_point?: string;
}

export class MercadoPagoDynamicService {
  /**
   * Genera un link de pago dinámico para un producto específico
   */
  static async generatePaymentLink(productId: string, userId: string): Promise<{ success: boolean; paymentUrl?: string; error?: string }> {
    try {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) {
        return { success: false, error: 'Token de MercadoPago no configurado' };
      }
      console.log(`[MercadoPago] 💳 Generando link de pago para producto: ${productId}`);

      // 1. Obtener producto de la base de datos
      const product = await db.product.findUnique({
        where: { id: productId },
        include: { user: true }
      });

      if (!product) {
        return { success: false, error: 'Producto no encontrado' };
      }

      // 2. Obtener configuración del negocio
      const botSettings = await db.botSettings.findUnique({
        where: { userId }
      });

      const businessName = botSettings?.businessName || 'Mi Tienda';
      const notificationUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bot-intelogente.vercel.app';

      // 3. Preparar imágenes del producto
      let productImage = 'https://via.placeholder.com/500x500?text=Producto';
      if (product.images) {
        try {
          const images = JSON.parse(product.images);
          if (Array.isArray(images) && images.length > 0) {
            productImage = images[0];
          }
        } catch (e) {
          // Si no es JSON, asumir que es una URL directa
          if (product.images.startsWith('http')) {
            productImage = product.images;
          }
        }
      }

      // 4. Crear preferencia de pago
      const preference = {
        items: [
          {
            id: product.id,
            title: product.name,
            description: product.description?.substring(0, 250) || 'Producto de calidad',
            picture_url: productImage,
            category_id: this.mapCategoryToMercadoPago(product.category),
            quantity: 1,
            currency_id: product.currency === 'USD' ? 'USD' : 'COP',
            unit_price: product.price
          }
        ],
        payer: {
          name: businessName,
          email: product.user.email
        },
        back_urls: {
          success: `${notificationUrl}/payment/success?productId=${productId}`,
          failure: `${notificationUrl}/payment/failure?productId=${productId}`,
          pending: `${notificationUrl}/payment/pending?productId=${productId}`
        },
        auto_return: 'approved',
        notification_url: `${notificationUrl}/api/webhooks/mercadopago`,
        external_reference: `${userId}_${productId}_${Date.now()}`,
        metadata: {
          user_id: userId,
          product_id: productId,
          product_name: product.name,
          product_type: product.category
        },
        statement_descriptor: businessName.substring(0, 22), // Máximo 22 caracteres
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
      };

      console.log(`[MercadoPago] 📦 Preferencia creada:`, {
        title: preference.items[0].title,
        price: preference.items[0].unit_price,
        currency: preference.items[0].currency_id
      });

      // 5. Enviar a MercadoPago
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preference)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[MercadoPago] ❌ Error de API:', errorData);
        return { success: false, error: `Error de MercadoPago: ${errorData.message || 'Desconocido'}` };
      }

      const data: PaymentPreference = await response.json();
      
      console.log(`[MercadoPago] ✅ Link generado exitosamente: ${data.init_point}`);

      // 6. Guardar el link en el producto (opcional, para caché)
      await db.product.update({
        where: { id: productId },
        data: { paymentLinkMercadoPago: data.init_point }
      });

      return {
        success: true,
        paymentUrl: data.init_point
      };

    } catch (error: any) {
      console.error('[MercadoPago] ❌ Error generando link:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mapea categorías internas a categorías de MercadoPago
   */
  private static mapCategoryToMercadoPago(category: string): string {
    const categoryMap: Record<string, string> = {
      'PHYSICAL': 'electronics', // Productos físicos
      'DIGITAL': 'services', // Productos digitales
      'SERVICE': 'services', // Servicios
      'DROPSHIPPING': 'electronics' // Dropshipping
    };

    return categoryMap[category] || 'others';
  }

  /**
   * Formatea el link de pago para WhatsApp
   */
  static formatForWhatsApp(productName: string, paymentUrl: string, price: number, currency: string = 'COP'): string {
    const formattedPrice = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency
    }).format(price);

    return `💳 *Link de Pago - MercadoPago*

📦 Producto: ${productName}
💰 Total: ${formattedPrice}

🔗 Paga de forma segura aquí:
${paymentUrl}

✅ Aceptamos:
• Tarjetas de crédito/débito
• PSE (Transferencia bancaria)
• Efectivo (Efecty, Baloto, etc.)

⏰ Este link expira en 7 días.

¿Necesitas ayuda con el pago? 😊`;
  }
}
