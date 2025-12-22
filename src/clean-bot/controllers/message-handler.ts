/**
 * Controlador principal del bot limpio
 * Flujo simple y directo
 */

import { getContext, updateContext } from '../services/context';
import { searchProduct, getProductById } from '../services/products';
import { generatePaymentLinks } from '../services/payments';
import { detectIntent, generateResponse } from '../services/ai';
import { BotResponse } from '../types';
import {
  detectPaymentIntent,
  generatePaymentResponse,
  generateMethodsResponse,
  generatePaymentConfirmation,
  generateNoProductResponse,
} from '../services/payment-flow';

export async function handleMessage(
  userId: string,
  message: string,
  ownerUserId: string
): Promise<BotResponse> {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('📥 MENSAJE RECIBIDO');
    console.log('='.repeat(80));
    console.log('👤 Usuario:', userId);
    console.log('💬 Mensaje:', message);
    console.log('='.repeat(80) + '\n');

    // 1. Obtener contexto
    const context = await getContext(userId);
    console.log('[CleanBot] 📋 Contexto:', context);

    // 2. Detectar intención de pago PRIMERO (más específico)
    const paymentIntent = detectPaymentIntent(message);
    console.log('[CleanBot] 💳 Intención de pago:', paymentIntent);

    // 3. Detectar intención general
    const detected = await detectIntent(message);
    console.log('[CleanBot] 🎯 Intención general:', detected.intent);

    // 4. Buscar producto si es necesario
    let product = null;
    
    if (detected.intent === 'producto' || detected.intent === 'precio' || detected.intent === 'disponibilidad') {
      // Buscar en el mensaje
      product = await searchProduct(message);
      
      // Si no encuentra, usar el del contexto
      if (!product && context.productId) {
        product = await getProductById(context.productId);
      }
    } else if (detected.intent === 'pago' || paymentIntent.detected) {
      // Para pago, usar producto del contexto
      if (context.productId) {
        product = await getProductById(context.productId);
      }
    }

    // 5. Actualizar contexto si encontró producto
    if (product) {
      await updateContext(userId, {
        productId: product.id,
        productName: product.name,
        lastIntent: paymentIntent.detected ? 'pago' : detected.intent,
        lastMessage: message,
      });
      console.log('[CleanBot] ✅ Producto guardado:', product.name);
    }

    // 6. FLUJO INTELIGENTE DE PAGOS
    if (paymentIntent.detected) {
      console.log('[CleanBot] 💳 Flujo de pago inteligente activado');
      
      // Acción: Consultar métodos de pago
      if (paymentIntent.action === 'ask_methods') {
        const response = generateMethodsResponse();
        
        console.log('\n' + '='.repeat(80));
        console.log('📤 RESPUESTA DEL BOT (MÉTODOS DE PAGO)');
        console.log('='.repeat(80));
        console.log(response.message);
        console.log('='.repeat(80) + '\n');
        
        return {
          text: response.message,
          productId: product?.id,
        };
      }
      
      // Acción: Confirmar pago realizado
      if (paymentIntent.action === 'confirm_payment' && product) {
        const response = generatePaymentConfirmation(product.name);
        
        console.log('\n' + '='.repeat(80));
        console.log('📤 RESPUESTA DEL BOT (CONFIRMACIÓN)');
        console.log('='.repeat(80));
        console.log(response.message);
        console.log('='.repeat(80) + '\n');
        
        return {
          text: response.message,
          productId: product.id,
        };
      }
      
      // Acción: Generar link de pago
      if ((paymentIntent.action === 'request_link' || paymentIntent.action === 'change_method') && product) {
        console.log('[CleanBot] 🔗 Generando links de pago...');
        
        const response = await generatePaymentResponse(
          product.id,
          product.name,
          product.price,
          ownerUserId,
          paymentIntent.preferredMethod
        );
        
        console.log('\n' + '='.repeat(80));
        console.log('📤 RESPUESTA DEL BOT (LINKS DE PAGO)');
        console.log('='.repeat(80));
        console.log(response.message);
        console.log('='.repeat(80) + '\n');
        
        return {
          text: response.message,
          productId: product.id,
        };
      }
      
      // Si no hay producto en contexto
      if (!product) {
        const response = generateNoProductResponse();
        
        console.log('\n' + '='.repeat(80));
        console.log('📤 RESPUESTA DEL BOT (SIN PRODUCTO)');
        console.log('='.repeat(80));
        console.log(response.message);
        console.log('='.repeat(80) + '\n');
        
        return {
          text: response.message,
        };
      }
    }

    // 7. Generar respuesta general (si no fue pago)
    const responseText = await generateResponse({
      intent: detected.intent,
      product,
    });

    console.log('\n' + '='.repeat(80));
    console.log('📤 RESPUESTA DEL BOT');
    console.log('='.repeat(80));
    console.log(responseText);
    console.log('='.repeat(80) + '\n');

    return {
      text: responseText,
      productId: product?.id,
    };

  } catch (error) {
    console.error('[CleanBot] ❌ Error:', error);
    return {
      text: 'Disculpa, tuve un problema. ¿Podrías intentar de nuevo? 🙏',
    };
  }
}
