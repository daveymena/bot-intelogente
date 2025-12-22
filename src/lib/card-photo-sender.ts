/**
 * SISTEMA DE ENVÍO DE FOTOS EN FORMATO CARD
 * Garantiza que SIEMPRE se envíen fotos con información estructurada
 */

import { RealDataEnforcer } from './real-data-enforcer';
import type { WASocket } from '@whiskeysockets/baileys';

interface CardMessage {
  photo: string;
  caption: string;
}

export class CardPhotoSender {
  /**
   * Genera mensaje en formato CARD profesional
   */
  static generateCardCaption(product: {
    name: string;
    price: number;
    description: string | null;
    category: string;
    deliveryLink?: string | null;
  }): string {
    const esDigital = product.category === 'DIGITAL' || product.category === 'MEGAPACK';
    const emoji = esDigital ? '📚' : '💻';

    let caption = `${emoji} *${product.name}*\n`;
    caption += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Precio destacado
    caption += `💰 *PRECIO:* ${RealDataEnforcer.formatPrice(product.price)}\n\n`;

    // Descripción
    if (product.description) {
      const shortDesc = product.description.length > 150 
        ? product.description.substring(0, 150) + '...' 
        : product.description;
      caption += `📝 ${shortDesc}\n\n`;
    }

    // Características según tipo
    if (esDigital) {
      caption += `✅ *INCLUYE:*\n`;
      caption += `   • Acceso inmediato\n`;
      caption += `   • Entrega por WhatsApp\n`;
      caption += `   • Soporte incluido\n`;
      caption += `   • Actualizaciones gratis\n\n`;
    } else {
      caption += `✅ *CARACTERÍSTICAS:*\n`;
      caption += `   • Producto nuevo\n`;
      caption += `   • Garantía incluida\n`;
      caption += `   • Envío disponible\n\n`;
    }

    // Call to action
    caption += `👉 *¿Te interesa?* Escribe "comprar" o "más info"\n`;
    caption += `━━━━━━━━━━━━━━━━━━━━`;

    return caption;
  }

  /**
   * Envía producto con foto en formato CARD
   */
  static async sendProductCard(
    socket: WASocket,
    to: string,
    productId: string
  ): Promise<{
    success: boolean;
    photosSent: number;
    error?: string;
  }> {
    try {
      console.log(`[CardPhotoSender] 📸 Enviando producto ${productId} en formato CARD`);

      // Obtener datos REALES del producto
      const product = await RealDataEnforcer.getProductData(productId);
      
      if (!product) {
        console.log(`[CardPhotoSender] ❌ Producto no encontrado`);
        return { success: false, photosSent: 0, error: 'Producto no encontrado' };
      }

      console.log(`[CardPhotoSender] ✅ Producto: ${product.name}`);
      console.log(`[CardPhotoSender] 💰 Precio REAL: ${RealDataEnforcer.formatPrice(product.price)}`);
      console.log(`[CardPhotoSender] 📸 Imágenes disponibles: ${product.images.length}`);

      // Verificar que tenga imágenes
      if (product.images.length === 0) {
        console.log(`[CardPhotoSender] ⚠️ Producto sin imágenes, enviando solo texto`);
        
        // Enviar mensaje de texto con formato CARD
        const textMessage = this.generateCardCaption(product);
        await socket.sendMessage(to, { text: textMessage });
        
        return { success: true, photosSent: 0 };
      }

      // Generar caption con formato CARD
      const caption = this.generateCardCaption(product);

      // Enviar fotos (máximo 3)
      const photosToSend = product.images.slice(0, 3);
      let photosSent = 0;

      for (const imageUrl of photosToSend) {
        try {
          console.log(`[CardPhotoSender] 📤 Enviando foto ${photosSent + 1}/${photosToSend.length}`);
          
          await socket.sendMessage(to, {
            image: { url: imageUrl },
            caption: photosSent === 0 ? caption : undefined // Solo primera foto con caption
          });

          photosSent++;
          console.log(`[CardPhotoSender] ✅ Foto ${photosSent} enviada`);

          // Delay entre fotos para evitar spam
          if (photosSent < photosToSend.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (photoError) {
          console.error(`[CardPhotoSender] ❌ Error enviando foto:`, photoError);
        }
      }

      console.log(`[CardPhotoSender] ✅ Enviadas ${photosSent}/${photosToSend.length} fotos`);

      return {
        success: photosSent > 0,
        photosSent
      };
    } catch (error) {
      console.error('[CardPhotoSender] ❌ Error:', error);
      return {
        success: false,
        photosSent: 0,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Envía múltiples productos con fotos en formato CARD
   */
  static async sendMultipleProductCards(
    socket: WASocket,
    to: string,
    productIds: string[],
    maxProducts: number = 3
  ): Promise<{
    success: boolean;
    productsSent: number;
    photosSent: number;
  }> {
    console.log(`[CardPhotoSender] 📦 Enviando ${productIds.length} productos (máx ${maxProducts})`);

    const productsToSend = productIds.slice(0, maxProducts);
    let productsSent = 0;
    let totalPhotosSent = 0;

    for (const productId of productsToSend) {
      try {
        const result = await this.sendProductCard(socket, to, productId);
        
        if (result.success) {
          productsSent++;
          totalPhotosSent += result.photosSent;
        }

        // Delay entre productos
        if (productsSent < productsToSend.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`[CardPhotoSender] ❌ Error enviando producto ${productId}:`, error);
      }
    }

    console.log(`[CardPhotoSender] ✅ Enviados ${productsSent} productos con ${totalPhotosSent} fotos`);

    return {
      success: productsSent > 0,
      productsSent,
      photosSent: totalPhotosSent
    };
  }

  /**
   * Envía mensaje de texto con formato CARD (sin foto)
   */
  static async sendTextCard(
    socket: WASocket,
    to: string,
    productId: string
  ): Promise<boolean> {
    try {
      const product = await RealDataEnforcer.getProductData(productId);
      
      if (!product) {
        return false;
      }

      const message = this.generateCardCaption(product);
      await socket.sendMessage(to, { text: message });

      console.log(`[CardPhotoSender] ✅ Mensaje CARD enviado (sin foto)`);
      return true;
    } catch (error) {
      console.error('[CardPhotoSender] ❌ Error enviando texto CARD:', error);
      return false;
    }
  }
}
