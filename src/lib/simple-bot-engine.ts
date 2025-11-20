/**
 * 🤖 MOTOR DE BOT SIMPLE Y FUNCIONAL
 * Sistema completamente nuevo que reemplaza toda la complejidad anterior
 * 
 * CARACTERÍSTICAS:
 * - Memoria simple y confiable
 * - Respuestas completas siempre
 * - Sin dependencias complejas
 * - Fácil de entender y mantener
 */

import { db } from './db'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

// ============================================
// 1. MEMORIA SIMPLE (En memoria + Base de datos)
// ============================================

interface SimpleMemory {
  currentProduct: {
    id: number
    name: string
    price: number
    description: string
    category: string
  } | null
  conversationStage: 'greeting' | 'browsing' | 'interested' | 'payment'
  lastMessages: Array<{ role: 'user' | 'assistant', content: string }>
}

const memoryStore = new Map<string, SimpleMemory>()

class SimpleMemoryManager {
  static getMemory(chatId: string): SimpleMemory {
    if (!memoryStore.has(chatId)) {
      memoryStore.set(chatId, {
        currentProduct: null,
        conversationStage: 'greeting',
        lastMessages: []
      })
    }
    return memoryStore.get(chatId)!
  }

  static setProduct(chatId: string, product: any) {
    const memory = this.getMemory(chatId)
    memory.currentProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category
    }
    memory.conversationStage = 'interested'
    console.log(`[SimpleBot] 💾 Producto guardado: ${product.name}`)
  }

  static addMessage(chatId: string, role: 'user' | 'assistant', content: string) {
    const memory = this.getMemory(chatId)
    memory.lastMessages.push({ role, content })
    // Mantener solo últimos 6 mensajes (3 intercambios)
    if (memory.lastMessages.length > 6) {
      memory.lastMessages = memory.lastMessages.slice(-6)
    }
  }

  static clearProduct(chatId: string) {
    const memory = this.getMemory(chatId)
    memory.currentProduct = null
    memory.conversationStage = 'browsing'
  }
}

// ============================================
// 2. BÚSQUEDA SIMPLE DE PRODUCTOS
// ============================================

class SimpleProductSearch {
  static async findProduct(query: string, userId: string): Promise<any | null> {
    const lowerQuery = query.toLowerCase()
    
    console.log(`[SimpleBot] 🔍 Buscando: "${query}"`)

    // Buscar en base de datos
    const products = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5
    })

    if (products.length === 0) {
      console.log(`[SimpleBot] ❌ No se encontraron productos`)
      return null
    }

    // Scoring simple
    const scored = products.map(p => {
      let score = 0
      const pName = p.name.toLowerCase()
      const pDesc = (p.description || '').toLowerCase()
      
      // Palabras clave en el query
      const keywords = lowerQuery.split(' ').filter(w => w.length > 2)
      
      keywords.forEach(keyword => {
        if (pName.includes(keyword)) score += 10
        if (pDesc.includes(keyword)) score += 5
      })
      
      return { product: p, score }
    })

    // Ordenar por score
    scored.sort((a, b) => b.score - a.score)
    
    const bestMatch = scored[0]
    console.log(`[SimpleBot] ✅ Producto encontrado: ${bestMatch.product.name} (score: ${bestMatch.score})`)
    
    return bestMatch.product
  }
}

// ============================================
// 3. GENERADOR DE RESPUESTAS COMPLETAS
// ============================================

class SimpleResponseGenerator {
  /**
   * Generar respuesta COMPLETA para un producto
   */
  static generateProductResponse(product: any, intent: string): string {
    const price = product.price.toLocaleString('es-CO')
    const isDigital = product.category === 'DIGITAL'
    
    // Extraer beneficios de la descripción
    const benefits = this.extractBenefits(product.description)
    
    let response = `🎯 *${product.name}*\n\n`
    
    // Descripción breve (primeras 2 líneas)
    const descLines = product.description.split('\n').filter((l: string) => l.trim())
    if (descLines.length > 0) {
      response += `${descLines[0]}\n\n`
    }
    
    // Beneficios
    if (benefits.length > 0) {
      benefits.slice(0, 4).forEach((benefit: string) => {
        response += `✅ ${benefit}\n`
      })
      response += '\n'
    }
    
    // Precio
    response += `💰 *Precio:* $${price} COP\n\n`
    
    // Disponibilidad
    if (product.stock > 0) {
      response += `📦 *Disponible:* ${product.stock} unidades\n\n`
    } else if (isDigital) {
      response += `📦 *Disponible:* Acceso inmediato\n\n`
    }
    
    // Call to action según intención
    if (intent === 'price') {
      response += `¿Te gustaría comprarlo? 😊`
    } else if (intent === 'buy') {
      response += `¿Deseas que te envíe las opciones de pago? 💳`
    } else {
      response += `¿Quieres más información o te gustaría comprarlo? 😊`
    }
    
    return response
  }

  /**
   * Extraer beneficios de la descripción
   */
  private static extractBenefits(description: string): string[] {
    const benefits: string[] = []
    
    // Buscar líneas que empiecen con emojis o viñetas
    const lines = description.split('\n')
    
    lines.forEach(line => {
      const trimmed = line.trim()
      // Si empieza con emoji o viñeta
      if (/^[✅✓•▪️▫️◾◽⬛⬜🔹🔸▪▫]/.test(trimmed)) {
        const benefit = trimmed.replace(/^[✅✓•▪️▫️◾◽⬛⬜🔹🔸▪▫]\s*/, '')
        if (benefit.length > 5 && benefit.length < 100) {
          benefits.push(benefit)
        }
      }
    })
    
    return benefits
  }

  /**
   * Generar respuesta de saludo
   */
  static generateGreeting(): string {
    return `¡Hola! 👋 Bienvenido a *Tecnovariedades D&S*

Puedo ayudarte con:
• 💻 Laptops y tecnología
• 🎹 Cursos digitales
• 📚 Megapacks de contenido
• 🏍️ Motos

¿Qué te interesa? 😊`
  }

  /**
   * Generar respuesta cuando no encuentra producto
   */
  static generateNotFound(): string {
    return `Lo siento, no encontré ese producto 😔

Puedo ayudarte con:
• 💻 Laptops ASUS, HP, Lenovo
• 🎹 Curso de Piano Completo
• 📚 Megapacks digitales
• 🏍️ Moto Bajaj Pulsar

¿Qué te gustaría ver?`
  }
}

// ============================================
// 4. DETECTOR DE INTENCIONES SIMPLE
// ============================================

class SimpleIntentDetector {
  static detect(message: string, memory: SimpleMemory): {
    intent: string
    confidence: number
  } {
    const lower = message.toLowerCase()
    
    // 1. Saludo
    if (/^(hola|hi|hey|buenos|buenas|saludos)/i.test(message)) {
      return { intent: 'greeting', confidence: 0.95 }
    }
    
    // 2. Solicitud de pago (si hay producto en memoria)
    if (memory.currentProduct) {
      if (/(link|enlace|pagar|comprar|pago|método|metodo)/i.test(lower)) {
        return { intent: 'payment', confidence: 0.9 }
      }
      
      if (/(precio|cuesta|cuanto|cuánto|vale)/i.test(lower)) {
        return { intent: 'price', confidence: 0.9 }
      }
      
      if (/(foto|imagen|ver)/i.test(lower)) {
        return { intent: 'photo', confidence: 0.9 }
      }
    }
    
    // 3. Búsqueda de producto
    if (/(curso|laptop|moto|mega|pack|computador|portatil)/i.test(lower)) {
      return { intent: 'search', confidence: 0.85 }
    }
    
    // 4. Interés general
    if (/(interesa|quiero|necesito|busco|info|información)/i.test(lower)) {
      return { intent: 'search', confidence: 0.8 }
    }
    
    // 5. Default: búsqueda
    return { intent: 'search', confidence: 0.6 }
  }
}

// ============================================
// 5. MOTOR PRINCIPAL
// ============================================

export class SimpleBotEngine {
  /**
   * Procesar mensaje y generar respuesta
   */
  static async processMessage(
    chatId: string,
    userId: string,
    message: string
  ): Promise<string> {
    try {
      console.log(`[SimpleBot] 📥 Mensaje: "${message}"`)
      
      // 1. Obtener memoria
      const memory = SimpleMemoryManager.getMemory(chatId)
      SimpleMemoryManager.addMessage(chatId, 'user', message)
      
      // 2. Detectar intención
      const { intent, confidence } = SimpleIntentDetector.detect(message, memory)
      console.log(`[SimpleBot] 🎯 Intención: ${intent} (${Math.round(confidence * 100)}%)`)
      
      let response: string
      
      // 3. Procesar según intención
      switch (intent) {
        case 'greeting':
          response = SimpleResponseGenerator.generateGreeting()
          break
          
        case 'payment':
          if (memory.currentProduct) {
            response = await this.handlePaymentRequest(memory.currentProduct, userId)
          } else {
            response = `Para ayudarte con el pago, ¿qué producto te interesa? 😊`
          }
          break
          
        case 'price':
          if (memory.currentProduct) {
            const price = memory.currentProduct.price.toLocaleString('es-CO')
            response = `El precio de *${memory.currentProduct.name}* es $${price} COP 💰\n\n¿Deseas comprarlo?`
          } else {
            response = `¿De qué producto te gustaría saber el precio? 😊`
          }
          break
          
        case 'search':
          const product = await SimpleProductSearch.findProduct(message, userId)
          
          if (product) {
            // Guardar en memoria
            SimpleMemoryManager.setProduct(chatId, product)
            
            // Generar respuesta completa
            response = SimpleResponseGenerator.generateProductResponse(product, intent)
          } else {
            response = SimpleResponseGenerator.generateNotFound()
          }
          break
          
        default:
          // Si hay producto en contexto, dar info
          if (memory.currentProduct) {
            response = SimpleResponseGenerator.generateProductResponse(
              memory.currentProduct,
              'info'
            )
          } else {
            response = SimpleResponseGenerator.generateGreeting()
          }
      }
      
      // 4. Guardar respuesta en memoria
      SimpleMemoryManager.addMessage(chatId, 'assistant', response)
      
      console.log(`[SimpleBot] ✅ Respuesta generada (${response.length} caracteres)`)
      
      return response
      
    } catch (error) {
      console.error('[SimpleBot] ❌ Error:', error)
      return `Disculpa, tuve un problema. ¿Puedes repetir tu pregunta? 😊`
    }
  }

  /**
   * Manejar solicitud de pago
   */
  private static async handlePaymentRequest(product: any, userId: string): Promise<string> {
    const price = product.price.toLocaleString('es-CO')
    const isDigital = product.category === 'DIGITAL'
    
    let response = `💳 *Opciones de pago para:*\n${product.name}\n\n`
    response += `💰 Total: $${price} COP\n\n`
    
    if (isDigital) {
      response += `*Métodos disponibles:*\n\n`
      response += `1️⃣ *Hotmart* (Pago directo)\n`
      response += `👉 Acceso inmediato\n\n`
      response += `2️⃣ *MercadoPago*\n`
      response += `👉 Tarjetas, PSE, efectivo\n\n`
      response += `3️⃣ *Nequi/Daviplata*\n`
      response += `📱 313 617 4267\n\n`
    } else {
      response += `*Métodos disponibles:*\n\n`
      response += `1️⃣ *Efectivo en tienda*\n`
      response += `📍 Centro Comercial El Diamante 2, Cali\n\n`
      response += `2️⃣ *Transferencia*\n`
      response += `📱 Nequi/Daviplata: 313 617 4267\n\n`
      response += `3️⃣ *Tarjeta*\n`
      response += `💳 En tienda o por MercadoPago\n\n`
    }
    
    response += `📞 *WhatsApp:* +57 304 274 8687\n\n`
    response += `¿Con cuál método prefieres pagar? 😊`
    
    return response
  }

  /**
   * Limpiar memoria de un chat
   */
  static clearMemory(chatId: string) {
    memoryStore.delete(chatId)
    console.log(`[SimpleBot] 🧹 Memoria limpiada para ${chatId}`)
  }

  /**
   * Obtener estado de la memoria (para debugging)
   */
  static getMemoryState(chatId: string) {
    return SimpleMemoryManager.getMemory(chatId)
  }
}
