/**
 * SISTEMA AUTOMÁTICO DE ENVÍO DE FOTOS
 * Envía fotos con formato profesional cuando se menciona un producto
 */

import { PrismaClient } from '@prisma/client';
import { ProfessionalResponseFormatter } from './professional-response-formatter';

const prisma = new PrismaClient();

export class AutoPhotoSender {
  
  /**
   * Detecta si debe enviar fotos y las envía automáticamente
   */
  static async shouldSendPhotos(message: string, context: any): Promise<boolean> {
    const lowerMessage = message.toLowerCase();
    
    // Palabras clave que indican que quiere ver fotos
    const photoKeywords = [
      'foto', 'fotos', 'imagen', 'imagenes', 'ver', 'muestra', 'muéstrame',
      'tienes fotos', 'hay fotos', 'como se ve', 'cómo se ve'
    ];
    
    // Palabras clave de productos
    const productKeywords = [
      'curso', 'megapack', 'computador', 'laptop', 'pc',
      'photoshop', 'illustrator', 'diseño', 'piano', 'idiomas'
    ];
    
    const hasPhotoKeyword = photoKeywords.some(kw => lowerMessage.includes(kw));
    const hasProductKeyword = productKeywords.some(kw => lowerMessage.includes(kw));
    
    // Si menciona fotos O si está preguntando por un producto específico
    return hasPhotoKeyword || (hasProductKeyword && lowerMessage.length < 50);
  }

  /**
   * Envía fotos de un producto con formato profesional
   */
  static async sendProductPhotos(
    socket: any,
    to: string,
    productId: number,
    sendMessage: Function
  ): Promise<{ success: boolean; photosSent: number }> {
    try {
      // Obtener producto de BD
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          description: true,
          category: true,
          images: true,
          features: true
        }
      });

      if (!product) {
        return { success: false, photosSent: 0 };
      }

      // Parsear imágenes
      let images: string[] = [];
      try {
        if (typeof product.images === 'string') {
          images = JSON.parse(product.images);
        } else if (Array.isArray(product.images)) {
          images = product.images;
        }
      } catch (e) {
        console.error('[AutoPhotoSender] Error parseando imágenes:', e);
      }

      // Si no hay imágenes, enviar solo texto
      if (images.length === 0) {
        const textResponse = ProfessionalResponseFormatter.formatSingleProduct({
          name: product.name,
          price: product.price,
          description: product.description || '',
          category: product.category,
          features: product.features as string[] || []
        });
        
        await sendMessage(to, textResponse);
        return { success: true, photosSent: 0 };
      }

      // Enviar mensaje de que está enviando fotos
      const loadingMessage = ProfessionalResponseFormatter.formatPhotoRequest(product.name);
      await sendMessage(to, loadingMessage);

      // Enviar fotos (máximo 3)
      let photosSent = 0;
      const maxPhotos = Math.min(images.length, 3);

      for (let i = 0; i < maxPhotos; i++) {
        const imageUrl = images[i];
        
        // Generar caption profesional para cada foto
        const caption = this.generatePhotoCaption(product, i + 1, maxPhotos);
        
        try {
          // Enviar foto con caption
          await socket.sendMessage(to, {
            image: { url: imageUrl },
            caption: caption
          });
          
          photosSent++;
          
          // Pequeña pausa entre fotos (anti-ban)
          if (i < maxPhotos - 1) {
            await this.delay(1500);
          }
        } catch (error) {
          console.error(`[AutoPhotoSender] Error enviando foto ${i + 1}:`, error);
        }
      }

      // Mensaje final después de las fotos
      if (photosSent > 0) {
        await this.delay(1000);
        const finalMessage = this.generateFinalMessage(product);
        await sendMessage(to, finalMessage);
      }

      return { success: true, photosSent };

    } catch (error) {
      console.error('[AutoPhotoSender] Error en sendProductPhotos:', error);
      return { success: false, photosSent: 0 };
    }
  }

  /**
   * Genera caption profesional para cada foto
   */
  private static generatePhotoCaption(
    product: any,
    photoNumber: number,
    totalPhotos: number
  ): string {
    const emoji = ProfessionalResponseFormatter.getCategoryEmoji(product.category);
    const priceFormatted = ProfessionalResponseFormatter.formatPrice(product.price);
    
    let caption = `${emoji} ${product.name}\n\n`;
    
    if (photoNumber === 1) {
      // Primera foto: Precio y descripción principal
      caption += `💰 Precio: ${priceFormatted}\n\n`;
      caption += `📋 ${product.description}\n\n`;
      
      if (product.features && product.features.length > 0) {
        caption += '✨ Incluye:\n';
        product.features.slice(0, 3).forEach((feature: string) => {
          caption += `• ${feature}\n`;
        });
      }
    } else {
      // Fotos adicionales: Información complementaria
      caption += `💰 ${priceFormatted}\n\n`;
      caption += `📸 Foto ${photoNumber} de ${totalPhotos}\n\n`;
      
      if (product.features && product.features.length > 3) {
        caption += '✨ También incluye:\n';
        product.features.slice(3, 6).forEach((feature: string) => {
          caption += `• ${feature}\n`;
        });
      }
    }
    
    return caption;
  }

  /**
   * Genera mensaje final después de enviar fotos
   */
  private static generateFinalMessage(product: any): string {
    const priceFormatted = ProfessionalResponseFormatter.formatPrice(product.price);
    
    return `✨ Estas son las fotos de ${product.name}

💰 Precio: ${priceFormatted}

¿Te gustaría proceder con la compra? 🛒

También puedo:
• Darte más detalles
• Mostrarte formas de pago
• Resolver cualquier duda

¿Qué prefieres? 😊`;
  }

  /**
   * Busca producto por nombre o keywords
   */
  static async findProductByMessage(message: string, userId: string): Promise<number | null> {
    try {
      const lowerMessage = message.toLowerCase();
      
      // Buscar en BD
      const products = await prisma.product.findMany({
        where: {
          userId: userId,
          OR: [
            { name: { contains: message, mode: 'insensitive' } },
            { description: { contains: message, mode: 'insensitive' } },
            { tags: { hasSome: message.split(' ') } }
          ]
        },
        take: 1,
        select: { id: true }
      });

      return products[0]?.id || null;
    } catch (error) {
      console.error('[AutoPhotoSender] Error buscando producto:', error);
      return null;
    }
  }

  /**
   * Delay helper
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
