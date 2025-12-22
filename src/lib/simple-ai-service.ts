/**
 * SIMPLE AI SERVICE - Sistema simplificado que SÍ FUNCIONA
 * 
 * Filosofía: MENOS ES MÁS
 * - 1 sistema de memoria (no 4)
 * - 1 búsqueda de productos (no 5)
 * - 1 generador de respuestas (no 10)
 * - Prompts cortos (500 tokens, no 6000)
 * - Lógica lineal (no anidada)
 */

import Groq from 'groq-sdk'
import { db } from './db'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

// ============================================
// MEMORIA SIMPLE (UN SOLO SISTEMA)
// ============================================
class SimpleMemory {
  private static memory = new Map<string, any>()

  static set(key: string, data: any) {
    this.memory.set(key, {
      ...data,
      timestamp: Date.now()
    })
    console.log(`[MEMORIA] Guardado: ${key}`, data)
  }

  static get(key: string) {
    const data = this.memory.get(key)
    if (data) {
      // Limpiar memoria después de 30 minutos
      const age = Date.now() - data.timestamp
      if (age > 30 * 60 * 1000) {
        this.memory.delete(key)
        return null
      }
    }
    return data
  }

  static clear(key: string) {
    this.memory.delete(key)
  }
}

// ============================================
// SERVICIO PRINCIPAL
// ============================================
export class SimpleAIService {
  
  /**
   * MÉTODO PRINCIPAL - Generar respuesta
   */
  static async generateResponse(
    userId: string,
    customerPhone: string,
    message: string
  ): Promise<{ message: string; confidence: number; intent: string }> {
    try {
      console.log(`\n[BOT] ========================================`)
      console.log(`[BOT] Cliente: ${customerPhone}`)
      console.log(`[BOT] Mensaje: "${message}"`)
      console.log(`[BOT] ========================================\n`)

      const memoryKey = `${userId}:${customerPhone}`

      // PASO 1: ¿Es saludo inicial?
      if (this.esSaludo(message)) {
        return {
          message: this.responderSaludo(),
          confidence: 1.0,
          intent: 'greeting'
        }
      }

      // PASO 2: Buscar producto
      let producto = await this.buscarProducto(message, userId, memoryKey)

      if (!producto) {
        console.log(`[BOT] ❌ No se encontró producto`)
        return {
          message: this.respuestaProductoNoEncontrado(),
          confidence: 0.8,
          intent: 'product_not_found'
        }
      }

      console.log(`[BOT] ✅ Producto encontrado: ${producto.name}`)

      // PASO 3: Guardar en memoria
      SimpleMemory.set(memoryKey, {
        productoId: producto.id,
        productoNombre: producto.name,
        productoPrecio: producto.price
      })

      // PASO 4: Detectar intención
      const intencion = this.detectarIntencion(message)
      console.log(`[BOT] 🎯 Intención detectada: ${intencion}`)

      // PASO 5: Generar respuesta según intención
      let respuesta: string

      switch (intencion) {
        case 'precio':
          respuesta = this.responderPrecio(producto)
          break

        case 'info':
          respuesta = await this.responderInfo(producto, message)
          break

        case 'pago':
          respuesta = this.responderPago(producto)
          break

        case 'foto':
          respuesta = this.responderFoto(producto)
          break

        default:
          respuesta = await this.respuestaGeneral(producto, message)
      }

      console.log(`[BOT] 💬 Respuesta: "${respuesta.substring(0, 100)}..."`)

      return {
        message: respuesta,
        confidence: 0.95,
        intent: intencion
      }

    } catch (error) {
      console.error('[BOT] ❌ Error:', error)
      return {
        message: 'Disculpa, tuve un problema. ¿Puedes repetir tu pregunta? 🙏',
        confidence: 0.5,
        intent: 'error'
      }
    }
  }

  // ============================================
  // DETECCIÓN DE SALUDOS
  // ============================================
  private static esSaludo(message: string): boolean {
    const msg = message.toLowerCase().trim()
    const saludos = [
      'hola', 'buenos dias', 'buenas tardes', 'buenas noches',
      'buen dia', 'buena tarde', 'buena noche', 'hey', 'holi',
      'saludos', 'que tal', 'como estas'
    ]
    
    // Es saludo si el mensaje es corto y contiene palabra de saludo
    if (msg.length < 30) {
      return saludos.some(s => msg.includes(s))
    }
    
    return false
  }

  private static responderSaludo(): string {
    return `👋 ¡Hola! Bienvenido a Tecnovariedades D&S 😊

Tenemos:
💻 Laptops y computadores
🎹 Curso de Piano Profesional
📚 Megapacks de cursos digitales
🏍️ Moto Bajaj Pulsar

¿Qué producto te interesa?`
  }

  // ============================================
  // BÚSQUEDA DE PRODUCTOS (SIMPLE Y EFECTIVA)
  // ============================================
  private static async buscarProducto(
    message: string,
    userId: string,
    memoryKey: string
  ): Promise<any | null> {
    
    // 1. Verificar si sigue preguntando por el mismo producto
    const memoria = SimpleMemory.get(memoryKey)
    if (memoria && this.siguePreguntandoPorMismo(message)) {
      console.log(`[BUSQUEDA] 💾 Usando producto de memoria: ${memoria.productoNombre}`)
      const producto = await db.product.findUnique({
        where: { id: memoria.productoId }
      })
      if (producto) return producto
    }

    // 2. Extraer keywords del mensaje
    const keywords = this.extraerKeywords(message)
    console.log(`[BUSQUEDA] 🔍 Keywords: ${keywords.join(', ')}`)

    // 3. Buscar por coincidencia exacta primero
    for (const keyword of keywords) {
      const producto = await db.product.findFirst({
        where: {
          userId,
          status: 'AVAILABLE',
          name: {
            contains: keyword,
            mode: 'insensitive'
          }
        }
      })
      
      if (producto) {
        console.log(`[BUSQUEDA] ✅ Encontrado por keyword "${keyword}": ${producto.name}`)
        return producto
      }
    }

    // 4. Buscar en descripción
    for (const keyword of keywords) {
      const producto = await db.product.findFirst({
        where: {
          userId,
          status: 'AVAILABLE',
          description: {
            contains: keyword,
            mode: 'insensitive'
          }
        }
      })
      
      if (producto) {
        console.log(`[BUSQUEDA] ✅ Encontrado en descripción: ${producto.name}`)
        return producto
      }
    }

    // 5. Buscar por categoría general
    const categoria = this.detectarCategoria(message)
    if (categoria) {
      console.log(`[BUSQUEDA] 🏷️ Buscando por categoría: ${categoria}`)
      const producto = await db.product.findFirst({
        where: {
          userId,
          status: 'AVAILABLE',
          category: categoria
        }
      })
      
      if (producto) {
        console.log(`[BUSQUEDA] ✅ Encontrado por categoría: ${producto.name}`)
        return producto
      }
    }

    return null
  }

  // ============================================
  // EXTRACCIÓN DE KEYWORDS
  // ============================================
  private static extraerKeywords(message: string): string[] {
    const msg = message.toLowerCase()
    
    // Palabras clave específicas (alta prioridad)
    const palabrasEspecificas = [
      'piano', 'guitarra', 'bateria', 'violin',
      'laptop', 'computador', 'portatil', 'macbook', 'asus', 'hp', 'lenovo',
      'moto', 'pulsar', 'bajaj', 'yamaha',
      'curso', 'megapack', 'pack',
      'diseño', 'photoshop', 'illustrator',
      'ingles', 'frances', 'aleman', 'italiano',
      'excel', 'word', 'powerpoint'
    ]

    const encontradas = palabrasEspecificas.filter(p => msg.includes(p))
    
    // Si no encuentra palabras específicas, usar palabras del mensaje
    if (encontradas.length === 0) {
      const palabras = msg
        .split(/\s+/)
        .filter(p => p.length > 3)
        .filter(p => !['para', 'como', 'cual', 'donde', 'cuando', 'porque', 'tiene', 'tienes'].includes(p))
      
      return palabras.slice(0, 3) // Máximo 3 palabras
    }

    return encontradas
  }

  // ============================================
  // DETECCIÓN DE CATEGORÍA
  // ============================================
  private static detectarCategoria(message: string): string | null {
    const msg = message.toLowerCase()

    if (msg.match(/laptop|computador|portatil|pc/)) return 'ELECTRONICS'
    if (msg.match(/curso|megapack|pack|digital/)) return 'DIGITAL'
    if (msg.match(/moto|motocicleta|pulsar|bajaj/)) return 'VEHICLES'

    return null
  }

  // ============================================
  // VERIFICAR SI SIGUE PREGUNTANDO POR LO MISMO
  // ============================================
  private static siguePreguntandoPorMismo(message: string): boolean {
    const msg = message.toLowerCase()
    
    // Palabras que indican continuación de conversación
    const continuacion = [
      'cuanto', 'precio', 'cuesta', 'valor',
      'info', 'informacion', 'detalles', 'caracteristicas',
      'comprar', 'pagar', 'link', 'enlace',
      'foto', 'imagen', 'ver',
      'si', 'claro', 'ok', 'dale', 'bueno'
    ]

    return continuacion.some(p => msg.includes(p))
  }

  // ============================================
  // DETECCIÓN DE INTENCIÓN
  // ============================================
  private static detectarIntencion(message: string): string {
    const msg = message.toLowerCase()

    // Orden de prioridad
    if (msg.match(/cuanto|precio|cuesta|valor|vale/)) return 'precio'
    if (msg.match(/comprar|pagar|link|enlace|metodo|como pago/)) return 'pago'
    if (msg.match(/foto|imagen|ver|mostrar|picture/)) return 'foto'
    if (msg.match(/info|informacion|detalles|caracteristicas|especificaciones/)) return 'info'

    return 'general'
  }

  // ============================================
  // RESPUESTAS POR INTENCIÓN
  // ============================================
  
  private static responderPrecio(producto: any): string {
    return `💰 ${producto.name}

Precio: ${this.formatearPrecio(producto.price)} COP

¿Quieres más información o el link de compra? 😊`
  }

  private static async responderInfo(producto: any, message: string): Promise<string> {
    // Usar IA solo para dar información detallada
    const prompt = `Eres vendedor de Tecnovariedades D&S.

PRODUCTO:
${producto.name}
Precio: ${producto.price} COP
${producto.description || ''}

CLIENTE PREGUNTA: "${message}"

RESPONDE:
- Máximo 5 líneas
- Usa emojis
- Destaca beneficios
- Termina preguntando si quiere comprarlo

NO inventes información que no esté arriba.`

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      })

      return completion.choices[0]?.message?.content || this.respuestaInfoFallback(producto)
    } catch (error) {
      console.error('[IA] Error:', error)
      return this.respuestaInfoFallback(producto)
    }
  }

  private static respuestaInfoFallback(producto: any): string {
    return `📦 ${producto.name}

${producto.description || 'Producto de alta calidad'}

💰 Precio: ${this.formatearPrecio(producto.price)} COP

¿Te gustaría comprarlo? 😊`
  }

  private static responderPago(producto: any): string {
    let respuesta = `💳 ${producto.name}\n\n`
    respuesta += `Precio: ${this.formatearPrecio(producto.price)} COP\n\n`
    respuesta += `Métodos de pago:\n`

    // Extraer métodos de pago de tags
    try {
      const tags = producto.tags ? JSON.parse(producto.tags) : []
      
      const hotmart = tags.find((t: string) => t.startsWith('hotmart:'))
      const mercadopago = tags.find((t: string) => t.startsWith('mercadopago:'))
      const paypal = tags.find((t: string) => t.startsWith('paypal:'))
      const nequi = tags.find((t: string) => t.startsWith('nequi:'))

      if (hotmart) {
        const link = hotmart.replace('hotmart:', '')
        respuesta += `\n🔥 Hotmart (pago directo):\n${link}\n`
      }

      if (mercadopago) {
        const link = mercadopago.replace('mercadopago:', '')
        respuesta += `\n💳 Mercado Pago:\n${link}\n`
      }

      if (paypal) {
        const link = paypal.replace('paypal:', '')
        respuesta += `\n🌎 PayPal:\n${link}\n`
      }

      if (nequi) {
        const numero = nequi.replace('nequi:', '')
        respuesta += `\n📱 Nequi/Daviplata:\n${numero}\n`
      }

      // Si no tiene métodos configurados
      if (!hotmart && !mercadopago && !paypal && !nequi) {
        respuesta += `\n📞 WhatsApp: +57 304 274 8687\n`
      }

    } catch (error) {
      respuesta += `\n📞 WhatsApp: +57 304 274 8687\n`
    }

    respuesta += `\n¿Tienes alguna duda? 😊`

    return respuesta
  }

  private static responderFoto(producto: any): string {
    return `📸 ${producto.name}

Te puedo enviar fotos por WhatsApp:
📞 +57 304 274 8687

O puedes ver más información aquí si tengo link disponible.

¿Quieres el link de compra? 😊`
  }

  private static async respuestaGeneral(producto: any, message: string): Promise<string> {
    // Respuesta general usando IA
    const prompt = `Eres vendedor de Tecnovariedades D&S.

PRODUCTO:
${producto.name}
Precio: ${producto.price} COP
${producto.description || ''}

CLIENTE DICE: "${message}"

RESPONDE:
- Máximo 4 líneas
- Usa emojis
- Sé amigable
- Ofrece ayuda

NO inventes información.`

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 250
      })

      return completion.choices[0]?.message?.content || this.respuestaGeneralFallback(producto)
    } catch (error) {
      return this.respuestaGeneralFallback(producto)
    }
  }

  private static respuestaGeneralFallback(producto: any): string {
    return `😊 ${producto.name}

💰 Precio: ${this.formatearPrecio(producto.price)} COP

¿Quieres más información, el precio o el link de compra?`
  }

  // ============================================
  // RESPUESTA CUANDO NO ENCUENTRA PRODUCTO
  // ============================================
  private static respuestaProductoNoEncontrado(): string {
    return `Lo siento, no tengo ese producto disponible 😔

Tengo:
💻 Laptops y computadores
🎹 Curso de Piano Profesional
📚 Megapacks de cursos digitales
🏍️ Moto Bajaj Pulsar

¿Te interesa algo de esto? 😊`
  }

  // ============================================
  // UTILIDADES
  // ============================================
  private static formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO')
  }
}
