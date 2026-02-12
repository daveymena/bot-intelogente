// src/lib/bot/core/intentClassifier.ts
import dotenv from 'dotenv';
dotenv.config();
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

export interface IntentResult {
  intent: string;
  confidence: number;
  entities?: {
    product?: string;
    category?: string;
    price?: string;
    quantity?: string;
  };
}

/**
 * Clasificador de Intenciones usando Groq
 * Detecta qué quiere hacer el cliente
 */
export async function classifyIntent(message: string, context?: string): Promise<IntentResult> {
  try {
    const systemPrompt = `Eres un clasificador de intenciones para un bot de ventas de WhatsApp.

Analiza el mensaje del cliente y clasifícalo en UNA de estas intenciones:

INTENCIONES DISPONIBLES:
- saludo: Cliente saluda o inicia conversación
- consulta_precio: Pregunta por precio de un producto
- consulta_disponibilidad: Pregunta si hay stock
- comparacion: Quiere comparar productos
- compra: Quiere comprar o pagar
- soporte: Tiene un problema o reclamo
- informacion_envio: Pregunta por envío o entrega
- informacion_pago: Pregunta por métodos de pago
- despedida: Se despide o termina conversación
- otro: No encaja en ninguna categoría

EXTRAE TAMBIÉN:
- product: Nombre del producto mencionado
- category: Categoría del producto (laptop, celular, tablet, etc.)
- price: Precio mencionado
- quantity: Cantidad mencionada

Responde SOLO con un JSON válido en este formato:
{
  "intent": "nombre_de_la_intencion",
  "confidence": 0.95,
  "entities": {
    "product": "nombre del producto",
    "category": "categoria"
  }
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Mensaje: "${message}"\n${context ? `Contexto: ${context}` : ''}` }
      ],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 150,
      temperature: 0.3, // Baja temperatura para respuestas más consistentes
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const result = JSON.parse(responseText);

    return {
      intent: result.intent || 'otro',
      confidence: result.confidence || 0.5,
      entities: result.entities || {}
    };

  } catch (error) {
    console.error('Error clasificando intención:', error);
    
    // Fallback: clasificación básica por palabras clave
    return classifyIntentFallback(message);
  }
}

/**
 * Clasificación de respaldo usando palabras clave
 */
function classifyIntentFallback(message: string): IntentResult {
  const lowerMessage = message.toLowerCase();
  
  // Saludos
  if (/^(hola|buenos|buenas|hey|hi|saludos)/i.test(message)) {
    return { intent: 'saludo', confidence: 0.9 };
  }
  
  // Precio
  if (/(cuánto|precio|cuesta|vale|valor|cuanto)/i.test(message)) {
    return { intent: 'consulta_precio', confidence: 0.85 };
  }
  
  // Compra
  if (/(comprar|pagar|adquirir|llevar|quiero)/i.test(message)) {
    return { intent: 'compra', confidence: 0.8 };
  }
  
  // Disponibilidad
  if (/(hay|tiene|disponible|stock|quedan)/i.test(message)) {
    return { intent: 'consulta_disponibilidad', confidence: 0.8 };
  }
  
  // Soporte
  if (/(problema|reclamo|ayuda|error|falla|defecto)/i.test(message)) {
    return { intent: 'soporte', confidence: 0.85 };
  }
  
  // Envío
  if (/(envío|envio|entrega|delivery|domicilio)/i.test(message)) {
    return { intent: 'informacion_envio', confidence: 0.85 };
  }
  
  // Pago
  if (/(pago|tarjeta|efectivo|transferencia|nequi|daviplata)/i.test(message)) {
    return { intent: 'informacion_pago', confidence: 0.85 };
  }
  
  // Despedida
  if (/(gracias|chao|adiós|adios|bye|hasta luego)/i.test(message)) {
    return { intent: 'despedida', confidence: 0.9 };
  }
  
  return { intent: 'otro', confidence: 0.5 };
}

/**
 * Extraer entidades del mensaje (productos, categorías, etc.)
 */
export function extractEntities(message: string): IntentResult['entities'] {
  const entities: IntentResult['entities'] = {};
  
  // Categorías comunes
  const categories = {
    'laptop': /laptop|portátil|portatil|notebook/i,
    'celular': /celular|teléfono|telefono|móvil|movil|smartphone/i,
    'tablet': /tablet|ipad/i,
    'audífonos': /audífono|audifono|auricular|headphone/i,
    'mouse': /mouse|ratón|raton/i,
    'teclado': /teclado|keyboard/i,
    'monitor': /monitor|pantalla|display/i
  };
  
  for (const [category, regex] of Object.entries(categories)) {
    if (regex.test(message)) {
      entities.category = category;
      break;
    }
  }
  
  // Extraer precio si se menciona
  const priceMatch = message.match(/\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/);
  if (priceMatch) {
    entities.price = priceMatch[1];
  }
  
  // Extraer cantidad
  const quantityMatch = message.match(/(\d+)\s*(unidad|unidades|pieza|piezas)?/i);
  if (quantityMatch) {
    entities.quantity = quantityMatch[1];
  }
  
  return entities;
}
