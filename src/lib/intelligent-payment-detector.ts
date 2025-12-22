/**
 * 🧠 DETECTOR INTELIGENTE DE SOLICITUDES DE PAGO
 * 
 * Usa IA para entender la intención del cliente en lugar de solo buscar palabras clave
 */

import Groq from 'groq-sdk';

export interface PaymentIntentResult {
  isPaymentRequest: boolean;
  confidence: number;
  reasoning: string;
  suggestedAction: 'generate_links' | 'ask_product' | 'none';
}

export class IntelligentPaymentDetector {
  /**
   * Detectar si el cliente está solicitando información de pago usando IA
   */
  static async detectPaymentIntent(
    message: string,
    conversationContext?: string
  ): Promise<PaymentIntentResult> {
    try {
      // Inicializar Groq solo cuando se necesita
      const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });

      const prompt = `Eres un asistente experto en detectar intenciones de compra en conversaciones de ventas.

MENSAJE DEL CLIENTE:
"${message}"

${conversationContext ? `CONTEXTO DE LA CONVERSACIÓN:\n${conversationContext}\n` : ''}

TAREA:
Analiza si el cliente está solicitando información sobre cómo pagar o comprar.

CONSIDERA COMO SOLICITUD DE PAGO:
- Pedir enlaces/links de pago
- Preguntar por métodos de pago
- Preguntar cómo pagar/comprar
- Expresar intención de comprar
- Pedir información de transferencia/consignación
- Preguntar por tarjetas, Nequi, Daviplata, PayPal, MercadoPago
- Cualquier variación de "envíame el link", "dame el enlace", etc.

NO CONSIDERES COMO SOLICITUD DE PAGO:
- Saludos generales
- Preguntas sobre productos
- Solicitudes de información técnica
- Preguntas sobre disponibilidad (a menos que mencione pago)

RESPONDE EN FORMATO JSON:
{
  "isPaymentRequest": true/false,
  "confidence": 0.0-1.0,
  "reasoning": "breve explicación de tu análisis",
  "suggestedAction": "generate_links" | "ask_product" | "none"
}

EJEMPLOS:

Mensaje: "Envíame el link"
Respuesta: {"isPaymentRequest": true, "confidence": 0.95, "reasoning": "Cliente solicita explícitamente un enlace, probablemente de pago", "suggestedAction": "generate_links"}

Mensaje: "Cómo puedo pagar?"
Respuesta: {"isPaymentRequest": true, "confidence": 0.98, "reasoning": "Pregunta directa sobre proceso de pago", "suggestedAction": "generate_links"}

Mensaje: "Hola, buenos días"
Respuesta: {"isPaymentRequest": false, "confidence": 0.95, "reasoning": "Es solo un saludo, no hay intención de pago", "suggestedAction": "none"}

Mensaje: "Está disponible?"
Respuesta: {"isPaymentRequest": false, "confidence": 0.85, "reasoning": "Pregunta sobre disponibilidad, no sobre pago", "suggestedAction": "none"}

Mensaje: "Lo quiero"
Respuesta: {"isPaymentRequest": true, "confidence": 0.75, "reasoning": "Expresa intención de compra, aunque no menciona pago explícitamente", "suggestedAction": "generate_links"}

Ahora analiza el mensaje del cliente y responde SOLO con el JSON:`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en análisis de intenciones de compra. Respondes SOLO en formato JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile', // Modelo actualizado
        temperature: 0.1, // Baja temperatura para respuestas consistentes
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Extraer JSON de la respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('[PaymentDetector] ⚠️ No se pudo extraer JSON de la respuesta');
        return this.fallbackDetection(message);
      }

      const result = JSON.parse(jsonMatch[0]) as PaymentIntentResult;
      
      console.log(`[PaymentDetector] 🧠 Análisis IA:`);
      console.log(`   Solicitud de pago: ${result.isPaymentRequest ? 'SÍ' : 'NO'}`);
      console.log(`   Confianza: ${(result.confidence * 100).toFixed(0)}%`);
      console.log(`   Razonamiento: ${result.reasoning}`);
      console.log(`   Acción sugerida: ${result.suggestedAction}`);

      return result;

    } catch (error) {
      console.error('[PaymentDetector] ❌ Error en detección IA:', error);
      return this.fallbackDetection(message);
    }
  }

  /**
   * Detección de respaldo usando patrones (fallback)
   */
  private static fallbackDetection(message: string): PaymentIntentResult {
    const normalized = message.toLowerCase().trim();

    // Patrones de alta confianza
    const highConfidencePatterns = [
      /\b(link|enlace|url)\s+(de\s+)?(pago|compra)/i,
      /\b(cómo|como)\s+(pago|compro|puedo\s+pagar)/i,
      /\b(métodos?|metodos?|formas?)\s+(de\s+)?pago/i,
      /\b(quiero|deseo)\s+(pagar|comprar)/i,
    ];

    // Patrones de media confianza
    const mediumConfidencePatterns = [
      /\b(envía|envia|enviame|envíame|dame|pasa|manda)\s+(el\s+)?(link|enlace)/i,
      /\b(mercadopago|paypal|nequi|daviplata|pse)/i,
      /\b(tarjeta|transferencia|consignación)/i,
      /\b(lo|la)\s+(quiero|compro|llevo)/i,
      /\b(me\s+interesa|estoy\s+interesado)/i,
    ];

    if (highConfidencePatterns.some(p => p.test(normalized))) {
      return {
        isPaymentRequest: true,
        confidence: 0.9,
        reasoning: 'Patrón de alta confianza detectado (fallback)',
        suggestedAction: 'generate_links'
      };
    }

    if (mediumConfidencePatterns.some(p => p.test(normalized))) {
      return {
        isPaymentRequest: true,
        confidence: 0.7,
        reasoning: 'Patrón de media confianza detectado (fallback)',
        suggestedAction: 'generate_links'
      };
    }

    return {
      isPaymentRequest: false,
      confidence: 0.8,
      reasoning: 'No se detectaron patrones de solicitud de pago (fallback)',
      suggestedAction: 'none'
    };
  }

  /**
   * Versión rápida que usa solo patrones (para casos simples)
   */
  static quickDetect(message: string): boolean {
    const normalized = message.toLowerCase().trim();

    // 🚨 DETECTAR PREGUNTAS (NO son solicitudes de pago)
    const questionPatterns = [
      // Preguntas directas sobre métodos
      /\b(cuáles?|cuales?|qué|que)\s+(son\s+)?(los\s+|las\s+)?(métodos?|metodos?|formas?|opciones?)\s+(de\s+)?pago/i,
      /\b(tienes?|tienen?|hay|existe[n]?)\s+(métodos?|metodos?|formas?|opciones?)\s+(de\s+)?pago/i,
      /\b(cómo|como)\s+(puedo|se\s+puede|debo)\s+pagar/i,
      /\b(acepta[ns]?)\s+(qué|que)\s+(métodos?|metodos?|formas?)/i,
      
      // Variaciones comunes
      /\b(cuáles?|cuales?)\s+(métodos?|metodos?)\s+(tienes?|tienen?|hay)/i,
      /\b(qué|que)\s+(formas?|opciones?)\s+(de\s+)?pago\s+(tienes?|tienen?|hay)/i,
      /\b(con\s+)?(qué|que)\s+(puedo|se\s+puede)\s+pagar/i,
      /\b(me\s+)?(dices?|cuentas?|explicas?)\s+(los\s+|las\s+)?(métodos?|formas?)\s+(de\s+)?pago/i,
      
      // Preguntas informales
      /\b(y\s+)?(cómo|como)\s+(es\s+)?(el\s+)?pago/i,
      /\b(info|información|detalles?)\s+(de|sobre)\s+(los\s+)?(métodos?|formas?)\s+(de\s+)?pago/i,
      /\b(cuéntame|dime|explícame)\s+(sobre|de|los)\s+(métodos?|formas?)\s+(de\s+)?pago/i,
      
      // Preguntas con "puedo"
      /\b(puedo|podría)\s+(pagar|hacer\s+el\s+pago)\s+(con|por|mediante)/i,
      /\b(se\s+puede)\s+pagar\s+(con|por|mediante)/i,
    ];

    // Si es una PREGUNTA, NO es solicitud de pago
    if (questionPatterns.some(pattern => pattern.test(normalized))) {
      console.log('[PaymentDetector] ❓ Pregunta sobre métodos detectada - NO es solicitud de pago');
      return false;
    }

    // Patrones de SOLICITUD de pago (quiere pagar YA)
    const quickPatterns = [
      // Links de pago
      /\b(link|enlace|url)\s+(de\s+)?(pago|compra|mercado|paypal)/i,
      /\b(link|enlace|url)\b/i, // Cualquier mención de link (muy probable que sea de pago)
      
      // Solicitudes directas
      /\b(envía|envia|enviame|envíame|dame|pasa|manda|mandame)\s+(el\s+|la\s+)?(link|enlace)/i,
      /\b(quiero|deseo|voy\s+a|necesito)\s+(pagar|comprar|el\s+link|el\s+enlace)/i,
      /\b(proceder|continuar)\s+(con\s+)?(el\s+)?pago/i,
      /^(pagar|comprar|adquirir)\s/i,
      
      // Métodos específicos (cuando menciona método = quiere pagar)
      /\b(mercado\s*pago|mercadopago|paypal|nequi|daviplata|pse)\b/i,
      /\b(por|con|mediante)\s+(mercado|paypal|nequi|daviplata|pse)/i,
      
      // Frases de compra
      /\b(lo\s+)?(quiero|compro|llevo|adquiero)\b/i,
      /\b(estoy\s+)?(listo|lista)\s+(para\s+)?(pagar|comprar)/i,
      /\b(hacer|realizar)\s+(el\s+)?pago/i,
      /\b(pagar|comprar)\s+(por|con|mediante)/i,
    ];

    const detected = quickPatterns.some(pattern => pattern.test(normalized));
    
    if (detected) {
      console.log('[PaymentDetector] ✅ Solicitud de pago detectada con quickDetect');
    }
    
    return detected;
  }
}
