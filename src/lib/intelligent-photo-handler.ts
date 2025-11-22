/**
 * 🧠 MANEJADOR INTELIGENTE DE FOTOS
 * Razona sobre qué foto enviar basándose en el contexto
 */

import { WASocket } from '@whiskeysockets/baileys';
import { db } from './db';
import { ProfessionalConversationMemory } from './professional-conversation-memory';
import axios from 'axios';

export interface PhotoRequest {
  isPhotoRequest: boolean;
  confidence: number;
  reasoning: string;
  productContext?: {
    hasProduct: boolean;
    productName?: string;
    productId?: string;
  };
}

export class IntelligentPhotoHandler {
  /**
   * Analizar si el mensaje es una solicitud de foto
   */
  static analyzePhotoRequest(
    message: string,
    conversationKey: string
  ): PhotoRequest {
    const lowerMsg = message.toLowerCase().trim();
    
    // Patrones de solicitud de foto
    const photoPatterns = [
      /\bfoto\b/,
      /\bfotos\b/,
      /\bimagen\b/,
      /\bimagenes\b/,
      /\bimágenes\b/,
      /\bver\s+(la|el|las|los)?\s*foto/,
      /\benv[ií]a\s+(la|el|las|los)?\s*foto/,
      /\bmanda\s+(la|el|las|los)?\s*foto/,
      /\bmuestra\s+(la|el|las|los)?\s*foto/,
      /\bpasa\s+(la|el|las|los)?\s*foto/,
      /\bquiero\s+ver/,
      /\bc[oó]mo\s+(se\s+)?ve/,
      /\bc[oó]mo\s+(es|son)/,
      /\baspecto\b/,
    ];
    
    const isPhotoRequest = photoPatterns.some(pattern => pattern.test(lowerMsg));
    
    if (!isPhotoRequest) {
      return {
        isPhotoRequest: false,
        confidence: 0,
        reasoning: 'No es solicitud de foto'
      };
    }
    
    // Obtener contexto de memoria
    const memory = ProfessionalConversationMemory.getMemory(conversationKey) || {
      currentProduct: null,
      productHistory: [],
    } as any;
    
    // Razonamiento sobre el contexto
    if (memory.currentProduct) {
      return {
        isPhotoRequest: true,
        confidence: 0.95,
        reasoning: `Cliente pide foto del producto en conversación: ${memory.currentProduct.name}`,
        productContext: {
          hasProduct: true,
          productName: memory.currentProduct.name,
          productId: memory.currentProduct.id
        }
      };
    }
    
    // Si hay productos en historial reciente
    if (memory.productHistory && memory.productHistory.length > 0) {
      const lastProduct = memory.productHistory[0];
      return {
        isPhotoRequest: true,
        confidence: 0.85,
        reasoning: `Cliente pide foto, último producto mencionado: ${lastProduct.name}`,
        productContext: {
          hasProduct: true,
          productName: lastProduct.name,
          productId: lastProduct.id
        }
      };
    }
    
    // Solicitud de foto sin contexto
    return {
      isPhotoRequest: true,
      confidence: 0.60,
      reasoning: 'Cliente pide foto pero no hay producto en contexto',
      productContext: {
        hasProduct: false
      }
    };
  }
  
  /**
   * Enviar foto del producto con razonamiento
   */
  static async sendIntelligentPhoto(
    socket: WASocket,
    to: string,
    photoRequest: PhotoRequest
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Si no hay producto en contexto
      if (!photoRequest.productContext?.hasProduct || !photoRequest.productContext.productId) {
        console.log('[IntelligentPhoto] ⚠️ No hay producto en contexto');
        return {
          success: false,
          message: '¿De cuál producto quieres ver la foto? 🤔\n\n' +
                   'Dime el nombre del producto que te interesa.'
        };
      }
      
      // Obtener producto de BD
      const product = await db.product.findUnique({
        where: { id: photoRequest.productContext.productId }
      });
      
      if (!product) {
        console.log('[IntelligentPhoto] ❌ Producto no encontrado en BD');
        return {
          success: false,
          message: 'No encontré ese producto. ¿Puedes decirme cuál te interesa? 😊'
        };
      }
      
      console.log(`[IntelligentPhoto] 📦 Producto identificado: ${product.name}`);
      console.log(`[IntelligentPhoto] 💭 Razonamiento: ${photoRequest.reasoning}`);
      
      // Obtener fotos
      let photos: string[] = [];
      if (product.images) {
        try {
          const parsed = typeof product.images === 'string' 
            ? JSON.parse(product.images) 
            : product.images;
          photos = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          console.log('[IntelligentPhoto] ⚠️ Error parseando imágenes');
        }
      }
      
      // Convertir URLs de Google Drive
      if (photos.length > 0) {
        const { GoogleDriveConverter } = await import('./google-drive-converter');
        photos = GoogleDriveConverter.convertMultipleUrls(photos);
      }
      
      // Si no tiene fotos
      if (photos.length === 0 || !photos[0] || photos[0].trim() === '') {
        console.log('[IntelligentPhoto] 📝 Producto sin fotos');
        return {
          success: false,
          message: `Lo siento, el *${product.name}* no tiene fotos disponibles en este momento. 😔\n\n` +
                   `Pero puedo darte todos los detalles:\n\n` +
                   `💰 *Precio:* ${this.formatPrice(product.price, product.currency)}\n` +
                   `📝 *Descripción:* ${product.description || 'Producto de calidad'}\n\n` +
                   `¿Te gustaría saber algo más? 😊`
        };
      }
      
      // Descargar y enviar foto
      const photoUrl = photos[0];
      console.log(`[IntelligentPhoto] 📸 Descargando foto...`);
      
      const imageBuffer = await this.downloadImage(photoUrl);
      
      if (!imageBuffer) {
        console.log('[IntelligentPhoto] ❌ No se pudo descargar la imagen');
        return {
          success: false,
          message: `Tuve un problema descargando la foto del *${product.name}*. 😔\n\n` +
                   `Pero aquí están los detalles:\n\n` +
                   `💰 *${this.formatPrice(product.price, product.currency)}*\n` +
                   `📝 ${product.description || 'Producto de calidad'}\n\n` +
                   `¿Quieres que te envíe los métodos de pago? 😊`
        };
      }
      
      // Crear mensaje natural
      const caption = this.createNaturalCaption(product);
      
      // Enviar foto
      console.log(`[IntelligentPhoto] ✅ Enviando foto del ${product.name}...`);
      
      await socket.sendMessage(to, {
        image: imageBuffer,
        caption: caption
      });
      
      console.log(`[IntelligentPhoto] 🎉 Foto enviada exitosamente`);
      
      return {
        success: true,
        message: caption
      };
      
    } catch (error: any) {
      console.error('[IntelligentPhoto] ❌ Error:', error.message);
      return {
        success: false,
        message: 'Tuve un problema enviando la foto. ¿Puedo ayudarte con algo más? 😊'
      };
    }
  }
  
  /**
   * Crear mensaje natural para la foto
   */
  private static createNaturalCaption(product: any): string {
    const price = this.formatPrice(product.price, product.currency);
    
    let caption = `📸 Aquí está el *${product.name}*\n\n`;
    
    // Agregar descripción si existe
    if (product.description && product.description.length > 0) {
      const shortDesc = product.description.length > 150 
        ? product.description.substring(0, 150) + '...'
        : product.description;
      caption += `${shortDesc}\n\n`;
    }
    
    caption += `💰 *Precio:* ${price}\n\n`;
    
    // Agregar stock si está disponible
    if (product.stock && product.stock > 0) {
      caption += `✅ *Disponible:* ${product.stock} unidades\n\n`;
    }
    
    caption += `¿Te gusta? ¿Quieres que te envíe los métodos de pago? 😊`;
    
    return caption;
  }
  
  /**
   * Descargar imagen
   */
  private static async downloadImage(url: string): Promise<Buffer | null> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'WhatsApp/2.0'
        }
      });
      
      if (response.status === 200 && response.data) {
        return Buffer.from(response.data);
      }
      
      return null;
    } catch (error: any) {
      console.error('[IntelligentPhoto] Error descargando:', error.message);
      return null;
    }
  }
  
  /**
   * Formatear precio
   */
  private static formatPrice(price: number, currency: string = 'COP'): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  }
}
