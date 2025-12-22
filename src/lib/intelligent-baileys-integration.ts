/**
 * Integración del Motor Inteligente con Baileys
 * Sistema con razonamiento real y memoria contextual
 */

import { getIntelligentEngine } from './intelligent-conversation-engine';
import { db as prisma } from './db';
import type { WASocket } from '@whiskeysockets/baileys';
import axios from 'axios';

export class IntelligentBaileysIntegration {
  /**
   * Procesa un mensaje con razonamiento inteligente
   */
  static async handleIntelligentMessage(params: {
    sock: WASocket;
    userId: string;
    from: string;
    messageText: string;
    conversationId: string;
    userName?: string;
  }) {
    const { sock, userId, from, messageText, conversationId, userName } = params;

    console.log('[IntelligentBot] 🧠 Procesando con razonamiento inteligente');
    console.log(`[IntelligentBot] 👤 Usuario: ${userName || from}`);
    console.log(`[IntelligentBot] 💬 Mensaje: "${messageText}"`);

    try {
      const engine = getIntelligentEngine();

      // Procesar mensaje con razonamiento completo
      const response = await engine.processMessage({
        chatId: from,
        userName,
        message: messageText,
        userId
      });

      console.log(`[IntelligentBot] 🎯 Confianza: ${(response.confidence * 100).toFixed(0)}%`);
      console.log(`[IntelligentBot] 📊 Contexto:`, {
        producto: response.context.currentProduct?.name || 'ninguno',
        intencionPago: response.context.paymentIntent || false,
        metodoPago: response.context.preferredPaymentMethod || 'ninguno'
      });

      // Procesar respuesta y limpiar marcadores especiales
      let finalText = response.text;

      // 🔍 DEBUG: Rastrear construcción del mensaje
      console.log('[DEBUG] ═══════════════════════════════════════');
      console.log('[DEBUG] Texto inicial:', finalText.substring(0, 150));
      console.log('[DEBUG] Acciones a ejecutar:', response.actions.length);
      console.log('[DEBUG] Producto en contexto:', response.context.currentProduct?.name || 'NINGUNO');
      console.log('[DEBUG] ═══════════════════════════════════════');

      // Procesar acciones
      for (const action of response.actions) {
        console.log(`[DEBUG] Procesando acción: ${action.type}`);
        if (action.type === 'send_images' && action.images && action.images.length > 0) {
          console.log('[IntelligentBot] 📸 Enviando imágenes del producto...');
          
          // Enviar imagen ANTES del texto
          try {
            const images = typeof action.images === 'string' 
              ? JSON.parse(action.images) 
              : action.images;

            if (images[0]) {
              await sock.sendMessage(from, {
                image: { url: images[0] },
                caption: `📸 ${action.product?.name || 'Producto'}`
              });
              console.log('[IntelligentBot] ✅ Imagen enviada');
              
              // Pequeña pausa para que la imagen llegue primero
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (error) {
            console.error('[IntelligentBot] ❌ Error enviando imagen:', error);
          }
        }

        // 🎯 NUEVA ACCIÓN: Enviar link de método ESPECÍFICO (cuando el cliente selecciona uno)
        if (action.type === 'send_specific_payment_method') {
          console.log('[IntelligentBot] 💳 Cliente seleccionó método:', action.method);
          console.log('[IntelligentBot] 📦 Producto:', action.product?.name || 'desconocido');
          console.log('[IntelligentBot] 📝 Texto formateado recibido:', action.formattedText?.substring(0, 200));
          
          // REEMPLAZAR COMPLETAMENTE el texto de la IA con el link real
          // La IA puede haber inventado texto, así que lo ignoramos
          if (action.formattedText) {
            finalText = action.formattedText;
            console.log('[IntelligentBot] ✅ Link de pago específico generado');
            console.log('[IntelligentBot] 🔍 Contiene número de Nequi:', finalText.includes('3136174267'));
          } else {
            console.log('[IntelligentBot] ⚠️ No hay formattedText en la acción');
          }
        }

        // Nueva acción: enviar TODOS los métodos de pago
        if (action.type === 'send_all_payment_methods') {
          console.log('[IntelligentBot] 💳 Enviando TODOS los métodos de pago...');
          
          // Reemplazar el marcador [SHOW_ALL_PAYMENT_METHODS] con el texto formateado
          if (finalText.includes('[SHOW_ALL_PAYMENT_METHODS]')) {
            finalText = finalText.replace(/\[SHOW_ALL_PAYMENT_METHODS\]/, action.formattedText);
          } else {
            // Si no hay marcador, agregar al final
            finalText += '\n\n' + action.formattedText;
          }

          console.log('[IntelligentBot] ✅ Todos los métodos de pago agregados');
        }

        // Acción: enviar links de pago formateados (método específico)
        if (action.type === 'send_payment_links') {
          console.log('[IntelligentBot] 💳 Enviando links de pago formateados...');
          
          // Reemplazar el marcador [PAYMENT_LINK] con el texto formateado
          if (finalText.includes('[PAYMENT_LINK:')) {
            finalText = finalText.replace(/\[PAYMENT_LINK:[^\]]+\]/, action.formattedText);
          } else {
            // Si no hay marcador, agregar al final
            finalText += '\n\n' + action.formattedText;
          }

          console.log('[IntelligentBot] ✅ Links de pago agregados');
        }

        // Acción legacy (mantener por compatibilidad)
        if (action.type === 'generate_payment_link') {
          console.log('[IntelligentBot] 💳 Generando link de pago (legacy)...');
          
          const paymentLink = await this.generatePaymentLink({
            productId: action.product.id,
            productName: action.product.name,
            amount: action.amount,
            method: action.method,
            userId
          });

          // Reemplazar marcador o agregar link al final
          if (finalText.includes('[PAYMENT_LINK:')) {
            finalText = finalText.replace(/\[PAYMENT_LINK:[^\]]+\]/, `👉 ${paymentLink}`);
          } else {
            finalText += `\n\n💳 *Link de pago (${action.method.toUpperCase()}):*\n👉 ${paymentLink}`;
          }

          console.log('[IntelligentBot] ✅ Link generado:', paymentLink);
        }

        // Nueva acción: enviar texto simple
        if (action.type === 'send_text') {
          console.log('[IntelligentBot] 📝 Enviando texto adicional...');
          finalText += '\n\n' + action.text;
        }
      }

      // Limpiar marcadores que no se procesaron
      finalText = finalText.replace(/\[SEND_IMAGE:[^\]]+\]/g, '');
      finalText = finalText.replace(/\[PAYMENT_LINK:[^\]]+\]/g, '');
      finalText = finalText.replace(/\[SHOW_ALL_PAYMENT_METHODS\]/g, '');

      // 🔍 DEBUG: Mostrar mensaje final antes de enviar
      console.log('[DEBUG] ═══════════════════════════════════════');
      console.log('[DEBUG] MENSAJE FINAL A ENVIAR:');
      console.log('[DEBUG] Longitud:', finalText.length, 'caracteres');
      console.log('[DEBUG] Primeros 200 caracteres:', finalText.substring(0, 200));
      console.log('[DEBUG] Últimos 200 caracteres:', finalText.substring(Math.max(0, finalText.length - 200)));
      console.log('[DEBUG] ═══════════════════════════════════════');

      // Enviar respuesta principal
      await sock.sendMessage(from, { text: finalText });
      console.log('[IntelligentBot] ✅ Respuesta enviada');

      // Guardar en base de datos
      await prisma.message.create({
        data: {
          conversationId,
          content: finalText,
          direction: 'OUTGOING',
          type: 'TEXT'
        }
      });

      // Actualizar conversación
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          productId: response.context.currentProduct?.id || undefined
        }
      });

      return {
        success: true,
        confidence: response.confidence,
        context: response.context,
        actionsExecuted: response.actions.length
      };

    } catch (error) {
      console.error('[IntelligentBot] ❌ Error:', error);

      // Respuesta de fallback
      await sock.sendMessage(from, {
        text: 'Disculpa, tuve un problema procesando tu mensaje. ¿Podrías repetirlo de otra forma?'
      });

      return {
        success: false,
        error
      };
    }
  }

  /**
   * Genera links de pago dinámicos usando el generador completo
   */
  private static async generatePaymentLink(params: {
    productId: string;
    productName: string;
    amount: number;
    method: string;
    userId: string;
  }): Promise<string> {
    try {
      // Usar el generador de links completo
      const { BotPaymentLinkGenerator } = await import('./bot-payment-link-generator');
      
      const result = await BotPaymentLinkGenerator.generatePaymentLinks(
        params.productId,
        params.userId,
        1 // cantidad
      );

      if (!result.success) {
        console.log('[IntelligentBot] ⚠️ Error generando links, usando fallback');
        return this.generateFallbackLink(params);
      }

      // Retornar el link según el método solicitado
      const method = params.method.toLowerCase();
      
      if (method.includes('mercado') && result.mercadoPagoLink) {
        return result.mercadoPagoLink;
      }
      
      if (method.includes('paypal') && result.payPalLink) {
        return result.payPalLink;
      }
      
      if (method.includes('nequi') && result.nequiInfo) {
        return `Nequi: ${result.nequiInfo}`;
      }
      
      if (method.includes('daviplata') && result.daviplataInfo) {
        return `Daviplata: ${result.daviplataInfo}`;
      }

      // Si no hay link específico, retornar el mensaje completo
      return result.message;

    } catch (error) {
      console.error('[IntelligentBot] Error generando link:', error);
      return this.generateFallbackLink(params);
    }
  }

  /**
   * Genera link de fallback
   */
  private static generateFallbackLink(params: {
    productName: string;
    amount: number;
    method: string;
  }): string {
    const method = params.method.toLowerCase();
    
    // Para Nequi/Daviplata, retornar número directamente
    if (method.includes('nequi') || method.includes('daviplata')) {
      return `📱 Número: 3136174267\n💰 Monto: $${params.amount.toLocaleString('es-CO')} COP\n\n📸 Envía captura del comprobante por este chat`;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
    const queryParams = new URLSearchParams({
      product: params.productName,
      amount: params.amount.toString(),
      method
    });

    return `${baseUrl}/payment/${method}?${queryParams.toString()}`;
  }

  /**
   * Obtiene estadísticas de la conversación
   */
  static getConversationStats(chatId: string) {
    const engine = getIntelligentEngine();
    return engine.getStats(chatId);
  }

  /**
   * Obtiene el contexto actual
   */
  static getContext(chatId: string) {
    const engine = getIntelligentEngine();
    return engine.getContext(chatId);
  }

  /**
   * Limpia la memoria de una conversación
   */
  static clearMemory(chatId: string) {
    const engine = getIntelligentEngine();
    engine.clearMemory(chatId);
  }
}

/**
 * Función principal para usar en baileys-stable-service.ts
 */
export async function handleMessageWithIntelligence(params: {
  sock: WASocket;
  userId: string;
  from: string;
  messageText: string;
  conversationId: string;
  userName?: string;
}) {
  return IntelligentBaileysIntegration.handleIntelligentMessage(params);
}

