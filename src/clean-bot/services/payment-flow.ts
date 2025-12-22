/**
 * Flujo conversacional inteligente de pagos
 * Detecta intenciones, genera links y maneja el flujo completo
 */

import { db } from '@/lib/db';

export interface PaymentIntent {
  detected: boolean;
  confidence: number;
  preferredMethod?: 'mercadopago' | 'paypal' | 'any';
  action?: 'request_link' | 'change_method' | 'confirm_payment' | 'ask_methods';
}

export interface PaymentFlowResponse {
  message: string;
  hasLink: boolean;
  links?: {
    mercadopago?: string;
    paypal?: string;
  };
  options?: Array<{ id: string; text: string }>;
}

/**
 * Detecta intención de pago en el mensaje
 */
export function detectPaymentIntent(message: string): PaymentIntent {
  const text = message.toLowerCase().trim();

  // Patrones de solicitud de pago
  const requestPatterns = [
    /quiero\s+(pagar|comprar)/i,
    /env[ií]ame\s+(el\s+)?link/i,
    /c[óo]mo\s+(puedo\s+)?pagar/i,
    /pago\s+ahora/i,
    /dame\s+(el\s+)?enlace/i,
    /p[áa]same\s+(el\s+)?pago/i,
    /link\s+de\s+(compra|pago)/i,
    /finalizar\s+compra/i,
    /quiero\s+(el\s+)?link/i,
    /link\s+de\s+mercado\s*pago/i,
    /link\s+de\s+paypal/i,
    /realizar\s+(el\s+)?pago/i,
    /proceder\s+con\s+(la\s+)?compra/i,
  ];

  // Patrones de consulta de métodos
  const methodsPatterns = [
    /m[ée]todos?\s+de\s+pago/i,
    /formas?\s+de\s+pago/i,
    /c[óo]mo\s+pago/i,
    /qu[ée]\s+m[ée]todos?\s+aceptan/i,
    /aceptan\s+paypal/i,
    /aceptan\s+mercado\s*pago/i,
  ];

  // Patrones de confirmación
  const confirmPatterns = [
    /ya\s+pagu[ée]/i,
    /pago\s+realizado/i,
    /ya\s+hice\s+(el\s+)?pago/i,
    /ya\s+transfer[ií]/i,
  ];

  // Patrones de cambio de método
  const changePatterns = [
    /cambiar\s+m[ée]todo/i,
    /otro\s+m[ée]todo/i,
    /usar\s+(mercado\s*pago|paypal)/i,
    /mejor\s+(mercado\s*pago|paypal)/i,
  ];

  // Detectar solicitud de link
  if (requestPatterns.some(p => p.test(text))) {
    const preferredMethod = text.includes('paypal') ? 'paypal' :
                           text.includes('mercado') ? 'mercadopago' : 'any';
    
    return {
      detected: true,
      confidence: 0.95,
      preferredMethod,
      action: 'request_link',
    };
  }

  // Detectar consulta de métodos
  if (methodsPatterns.some(p => p.test(text))) {
    return {
      detected: true,
      confidence: 0.9,
      action: 'ask_methods',
    };
  }

  // Detectar confirmación de pago
  if (confirmPatterns.some(p => p.test(text))) {
    return {
      detected: true,
      confidence: 0.85,
      action: 'confirm_payment',
    };
  }

  // Detectar cambio de método
  if (changePatterns.some(p => p.test(text))) {
    const preferredMethod = text.includes('paypal') ? 'paypal' : 'mercadopago';
    
    return {
      detected: true,
      confidence: 0.8,
      preferredMethod,
      action: 'change_method',
    };
  }

  return { detected: false, confidence: 0 };
}

/**
 * Genera respuesta de métodos de pago disponibles
 */
export function generateMethodsResponse(): PaymentFlowResponse {
  return {
    message: `💰 *Métodos de Pago Disponibles*

Aceptamos los siguientes métodos:

💳 *MercadoPago*
   • Tarjeta de crédito/débito
   • PSE (débito bancario)
   • Efectivo (Efecty, Baloto)
   • Pago en cuotas

🌍 *PayPal*
   • Tarjeta internacional
   • Cuenta PayPal
   • Pago seguro mundial

📱 *Transferencias*
   • Nequi
   • Daviplata
   • Bancolombia

¿Con cuál método prefieres pagar? 😊`,
    hasLink: false,
    options: [
      { id: 'use_mercadopago', text: '💳 MercadoPago' },
      { id: 'use_paypal', text: '🌍 PayPal' },
      { id: 'use_transfer', text: '📱 Transferencia' },
    ],
  };
}

/**
 * Genera respuesta con links de pago
 */
export async function generatePaymentResponse(
  productId: string,
  productName: string,
  price: number,
  ownerUserId: string,
  preferredMethod: 'mercadopago' | 'paypal' | 'any' = 'any'
): Promise<PaymentFlowResponse> {
  try {
    // Importar el generador de links existente
    const { BotPaymentLinkGenerator } = await import('@/lib/bot-payment-link-generator');
    
    // Generar links
    const result = await BotPaymentLinkGenerator.generatePaymentLinks(
      productId,
      ownerUserId,
      1
    );

    if (!result.success) {
      return {
        message: `⚠️ No pude generar el link de pago automáticamente.

Por favor, contacta con nosotros para coordinar el pago de *${productName}*.

💰 Precio: ${price.toLocaleString('es-CO')} COP`,
        hasLink: false,
      };
    }

    // Si tiene preferencia de método, mostrar solo ese
    if (preferredMethod === 'mercadopago' && result.mercadoPagoLink) {
      return {
        message: `💳 *Link de Pago - MercadoPago*

Producto: *${productName}*
💰 Precio: ${price.toLocaleString('es-CO')} COP

🔗 *Link de pago:*
${result.mercadoPagoLink}

⚠️ Una vez realizado el pago, envíanos una captura o espera la confirmación automática.

¿Necesitas ayuda con el pago? 😊`,
        hasLink: true,
        links: { mercadopago: result.mercadoPagoLink },
        options: [
          { id: 'payment_done', text: '✅ Ya pagué' },
          { id: 'change_method', text: '🔄 Cambiar método' },
          { id: 'help_payment', text: '❓ Ayuda' },
        ],
      };
    }

    if (preferredMethod === 'paypal' && result.payPalLink) {
      return {
        message: `🌍 *Link de Pago - PayPal*

Producto: *${productName}*
💰 Precio: ${price.toLocaleString('es-CO')} COP

🔗 *Link de pago:*
${result.payPalLink}

⚠️ Una vez realizado el pago, envíanos una captura o espera la confirmación automática.

¿Necesitas ayuda con el pago? 😊`,
        hasLink: true,
        links: { paypal: result.payPalLink },
        options: [
          { id: 'payment_done', text: '✅ Ya pagué' },
          { id: 'change_method', text: '🔄 Cambiar método' },
          { id: 'help_payment', text: '❓ Ayuda' },
        ],
      };
    }

    // Mostrar ambos métodos
    let message = `💳 *Links de Pago Disponibles*

Producto: *${productName}*
💰 Precio: ${price.toLocaleString('es-CO')} COP

`;

    const links: any = {};

    if (result.mercadoPagoLink) {
      message += `🔗 *MercadoPago:*\n${result.mercadoPagoLink}\n\n`;
      links.mercadopago = result.mercadoPagoLink;
    }

    if (result.payPalLink) {
      message += `🔗 *PayPal:*\n${result.payPalLink}\n\n`;
      links.paypal = result.payPalLink;
    }

    message += `⚠️ Una vez realizado el pago, envíanos una captura o espera la confirmación automática.

¿Necesitas ayuda con el pago? 😊`;

    return {
      message,
      hasLink: true,
      links,
      options: [
        { id: 'payment_done', text: '✅ Ya pagué' },
        { id: 'help_payment', text: '❓ Ayuda' },
      ],
    };

  } catch (error) {
    console.error('[PaymentFlow] Error generando links:', error);
    
    return {
      message: `⚠️ Hubo un problema generando el link de pago.

Por favor, contacta con nosotros para coordinar el pago de *${productName}*.

💰 Precio: ${price.toLocaleString('es-CO')} COP`,
      hasLink: false,
    };
  }
}

/**
 * Genera respuesta de confirmación de pago
 */
export function generatePaymentConfirmation(productName: string): PaymentFlowResponse {
  return {
    message: `✅ *¡Pago Confirmado!*

Gracias por tu compra de *${productName}*.

📧 Te enviaremos:
   • Comprobante de pago
   • Instrucciones de acceso/entrega
   • Factura (si la solicitaste)

⏱️ Tiempo estimado: 5-30 minutos

Si tienes alguna duda, estamos aquí para ayudarte 😊`,
    hasLink: false,
    options: [
      { id: 'request_invoice', text: '📄 Solicitar factura' },
      { id: 'view_products', text: '🛒 Ver más productos' },
    ],
  };
}

/**
 * Genera respuesta cuando no hay producto en contexto
 */
export function generateNoProductResponse(): PaymentFlowResponse {
  return {
    message: `🤔 Para generar el link de pago, necesito saber qué producto te interesa.

¿Podrías decirme cuál producto quieres comprar?

O puedes escribir:
• "Ver productos"
• "Cursos"
• "Laptops"
• "Megapacks"`,
    hasLink: false,
  };
}
