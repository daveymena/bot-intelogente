/**
 * 📸 Servicio de Envío de Imágenes de Productos
 * Garantiza que SIEMPRE se envíen las fotos cuando se menciona un producto
 */

import { db as prisma } from './db';
import type { WASocket } from '@whiskeysockets/baileys';

export class ProductImageSender {
  /**
   * Envía la imagen de un producto por WhatsApp
   * GARANTIZADO: Siempre intenta enviar si hay imagen disponible
   */
  static async sendProductImage(
    sock: WASocket,
    from: string,
    product: any,
    caption?: string
  ): Promise<boolean> {
    try {
      if (!product) {
        console.log('[ProductImageSender] ⚠️ Producto no proporcionado');
        return false;
      }

      // Obtener imágenes del producto
      let images = product.images;
      
      if (!images) {
        console.log('[ProductImageSender] ⚠️ Producto sin imágenes:', product.name);
        return false;
      }

      // Parsear si es string
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          console.log('[ProductImageSender] ⚠️ No se pudo parsear imágenes:', images);
          return false;
        }
      }

      // Validar que sea array
      if (!Array.isArray(images) || images.length === 0) {
        console.log('[ProductImageSender] ⚠️ Sin imágenes válidas para:', product.name);
        return false;
      }

      const imageUrl = images[0];
      if (!imageUrl) {
        console.log('[ProductImageSender] ⚠️ URL de imagen vacía');
        return false;
      }

      // Construir caption
      const finalCaption = caption || `📸 ${product.name}`;

      console.log('[ProductImageSender] 📤 Enviando imagen:', {
        producto: product.name,
        url: imageUrl.substring(0, 50) + '...',
        caption: finalCaption
      });

      // Enviar imagen
      await sock.sendMessage(from, {
        image: { url: imageUrl },
        caption: finalCaption
      });

      console.log('[ProductImageSender] ✅ Imagen enviada exitosamente');
      return true;

    } catch (error) {
      console.error('[ProductImageSender] ❌ Error enviando imagen:', error);
      return false;
    }
  }

  /**
   * Envía múltiples imágenes de un producto
   */
  static async sendMultipleProductImages(
    sock: WASocket,
    from: string,
    product: any,
    maxImages: number = 3
  ): Promise<number> {
    try {
      if (!product || !product.images) {
        return 0;
      }

      let images = product.images;
      if (typeof images === 'string') {
        images = JSON.parse(images);
      }

      if (!Array.isArray(images)) {
        return 0;
      }

      let sent = 0;
      const imagesToSend = images.slice(0, maxImages);

      for (let i = 0; i < imagesToSend.length; i++) {
        const imageUrl = imagesToSend[i];
        const caption = i === 0 
          ? `📸 ${product.name}` 
          : `📸 ${product.name} (${i + 1}/${imagesToSend.length})`;

        try {
          await sock.sendMessage(from, {
            image: { url: imageUrl },
            caption
          });
          sent++;
          
          // Pequeña pausa entre imágenes
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`[ProductImageSender] Error enviando imagen ${i + 1}:`, error);
        }
      }

      console.log(`[ProductImageSender] ✅ ${sent}/${imagesToSend.length} imágenes enviadas`);
      return sent;

    } catch (error) {
      console.error('[ProductImageSender] ❌ Error enviando múltiples imágenes:', error);
      return 0;
    }
  }

  /**
   * Envía imágenes de múltiples productos
   */
  static async sendMultipleProductsWithImages(
    sock: WASocket,
    from: string,
    products: any[],
    imagesPerProduct: number = 1
  ): Promise<number> {
    try {
      let totalSent = 0;

      for (const product of products) {
        const sent = await this.sendMultipleProductImages(
          sock,
          from,
          product,
          imagesPerProduct
        );
        totalSent += sent;

        // Pausa entre productos
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return totalSent;

    } catch (error) {
      console.error('[ProductImageSender] ❌ Error enviando imágenes de múltiples productos:', error);
      return 0;
    }
  }

  /**
   * Obtiene un producto con sus imágenes desde la BD
   */
  static async getProductWithImages(productId: string, userId: string) {
    try {
      const product = await prisma.product.findFirst({
        where: {
          id: productId,
          userId
        }
      });

      return product;
    } catch (error) {
      console.error('[ProductImageSender] Error obteniendo producto:', error);
      return null;
    }
  }

  /**
   * Busca productos por nombre y envía sus imágenes
   */
  static async findAndSendProductImages(
    sock: WASocket,
    from: string,
    productName: string,
    userId: string
  ): Promise<boolean> {
    try {
      const products = await prisma.product.findMany({
        where: {
          userId,
          name: {
            contains: productName,
            mode: 'insensitive'
          }
        },
        take: 1
      });

      if (products.length === 0) {
        console.log('[ProductImageSender] ⚠️ Producto no encontrado:', productName);
        return false;
      }

      return await this.sendProductImage(sock, from, products[0]);

    } catch (error) {
      console.error('[ProductImageSender] Error buscando y enviando producto:', error);
      return false;
    }
  }
}
