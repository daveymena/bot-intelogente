/**
 * 🤖 Manejador Automático de Fotos y Links de Pago
 * Detecta solicitudes y responde automáticamente
 */

import { WASocket } from '@whiskeysockets/baileys';
import { ProductPhotoSender } from './product-photo-sender';
import { BotPaymentLinkGenerator } from './bot-payment-link-generator';
import { db } from './db';

export class AutoPhotoPaymentHandler {
  
  /**
   * Procesar mensaje y detectar si solicita fotos o links de pago
   */
  static async handleMessage(
    socket: WASocket,
    userId: string,
    customerPhone: string,
    messageText: string,
    conversationId: string
  ): Promise<{ handled: boolean; type?: 'photo' | 'payment' }> {
    try {
      // 1. Detectar solicitud de fotos
      if (ProductPhotoSender.detectPhotoRequest(messageText)) {
        console.log('[AutoHandler] 📸 Solicitud de fotos detectada');
        await this.handlePhotoRequest(socket, userId, customerPhone, messageText, conversationId);
        return { handled: true, type: 'photo' };
      }

      // 2. Detectar solicitud de links de pago
      // DESACTIVADO: Ahora se maneja con el sistema inteligente en ai-service.ts
      // que usa IA para entender la intención y tiene mejor contexto
      /*
      if (BotPaymentLinkGenerator.detectPaymentRequest(messageText)) {
        console.log('[AutoHandler] 💳 Solicitud de pago detectada');
        await this.handlePaymentRequest(socket, userId, customerPhone, messageText, conversationId);
        return { handled: true, type: 'payment' };
      }
      */

      return { handled: false };

    } catch (error) {
      console.error('[AutoHandler] ❌ Error:', error);
      return { handled: false };
    }
  }

  /**
   * Manejar solicitud de fotos
   */
  private static async handlePhotoRequest(
    socket: WASocket,
    userId: string,
    customerPhone: string,
    messageText: string,
    conversationId: string
  ): Promise<void> {
    try {
      console.log('[AutoHandler] 📸 Procesando solicitud de fotos...');

      // Buscar productos relevantes en el contexto de la conversación
      const products = await this.findRelevantProductsFromContext(
        userId,
        customerPhone,
        messageText,
        conversationId
      );

      if (products.length === 0) {
        console.log('[AutoHandler] ⚠️ No se encontraron productos en el contexto');
        
        // Respuesta cuando no hay productos en contexto
        const response = '📸 Claro, con gusto te envío fotos. ¿De qué producto te gustaría ver fotos?\n\n' +
          'Puedes decirme:\n' +
          '• "Fotos de laptops"\n' +
          '• "Muéstrame las motos"\n' +
          '• "Fotos del Mega Pack 01"\n' +
          '• O el nombre del producto que te interesa';

        await socket.sendMessage(customerPhone, { text: response });
        await this.saveMessage(userId, customerPhone, response, conversationId);
        return;
      }

      // Enviar mensaje de confirmación
      const confirmMsg = products.length === 1
        ? `📸 Perfecto, te envío la foto de *${products[0].name}*...`
        : `📸 Perfecto, te envío fotos de los ${products.length} productos...`;

      await socket.sendMessage(customerPhone, { text: confirmMsg });
      await this.saveMessage(userId, customerPhone, confirmMsg, conversationId);

      // Pequeña pausa
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Enviar fotos de productos
      const result = await ProductPhotoSender.sendProductsWithPhotos(
        socket,
        customerPhone,
        products,
        5 // Máximo 5 productos
      );

      console.log(`[AutoHandler] ✅ Fotos enviadas: ${result.sent} exitosas, ${result.failed} fallidas`);

      // Mensaje de seguimiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const followUp = result.sent > 0
        ? `✅ Listo! Te envié ${result.sent === 1 ? 'la foto' : `las ${result.sent} fotos`}.\n\n` +
          `¿Te gusta? ¿Quieres saber más detalles o proceder con la compra? 😊`
        : '😅 Disculpa, tuve un problema enviando las fotos. ¿Puedes intentar de nuevo?';

      await socket.sendMessage(customerPhone, { text: followUp });
      await this.saveMessage(userId, customerPhone, followUp, conversationId);

    } catch (error) {
      console.error('[AutoHandler] ❌ Error en solicitud de fotos:', error);
      
      const errorMsg = '😅 Disculpa, tuve un problema enviando las fotos. ¿Puedes intentar de nuevo?';
      await socket.sendMessage(customerPhone, { text: errorMsg });
    }
  }

  /**
   * Manejar solicitud de links de pago
   */
  private static async handlePaymentRequest(
    socket: WASocket,
    userId: string,
    customerPhone: string,
    messageText: string,
    conversationId: string
  ): Promise<void> {
    try {
      console.log('[AutoHandler] 💳 Procesando solicitud de pago...');
      console.log('[AutoHandler] 🔍 userId:', userId);
      console.log('[AutoHandler] 🔍 customerPhone:', customerPhone);
      console.log('[AutoHandler] 🔍 conversationId:', conversationId);

      // Buscar productos relevantes en el contexto
      const products = await this.findRelevantProductsFromContext(
        userId,
        customerPhone,
        messageText,
        conversationId
      );

      if (products.length === 0) {
        console.log('[AutoHandler] ⚠️ No se encontraron productos en el contexto');
        
        // Intentar buscar el último producto mencionado en la BD
        const lastProduct = await this.findLastMentionedProductInDB(conversationId);
        
        if (lastProduct) {
          console.log(`[AutoHandler] ✅ Producto encontrado en BD: ${lastProduct.name}`);
          
          // Enviar mensaje de confirmación
          const confirmMsg = `💳 Perfecto! Te preparo los links de pago para *${lastProduct.name}*...`;
          await socket.sendMessage(customerPhone, { text: confirmMsg });
          await this.saveMessage(userId, customerPhone, confirmMsg, conversationId);

          // Pequeña pausa
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Generar links de pago
          const paymentResult = await BotPaymentLinkGenerator.generatePaymentLinks(
            lastProduct.id,
            userId,
            1
          );

          if (paymentResult.success && paymentResult.message) {
            await socket.sendMessage(customerPhone, { text: paymentResult.message });
            await this.saveMessage(userId, customerPhone, paymentResult.message, conversationId);
            console.log('[AutoHandler] ✅ Links de pago enviados (desde BD)');
            return;
          }
        }
        
        // Si realmente no hay productos, preguntar
        const response = '💳 Claro, con gusto te ayudo con el pago. ¿Qué producto te gustaría comprar?\n\n' +
          'Dime el nombre del producto y te envío todas las opciones de pago disponibles 😊';

        await socket.sendMessage(customerPhone, { text: response });
        await this.saveMessage(userId, customerPhone, response, conversationId);
        return;
      }

      // Tomar el primer producto (el más relevante)
      const product = products[0];
      console.log(`[AutoHandler] ✅ Producto seleccionado: ${product.name}`);

      // Enviar mensaje de confirmación
      const confirmMsg = `💳 Perfecto! Te preparo los links de pago para *${product.name}*...`;
      await socket.sendMessage(customerPhone, { text: confirmMsg });
      await this.saveMessage(userId, customerPhone, confirmMsg, conversationId);

      // Pequeña pausa
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generar links de pago
      const paymentResult = await BotPaymentLinkGenerator.generatePaymentLinks(
        product.id,
        userId,
        1 // Cantidad por defecto
      );

      if (paymentResult.success && paymentResult.message) {
        // Enviar mensaje con links de pago
        await socket.sendMessage(customerPhone, { text: paymentResult.message });
        await this.saveMessage(userId, customerPhone, paymentResult.message, conversationId);
        
        console.log('[AutoHandler] ✅ Links de pago enviados');
      } else {
        // Error generando links
        const errorMsg = '😅 Disculpa, tuve un problema generando los links de pago.\n\n' +
          'Pero puedes pagar por:\n' +
          '📱 Nequi: 304 274 8687\n' +
          '📱 Daviplata: 304 274 8687\n' +
          '🏦 Transferencia bancaria\n\n' +
          'O contáctame directamente para coordinar el pago 😊';

        await socket.sendMessage(customerPhone, { text: errorMsg });
        await this.saveMessage(userId, customerPhone, errorMsg, conversationId);
      }

    } catch (error) {
      console.error('[AutoHandler] ❌ Error en solicitud de pago:', error);
      
      const errorMsg = '😅 Disculpa, tuve un problema con los links de pago.\n\n' +
        'Puedes pagar por:\n' +
        '📱 Nequi: 304 274 8687\n' +
        '📱 Daviplata: 304 274 8687\n\n' +
        '¿Te sirve alguno de estos métodos?';
      
      await socket.sendMessage(customerPhone, { text: errorMsg });
    }
  }

  /**
   * Buscar el último producto mencionado en la base de datos
   */
  private static async findLastMentionedProductInDB(conversationId: string): Promise<any> {
    try {
      // Buscar mensajes que contengan nombres de productos
      const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            where: {
              OR: [
                { content: { contains: 'Curso', mode: 'insensitive' } },
                { content: { contains: 'Laptop', mode: 'insensitive' } },
                { content: { contains: 'Moto', mode: 'insensitive' } },
                { content: { contains: 'Megapack', mode: 'insensitive' } },
                { content: { contains: 'Foto de', mode: 'insensitive' } },
                { content: { contains: '━━━━', mode: 'insensitive' } } // Formato de producto
              ]
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!conversation || conversation.messages.length === 0) {
        return null;
      }

      // Extraer nombres de productos de los mensajes
      for (const message of conversation.messages) {
        // Buscar patrón "Foto de [Producto]"
        const fotoMatch = message.content.match(/Foto de (.+?) enviada/i);
        if (fotoMatch) {
          const productName = fotoMatch[1];
          const product = await db.product.findFirst({
            where: {
              userId: conversation.userId,
              name: { contains: productName, mode: 'insensitive' }
            }
          });
          if (product) return product;
        }

        // Buscar patrón "✨ [Producto]"
        const titleMatch = message.content.match(/✨\s*\*?([^*\n]+)\*?/);
        if (titleMatch) {
          const productName = titleMatch[1].trim();
          const product = await db.product.findFirst({
            where: {
              userId: conversation.userId,
              name: { contains: productName, mode: 'insensitive' }
            }
          });
          if (product) return product;
        }
      }

      return null;

    } catch (error) {
      console.error('[AutoHandler] ❌ Error buscando producto en BD:', error);
      return null;
    }
  }

  /**
   * Buscar productos relevantes del contexto de la conversación
   */
  private static async findRelevantProductsFromContext(
    userId: string,
    customerPhone: string,
    currentMessage: string,
    conversationId: string
  ): Promise<any[]> {
    try {
      // 🎯 PRIORIDAD 1: Usar ConversationContextService (último producto mencionado)
      const { ConversationContextService } = await import('./conversation-context-service');
      const conversationKey = `${userId}:${customerPhone}`;
      const productContext = ConversationContextService.getProductContext(conversationKey);

      if (productContext && productContext.lastProductId) {
        console.log(`[AutoHandler] 🎯 Producto del contexto: ${productContext.lastProductName}`);
        
        // Obtener producto de la BD
        const product = await db.product.findUnique({
          where: { id: productContext.lastProductId }
        });

        if (product) {
          console.log(`[AutoHandler] ✅ Producto encontrado en contexto guardado`);
          return [product];
        }
      }

      // 2. Intentar buscar productos mencionados en el mensaje actual
      const { intelligentProductSearch } = await import('./intelligent-product-search');
      
      const searchResult = await intelligentProductSearch({
        userMessage: currentMessage,
        previousProducts: [],
        conversationHistory: []
      });

      if (searchResult && searchResult.products && searchResult.products.length > 0) {
        console.log(`[AutoHandler] ✅ Productos encontrados en mensaje actual: ${searchResult.products.length}`);
        return searchResult.products;
      }

      // 3. Buscar en el historial reciente de la conversación
      const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10 // Últimos 10 mensajes
          }
        }
      });

      if (!conversation) {
        return [];
      }

      // Combinar mensajes recientes
      const recentContext = conversation.messages
        .map(m => m.content)
        .join(' ');

      // Buscar productos en el contexto combinado
      const historySearchResult = await intelligentProductSearch({
        userMessage: recentContext,
        previousProducts: [],
        conversationHistory: []
      });

      if (historySearchResult && historySearchResult.products && historySearchResult.products.length > 0) {
        console.log(`[AutoHandler] ✅ Productos encontrados en historial: ${historySearchResult.products.length}`);
        return historySearchResult.products;
      }

      // 4. Si no hay productos específicos, buscar por categoría general
      const generalTerms = ['laptop', 'moto', 'curso', 'megapack'];
      for (const term of generalTerms) {
        if (currentMessage.toLowerCase().includes(term) || recentContext.toLowerCase().includes(term)) {
          const generalSearchResult = await intelligentProductSearch({
            userMessage: term,
            previousProducts: [],
            conversationHistory: []
          });
          
          if (generalSearchResult && generalSearchResult.products && generalSearchResult.products.length > 0) {
            console.log(`[AutoHandler] ✅ Productos encontrados por término general: ${term}`);
            return generalSearchResult.products.slice(0, 5); // Máximo 5
          }
        }
      }

      return [];

    } catch (error) {
      console.error('[AutoHandler] ❌ Error buscando productos:', error);
      return [];
    }
  }

  /**
   * Guardar mensaje en la base de datos
   */
  private static async saveMessage(
    userId: string,
    customerPhone: string,
    message: string,
    conversationId: string
  ): Promise<void> {
    try {
      await db.message.create({
        data: {
          conversationId,
          content: message,
          direction: 'OUTGOING',
          type: 'TEXT'
        }
      });

      await db.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      });

    } catch (error) {
      console.error('[AutoHandler] ❌ Error guardando mensaje:', error);
    }
  }

  /**
   * Verificar si el mensaje debe ser manejado automáticamente
   */
  static shouldHandle(messageText: string): boolean {
    return ProductPhotoSender.detectPhotoRequest(messageText) ||
           BotPaymentLinkGenerator.detectPaymentRequest(messageText);
  }
}
