/**
 * Servicio de IA
 * Detección de intención simple y generación de respuestas
 */

import Groq from 'groq-sdk';
import { DetectedIntent, Product } from '../types';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function detectIntent(message: string): Promise<DetectedIntent> {
  const msgLower = message.toLowerCase();

  // Detección local rápida (sin IA)
  if (/^(hola|hey|buenos|buenas|saludos)/i.test(msgLower)) {
    return { intent: 'saludo', confidence: 1.0 };
  }

  if (/^(chao|adiós|adios|hasta luego|bye)/i.test(msgLower)) {
    return { intent: 'despedida', confidence: 1.0 };
  }

  if (/(quiero|deseo|me gustaría|quisiera).*(pagar|comprar|adquirir)|link.*pago|método.*pago/i.test(msgLower)) {
    return { intent: 'pago', confidence: 1.0 };
  }

  if (/(precio|cuesta|cuánto|cuanto|valor)/i.test(msgLower)) {
    return { intent: 'precio', confidence: 0.8 };
  }

  if (/(disponible|stock|hay|tienen|tienes)/i.test(msgLower)) {
    return { intent: 'disponibilidad', confidence: 0.8 };
  }

  // Si menciona producto, es búsqueda de producto
  if (/(curso|laptop|moto|megapack|computador|portátil)/i.test(msgLower)) {
    return { intent: 'producto', confidence: 0.7 };
  }

  return { intent: 'otro', confidence: 0.5 };
}

export async function generateResponse(params: {
  intent: string;
  product?: Product | null;
  customerName?: string;
}): Promise<string> {
  const { intent, product } = params;

  // Respuestas directas sin IA
  if (intent === 'saludo') {
    return '👋 ¡Hola! Bienvenido a Tecnovariedades D&S\n\n¿En qué puedo ayudarte? 😊';
  }

  if (intent === 'despedida') {
    return '¡Hasta pronto! Estoy aquí cuando me necesites 👋';
  }

  if (intent === 'pago' && !product) {
    return '¿Qué producto quieres comprar? 🤔';
  }

  if (intent === 'producto' && product) {
    let response = `✅ *${product.name}*\n\n`;
    
    if (product.description) {
      // Limitar descripción a 300 caracteres
      const desc = product.description.substring(0, 300);
      response += `📋 ${desc}${product.description.length > 300 ? '...' : ''}\n\n`;
    }
    
    response += `💰 *Precio:* ${product.price.toLocaleString('es-CO')} COP\n`;
    response += `📲 *Entrega:* ${product.category === 'DIGITAL' ? 'Digital inmediata' : 'Disponible'}\n\n`;
    response += `¿Quieres comprarlo? 🔗`;
    
    return response;
  }

  if (intent === 'precio' && product) {
    return `💰 *${product.name}*\n\nPrecio: ${product.price.toLocaleString('es-CO')} COP\n\n¿Te interesa? 😊`;
  }

  if (intent === 'disponibilidad' && product) {
    const disponible = product.stock && product.stock > 0 ? 'Sí, disponible' : 'Disponible';
    return `✅ *${product.name}*\n\n${disponible} ✓\n\n¿Quieres comprarlo? 🔗`;
  }

  // Fallback genérico
  return '¿En qué puedo ayudarte? Puedo mostrarte productos, precios o generar links de pago 😊';
}
