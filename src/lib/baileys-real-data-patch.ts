/**
 * PARCHE PARA BAILEYS: DATOS REALES Y FOTOS CARD
 * Integra RealDataEnforcer y CardPhotoSender en el flujo de mensajes
 */

import { RealDataEnforcer } from './real-data-enforcer';
import { CardPhotoSender } from './card-photo-sender';
import type { WASocket } from '@whiskeysockets/baileys';

export class BaileysRealDataPatch {
  /**
   * Procesa respuesta del bot y garantiza datos reales
   */
  static async processResponse(
    socket: WASocket,
    to: string,
    response: string,
    productIds?: string[]
  ): Promise<{
    success: boolean;
    photosSent: number;
    correctedResponse?: string;
  }> {
    console.log('[BaileysRealDataPatch] 🔍 Verificando respuesta...');

    let correctedResponse = response;
    let photosSent = 0;

    // Si hay productos, enviar con fotos CARD
    if (productIds && productIds.length > 0) {
      console.log(`[BaileysRealDataPatch] 📦 Enviando ${productIds.length} productos con CARD`);

      for (const productId of productIds.slice(0, 3)) { // Máximo 3 productos
        try {
          // Obtener datos REALES
          const productData = await RealDataEnforcer.getProductData(productId);
          
          if (!productData) {
            console.log(`[BaileysRealDataPatch] ⚠️ Producto ${productId} no encontrado`);
            continue;
          }

          // Enviar con formato CARD
          const result = await CardPhotoSender.sendProductCard(socket, to, productId);
          
          if (result.success) {
            photosSent += result.photosSent;
            console.log(`[BaileysRealDataPatch] ✅ Producto enviado: ${productData.name}`);
          }

          // Delay entre productos
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`[BaileysRealDataPatch] ❌ Error enviando producto:`, error);
        }
      }
    }

    // Verificar precios en la respuesta
    if (productIds && productIds.length > 0) {
      const validation = await RealDataEnforcer.validateMessage(response, productIds[0]);
      
      if (!validation.isValid) {
        console.log('[BaileysRealDataPatch] ⚠️ Precios incorrectos detectados');
        console.log('[BaileysRealDataPatch] 🔧 Corrigiendo respuesta...');
        
        if (validation.correctedMessage) {
          correctedResponse = validation.correctedMessage;
        }
      }
    }

    return {
      success: true,
      photosSent,
      correctedResponse: correctedResponse !== response ? correctedResponse : undefined
    };
  }

  /**
   * Envía producto específico con datos reales garantizados
   */
  static async sendProductWithRealData(
    socket: WASocket,
    to: string,
    productId: string
  ): Promise<boolean> {
    try {
      console.log(`[BaileysRealDataPatch] 📤 Enviando producto ${productId} con datos reales`);

      // Obtener datos REALES
      const productData = await RealDataEnforcer.getProductData(productId);
      
      if (!productData) {
        console.log('[BaileysRealDataPatch] ❌ Producto no encontrado');
        return false;
      }

      // Enviar con formato CARD
      const result = await CardPhotoSender.sendProductCard(socket, to, productId);

      if (result.success) {
        console.log(`[BaileysRealDataPatch] ✅ Producto enviado exitosamente`);
        console.log(`[BaileysRealDataPatch] 📸 Fotos enviadas: ${result.photosSent}`);
        return true;
      } else {
        console.log('[BaileysRealDataPatch] ⚠️ No se pudieron enviar fotos');
        
        // Fallback: enviar solo texto con datos reales
        const textMessage = await RealDataEnforcer.generateProductMessage(productId);
        if (textMessage) {
          await socket.sendMessage(to, { text: textMessage });
          console.log('[BaileysRealDataPatch] ✅ Mensaje de texto enviado');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('[BaileysRealDataPatch] ❌ Error:', error);
      return false;
    }
  }

  /**
   * Verifica y corrige precios en un mensaje antes de enviarlo
   */
  static async verifyAndCorrectPrices(
    message: string,
    productId?: string
  ): Promise<string> {
    if (!productId) {
      return message;
    }

    const validation = await RealDataEnforcer.validateMessage(message, productId);
    
    if (!validation.isValid && validation.correctedMessage) {
      console.log('[BaileysRealDataPatch] 🔧 Mensaje corregido con precios reales');
      return validation.correctedMessage;
    }

    return message;
  }
}
