/**
 * 📸 SERVICIO DE MEDIOS
 * Prepara imágenes y otros medios para enviar por WhatsApp
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

export class MediaService {
  /**
   * Preparar imagen para enviar por WhatsApp
   */
  static async prepareImageMessage(
    imageUrl: string,
    caption?: string
  ): Promise<{ image: Buffer; caption?: string }> {
    
    console.log('📸 Preparando imagen:', imageUrl);

    try {
      let imageBuffer: Buffer;

      // Si es URL, descargar
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log('🌐 Descargando imagen desde URL...');
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000
        });
        imageBuffer = Buffer.from(response.data);
      } 
      // Si es ruta local
      else {
        console.log('📁 Leyendo imagen desde archivo local...');
        const fullPath = path.isAbsolute(imageUrl) 
          ? imageUrl 
          : path.join(process.cwd(), imageUrl);
        
        imageBuffer = await fs.promises.readFile(fullPath);
      }

      console.log('✅ Imagen preparada:', imageBuffer.length, 'bytes');

      return {
        image: imageBuffer,
        caption
      };

    } catch (error) {
      console.error('❌ Error preparando imagen:', error);
      throw new Error('No se pudo preparar la imagen');
    }
  }

  /**
   * Validar que una URL de imagen sea accesible
   */
  static async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url, { timeout: 5000 });
      const contentType = response.headers['content-type'];
      return contentType?.startsWith('image/') || false;
    } catch {
      return false;
    }
  }

  /**
   * Obtener tamaño de imagen
   */
  static async getImageSize(imageUrl: string): Promise<number> {
    try {
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        const response = await axios.head(imageUrl, { timeout: 5000 });
        return parseInt(response.headers['content-length'] || '0');
      } else {
        const stats = await fs.promises.stat(imageUrl);
        return stats.size;
      }
    } catch {
      return 0;
    }
  }
}
