/**
 * ARQUITECTURA PROFESIONAL DE BOT DE VENTAS
 * 
 * Basado en mejores prácticas:
 * 1. Memoria estructurada (no historial de chat)
 * 2. RAG para catálogo (no IA como base de datos)
 * 3. Estados de venta (no respuestas sueltas)
 * 4. Contexto inteligente (no prompts gigantes)
 * 5. Control de flujo (no IA decide todo)
 */

import { db } from './db'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

// ============================================
// 1. MEMORIA ESTRUCTURADA POR USUARIO
// ============================================
interface CustomerMemory {
  telefono: string
  nombre?: string
  interes?: string
  producto_actual?: {
    id: string
    nombre: string
    precio: number
  }
  etapa_venta: 'saludo' | 'explorando' | 'interesado' | 'objecion' | 'cierre' | 'postventa'
  objecion?: string
  ultima_intencion?: string
  historial_productos: string[]
  timestamp: number
}

class MemoryManager {
  private static memory = new Map<string, CustomerMemory>()

  static get(telefono: string): CustomerMemory | null {
    const mem = this.memory.get(telefono)
    if (!mem) return null

    // Limpiar memoria después de 2 horas
    const age = Date.now() - mem.timestamp
    if (age > 2 * 60 * 60 * 1000) {
      this.memory.delete(telefono)
      return null
    }

    return mem
  }

  static set(telefono: string, data: Partial<CustomerMemory>) {
    const existing = this.get(telefono) || {
      telefono,
      etapa_venta: 'saludo',
      historial_productos: [],
      timestamp: Date.now()
    }

    this.memory.set(telefono, {
      ...existing,
      ...data,
      timestamp: Date.now()
    })

    console.log(`[MEMORIA] Actualizada para ${telefono}:`, {
      etapa: data.etapa_venta,
      producto: data.producto_actual?.nombre,
      intencion: data.ultima_intencion
    })
  }

  static clear(telefono: string) {
    this.memory.delete(telefono)
  }
}

// ============================================
// 2. RAG - CATÁLOGO ESTRUCTURADO
// ============================================
interface ProductCatalog {
  id: string
  nombre: string
  categoria: string
  precio: number
  tipo: 'digital' | 'fisico'
  incluye?: string[]
  entrega: string
  keywords: string[]
  metodos_pago: string[]
}

class CatalogRAG {
  /**
   * Búsqueda semántica simple (sin embeddings por ahora)
   * Busca por keywords y similitud
   */
  static async search(query: string, userId: string): Promise<ProductCatalog | null> {
    const queryLower = query.toLowerCase()
    
    // Extraer keywords de la consulta
    const keywords = this.extractKeywords(queryLower)
    console.log(`[RAG] Keywords extraídos: ${keywords.join(', ')}`)

    // Buscar en base de datos
    const productos = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE'
      }
    })

    // Scoring por relevancia
    const scored = productos.map(p => {
      let score = 0
      const nombreLower = p.name.toLowerCase()
      const descLower = (p.description || '').toLowerCase()

      // CATEGORÍAS ESPECÍFICAS - MÁXIMA PRIORIDAD
      // Si el usuario busca una categoría específica, SOLO mostrar esa categoría
      const categoriasEspecificas = {
        'idiomas': ['idiomas', 'idioma', 'ingles', 'frances', 'aleman', 'portugues', 'italiano', 'chino', 'japones', 'language'],
        'diseño': ['diseño', 'grafico', 'photoshop', 'illustrator', 'corel'],
        'piano': ['piano'],
        'guitarra': ['guitarra'],
        'laptop': ['laptop', 'computador', 'portatil'],
        'moto': ['moto', 'pulsar', 'bajaj', 'yamaha'],
        'album': ['album', 'albumes', 'coleccion']
      }

      // Detectar si el usuario busca una categoría específica
      let categoriaUsuario: string | null = null
      for (const [categoria, palabras] of Object.entries(categoriasEspecificas)) {
        if (palabras.some(p => queryLower.includes(p))) {
          categoriaUsuario = categoria
          break
        }
      }

      // Si hay categoría específica, verificar si el producto pertenece a esa categoría
      if (categoriaUsuario) {
        const palabrasCategoria = categoriasEspecificas[categoriaUsuario]
        const perteneceCategoria = palabrasCategoria.some(p => 
          nombreLower.includes(p) || descLower.includes(p)
        )

        if (perteneceCategoria) {
          score += 100 // MÁXIMA PRIORIDAD para productos de la categoría correcta
        } else {
          score -= 100 // PENALIZACIÓN FUERTE para productos de otra categoría
        }
      }

      // Coincidencia exacta en nombre (prioridad media)
      keywords.forEach(kw => {
        if (nombreLower.includes(kw)) score += 10
        if (descLower.includes(kw)) score += 3
      })

      // Palabras únicas (alta prioridad)
      const uniqueWords = ['piano', 'laptop', 'moto', 'pulsar', 'asus', 'bajaj']
      uniqueWords.forEach(uw => {
        if (queryLower.includes(uw) && nombreLower.includes(uw)) {
          score += 50
        }
      })

      // MEGAPACK + CATEGORÍA
      const isMegapackQuery = queryLower.includes('megapack') || queryLower.includes('mega pack') || queryLower.includes('pack')
      const isMegapackProduct = nombreLower.includes('megapack') || nombreLower.includes('mega pack') || nombreLower.includes('pack')
      
      if (isMegapackQuery && isMegapackProduct) {
        score += 30 // Boost por ser megapack
      }

      // Penalizar si NO es megapack pero el usuario busca megapack
      if (isMegapackQuery && !isMegapackProduct) {
        score -= 20
      }

      return { producto: p, score }
    })

    // Ordenar por score
    scored.sort((a, b) => b.score - a.score)

    // Mostrar top 3 productos con sus scores (para debugging)
    console.log(`[RAG] 📊 Top 3 productos:`)
    scored.slice(0, 3).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.producto.name} - Score: ${item.score}`)
    })

    if (scored.length === 0 || scored[0].score <= 0) {
      console.log(`[RAG] ❌ No se encontró producto relevante (score máximo: ${scored[0]?.score || 0})`)
      return null
    }

    const best = scored[0].producto
    console.log(`[RAG] ✅ Producto encontrado: ${best.name} (score: ${scored[0].score})`)

    // Convertir a formato de catálogo
    return this.toProductCatalog(best)
  }

  private static extractKeywords(query: string): string[] {
    // Palabras clave importantes (AMPLIADO CON IDIOMAS)
    const important = [
      // Instrumentos musicales
      'piano', 'guitarra', 'bateria', 'violin',
      // Computadores
      'laptop', 'computador', 'portatil', 'macbook', 'asus', 'hp', 'lenovo',
      // Motos
      'moto', 'pulsar', 'bajaj', 'yamaha',
      // Productos digitales
      'curso', 'megapack', 'pack', 'mega',
      // Diseño
      'diseño', 'photoshop', 'illustrator', 'grafico',
      // Idiomas (AGREGADO)
      'idiomas', 'idioma', 'lenguaje', 'language', 'ingles', 'frances', 'aleman', 'portugues', 'italiano', 'chino', 'japones',
      // Álbumes y colecciones
      'album', 'albumes', 'coleccion'
    ]

    const found = important.filter(w => query.includes(w))
    
    // Si no encuentra palabras importantes, usar palabras del query
    if (found.length === 0) {
      return query
        .split(/\s+/)
        .filter(w => w.length > 3)
        .filter(w => !['para', 'como', 'cual', 'donde', 'tiene', 'tienes', 'interesa'].includes(w))
        .slice(0, 3)
    }

    return found
  }

  private static toProductCatalog(product: any): ProductCatalog {
    // Extraer métodos de pago de tags
    let metodos_pago: string[] = []
    try {
      const tags = product.tags ? JSON.parse(product.tags) : []
      if (tags.some((t: string) => t.startsWith('hotmart:'))) metodos_pago.push('hotmart')
      if (tags.some((t: string) => t.startsWith('mercadopago:'))) metodos_pago.push('mercadopago')
      if (tags.some((t: string) => t.startsWith('paypal:'))) metodos_pago.push('paypal')
      if (tags.some((t: string) => t.startsWith('nequi:'))) metodos_pago.push('nequi')
    } catch (e) {
      metodos_pago = ['whatsapp']
    }

    return {
      id: product.id,
      nombre: product.name,
      categoria: product.category || 'GENERAL',
      precio: product.price,
      tipo: product.category === 'DIGITAL' ? 'digital' : 'fisico',
      incluye: product.description ? [product.description] : [],
      entrega: product.category === 'DIGITAL' ? 'inmediata' : 'coordinada',
      keywords: [],
      metodos_pago
    }
  }
}

// ============================================
// 3. DETECTOR DE INTENCIÓN
// ============================================
type Intencion = 'saludo' | 'buscar_producto' | 'precio' | 'info' | 'pago' | 'foto' | 'objecion' | 'general'

class IntentDetector {
  static detect(message: string, memoria: CustomerMemory | null): Intencion {
    const msg = message.toLowerCase()

    // Si es primera interacción
    if (!memoria || memoria.etapa_venta === 'saludo') {
      if (this.isSaludo(msg)) return 'saludo'
    }

    // Intenciones específicas (orden de prioridad)
    if (msg.match(/cuanto|precio|cuesta|valor|vale/)) return 'precio'
    if (msg.match(/comprar|pagar|link|enlace|metodo|como pago|dame el link/)) return 'pago'
    if (msg.match(/foto|imagen|ver|mostrar/)) return 'foto'
    if (msg.match(/info|informacion|detalles|caracteristicas/)) return 'info'
    if (msg.match(/caro|costoso|mucho|no tengo|no puedo/)) return 'objecion'

    // Detectar si está buscando un producto NUEVO (palabras clave de búsqueda)
    if (msg.match(/tienes|tiene|hay|vende|vendes|busco|quiero|necesito|me interesa/)) {
      return 'buscar_producto'
    }

    // Detectar si menciona categorías de productos (buscar nuevo)
    if (msg.match(/laptop|computador|portatil|moto|curso|megapack|pack|diseño|idioma|ingles|frances/)) {
      return 'buscar_producto'
    }

    // Si ya tiene producto en memoria y sigue preguntando
    if (memoria?.producto_actual) {
      return 'general'
    }

    // Por defecto, buscar producto
    return 'buscar_producto'
  }

  private static isSaludo(msg: string): boolean {
    const saludos = ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'holi']
    return msg.length < 30 && saludos.some(s => msg.includes(s))
  }
}

// ============================================
// 4. MÁQUINA DE ESTADOS DE VENTA
// ============================================
class SalesStateMachine {
  /**
   * Determina la siguiente etapa según intención y contexto
   */
  static nextState(
    currentState: CustomerMemory['etapa_venta'],
    intencion: Intencion,
    hasProduct: boolean
  ): CustomerMemory['etapa_venta'] {
    
    // Flujo de estados
    switch (currentState) {
      case 'saludo':
        if (intencion === 'buscar_producto') return 'explorando'
        return 'saludo'

      case 'explorando':
        if (hasProduct) return 'interesado'
        return 'explorando'

      case 'interesado':
        if (intencion === 'objecion') return 'objecion'
        if (intencion === 'pago') return 'cierre'
        return 'interesado'

      case 'objecion':
        if (intencion === 'pago') return 'cierre'
        return 'objecion'

      case 'cierre':
        return 'postventa'

      case 'postventa':
        return 'postventa'

      default:
        return 'saludo'
    }
  }

  /**
   * Genera respuesta según estado
   */
  static getStatePrompt(state: CustomerMemory['etapa_venta']): string {
    const prompts = {
      saludo: 'Presenta opciones de productos de forma amigable',
      explorando: 'Haz preguntas para entender necesidades',
      interesado: 'Muestra beneficios y características clave',
      objecion: 'Responde objeciones con empatía y alternativas',
      cierre: 'Facilita el proceso de pago',
      postventa: 'Agradece y ofrece soporte'
    }

    return prompts[state]
  }
}

// ============================================
// 5. MOTOR PRINCIPAL - ORQUESTADOR
// ============================================
export class ProfessionalBotArchitecture {
  
  static async processMessage(
    userId: string,
    customerPhone: string,
    message: string
  ): Promise<{ message: string; confidence: number; intent: string }> {
    try {
      console.log(`\n[BOT PRO] ========================================`)
      console.log(`[BOT PRO] Cliente: ${customerPhone}`)
      console.log(`[BOT PRO] Mensaje: "${message}"`)

      // PASO 1: Cargar memoria del cliente
      let memoria = MemoryManager.get(customerPhone)
      console.log(`[BOT PRO] Memoria: ${memoria ? memoria.etapa_venta : 'nueva'}`)

      // PASO 2: Detectar intención
      const intencion = IntentDetector.detect(message, memoria)
      console.log(`[BOT PRO] Intención: ${intencion}`)

      // PASO 3: Buscar producto (si es necesario)
      let producto: ProductCatalog | null = null

      // Si ya tiene producto en memoria y NO está buscando uno nuevo, usar el de memoria
      if (memoria?.producto_actual && intencion !== 'buscar_producto') {
        console.log(`[BOT PRO] ✅ Usando producto de memoria: ${memoria.producto_actual.nombre}`)
        
        // Intentar obtener producto completo de BD
        try {
          const productoDB = await db.product.findUnique({
            where: { id: memoria.producto_actual.id }
          })
          
          if (productoDB) {
            producto = this.toProductCatalog(productoDB)
            console.log(`[BOT PRO] ✅ Producto completo obtenido de BD`)
          } else {
            // Fallback a datos de memoria (suficiente para respuestas básicas)
            console.log(`[BOT PRO] ⚠️ Producto no en BD, usando datos de memoria`)
            producto = {
              id: memoria.producto_actual.id,
              nombre: memoria.producto_actual.nombre,
              precio: memoria.producto_actual.precio,
              categoria: 'GENERAL',
              tipo: 'digital',
              entrega: 'inmediata',
              keywords: [],
              metodos_pago: ['whatsapp']
            }
          }
        } catch (error) {
          console.error(`[BOT PRO] ❌ Error obteniendo producto de BD:`, error)
          // Fallback a datos de memoria
          producto = {
            id: memoria.producto_actual.id,
            nombre: memoria.producto_actual.nombre,
            precio: memoria.producto_actual.precio,
            categoria: 'GENERAL',
            tipo: 'digital',
            entrega: 'inmediata',
            keywords: [],
            metodos_pago: ['whatsapp']
          }
        }
      } else {
        // Buscar nuevo producto
        console.log(`[BOT PRO] 🔍 Buscando producto: "${message}"`)
        producto = await CatalogRAG.search(message, userId)
        
        if (producto) {
          console.log(`[BOT PRO] ✅ Producto encontrado: ${producto.nombre}`)
          // Guardar en memoria
          MemoryManager.set(customerPhone, {
            producto_actual: {
              id: producto.id,
              nombre: producto.nombre,
              precio: producto.precio
            },
            historial_productos: [
              ...(memoria?.historial_productos || []),
              producto.id
            ]
          })
        } else {
          console.log(`[BOT PRO] ❌ No se encontró producto`)
        }
      }

      // PASO 4: Actualizar estado de venta
      const newState = SalesStateMachine.nextState(
        memoria?.etapa_venta || 'saludo',
        intencion,
        !!producto
      )

      MemoryManager.set(customerPhone, {
        etapa_venta: newState,
        ultima_intencion: intencion
      })

      console.log(`[BOT PRO] Estado: ${memoria?.etapa_venta || 'saludo'} → ${newState}`)

      // PASO 5: Generar respuesta
      const respuesta = await this.generateResponse(
        message,
        intencion,
        newState,
        producto,
        memoria
      )

      console.log(`[BOT PRO] Respuesta generada`)
      console.log(`[BOT PRO] ========================================\n`)

      return {
        message: respuesta,
        confidence: 0.95,
        intent: intencion
      }

    } catch (error) {
      console.error('[BOT PRO] ❌ Error:', error)
      return {
        message: 'Disculpa, tuve un problema. ¿Puedes repetir? 🙏',
        confidence: 0.5,
        intent: 'error'
      }
    }
  }

  /**
   * Genera respuesta usando INFORMACIÓN REAL (sin IA conversacional)
   */
  private static async generateResponse(
    message: string,
    intencion: Intencion,
    estado: CustomerMemory['etapa_venta'],
    producto: ProductCatalog | null,
    memoria: CustomerMemory | null
  ): Promise<string> {

    // Respuestas directas (sin IA) para casos simples
    if (intencion === 'saludo' && !memoria) {
      return this.respuestaSaludo()
    }

    if (!producto) {
      return this.respuestaProductoNoEncontrado()
    }

    // TODAS LAS RESPUESTAS SON DIRECTAS CON INFORMACIÓN REAL
    switch (intencion) {
      case 'precio':
        return this.respuestaPrecio(producto)
      
      case 'pago':
        return await this.respuestaPago(producto)
      
      case 'info':
        return await this.respuestaInfo(producto)
      
      case 'foto':
        return this.respuestaFoto(producto)
      
      case 'buscar_producto':
        return await this.respuestaProductoEncontrado(producto)
      
      case 'general':
        return await this.respuestaGeneral(producto, message)
      
      default:
        return await this.respuestaProductoEncontrado(producto)
    }
  }



  // ============================================
  // RESPUESTAS DIRECTAS CON INFORMACIÓN REAL
  // ============================================

  private static respuestaSaludo(): string {
    return `👋 ¡Hola! Bienvenido a Tecnovariedades D&S 😊

Tenemos:
💻 Laptops y computadores
🎹 Curso de Piano Profesional
📚 Megapacks de cursos digitales
🏍️ Moto Bajaj Pulsar

¿Qué te interesa?`
  }

  private static respuestaProductoNoEncontrado(): string {
    return `Lo siento, no tengo ese producto disponible 😔

¿Te interesa alguno de estos?
💻 Laptops
🎹 Cursos
📚 Megapacks
🏍️ Motos`
  }

  /**
   * Respuesta cuando encuentra un producto (INFORMACIÓN REAL)
   */
  private static async respuestaProductoEncontrado(producto: ProductCatalog): Promise<string> {
    // Obtener producto completo de BD para información detallada
    const productoDB = await db.product.findUnique({
      where: { id: producto.id }
    })

    if (!productoDB) {
      return this.respuestaPrecio(producto)
    }

    let respuesta = `✅ *${productoDB.name}*\n\n`
    
    // Precio
    respuesta += `💰 *Precio:* ${productoDB.price.toLocaleString('es-CO')} COP\n\n`
    
    // Descripción real
    if (productoDB.description) {
      respuesta += `📝 *Descripción:*\n${productoDB.description}\n\n`
    }
    
    // Categoría
    respuesta += `📦 *Categoría:* ${productoDB.category}\n`
    
    // Tipo de entrega
    if (productoDB.category === 'DIGITAL') {
      respuesta += `⚡ *Entrega:* Inmediata (producto digital)\n`
    } else {
      respuesta += `🚚 *Entrega:* A coordinar\n`
    }
    
    // Stock
    if (productoDB.stock !== null && productoDB.stock !== undefined) {
      if (productoDB.stock > 0) {
        respuesta += `✅ *Disponibilidad:* En stock (${productoDB.stock} unidades)\n`
      } else {
        respuesta += `⚠️ *Disponibilidad:* Consultar disponibilidad\n`
      }
    }
    
    respuesta += `\n¿Quieres el link de compra? 😊`
    
    return respuesta
  }

  /**
   * Respuesta de precio (INFORMACIÓN REAL)
   */
  private static respuestaPrecio(producto: ProductCatalog): string {
    return `💰 *${producto.nombre}*

*Precio:* ${producto.precio.toLocaleString('es-CO')} COP

¿Quieres más información o el link de compra? 😊`
  }

  /**
   * Respuesta de información detallada (INFORMACIÓN REAL)
   */
  private static async respuestaInfo(producto: ProductCatalog): Promise<string> {
    // Obtener producto completo de BD
    const productoDB = await db.product.findUnique({
      where: { id: producto.id }
    })

    if (!productoDB) {
      return this.respuestaPrecio(producto)
    }

    let respuesta = `📋 *INFORMACIÓN COMPLETA*\n\n`
    respuesta += `*${productoDB.name}*\n\n`
    
    // Precio
    respuesta += `💰 *Precio:* ${productoDB.price.toLocaleString('es-CO')} COP\n\n`
    
    // Descripción completa
    if (productoDB.description) {
      respuesta += `📝 *Descripción:*\n${productoDB.description}\n\n`
    }
    
    // Detalles técnicos
    respuesta += `📦 *Categoría:* ${productoDB.category}\n`
    
    if (productoDB.category === 'DIGITAL') {
      respuesta += `⚡ *Tipo:* Producto digital\n`
      respuesta += `📥 *Entrega:* Inmediata por email/WhatsApp\n`
    } else {
      respuesta += `📦 *Tipo:* Producto físico\n`
      respuesta += `🚚 *Entrega:* A coordinar\n`
    }
    
    // Stock
    if (productoDB.stock !== null && productoDB.stock !== undefined) {
      if (productoDB.stock > 0) {
        respuesta += `✅ *Stock:* ${productoDB.stock} unidades disponibles\n`
      } else {
        respuesta += `⚠️ *Stock:* Consultar disponibilidad\n`
      }
    }
    
    respuesta += `\n¿Quieres comprarlo? Te envío el link de pago 😊`
    
    return respuesta
  }

  /**
   * Respuesta para solicitud de foto
   */
  private static respuestaFoto(producto: ProductCatalog): string {
    return `📸 Te envío la foto de *${producto.nombre}* ahora mismo...`
  }

  /**
   * Respuesta general (usa información real, no conversacional)
   */
  private static async respuestaGeneral(producto: ProductCatalog, message: string): Promise<string> {
    // Para preguntas generales, mostrar información básica del producto
    const productoDB = await db.product.findUnique({
      where: { id: producto.id }
    })

    if (!productoDB) {
      return this.respuestaPrecio(producto)
    }

    let respuesta = `📦 *${productoDB.name}*\n\n`
    respuesta += `💰 ${productoDB.price.toLocaleString('es-CO')} COP\n\n`
    
    if (productoDB.description) {
      // Mostrar primeras 200 caracteres de descripción
      const desc = productoDB.description.substring(0, 200)
      respuesta += `${desc}${productoDB.description.length > 200 ? '...' : ''}\n\n`
    }
    
    respuesta += `¿Quieres más información o el link de compra? 😊`
    
    return respuesta
  }

  private static async respuestaPago(producto: ProductCatalog): Promise<string> {
    // Obtener producto completo de BD para links
    const productoDB = await db.product.findUnique({
      where: { id: producto.id }
    })

    if (!productoDB) {
      return `📞 Para comprar ${producto.nombre}, contáctanos:
WhatsApp: +57 304 274 8687`
    }

    let respuesta = `💳 ${producto.nombre}\n\n`
    respuesta += `Precio: ${producto.precio.toLocaleString('es-CO')} COP\n\n`
    respuesta += `Métodos de pago:\n`

    // Extraer links de tags
    try {
      const tags = productoDB.tags ? JSON.parse(productoDB.tags) : []
      
      const hotmart = tags.find((t: string) => t.startsWith('hotmart:'))
      const mercadopago = tags.find((t: string) => t.startsWith('mercadopago:'))
      const nequi = tags.find((t: string) => t.startsWith('nequi:'))

      if (hotmart) {
        respuesta += `\n🔥 Hotmart:\n${hotmart.replace('hotmart:', '')}\n`
      }
      if (mercadopago) {
        respuesta += `\n💳 Mercado Pago:\n${mercadopago.replace('mercadopago:', '')}\n`
      }
      if (nequi) {
        respuesta += `\n📱 Nequi:\n${nequi.replace('nequi:', '')}\n`
      }

      if (!hotmart && !mercadopago && !nequi) {
        respuesta += `\n📞 WhatsApp: +57 304 274 8687\n`
      }
    } catch (e) {
      respuesta += `\n📞 WhatsApp: +57 304 274 8687\n`
    }

    return respuesta
  }



  /**
   * Convertir producto de BD a formato de catálogo
   */
  private static toProductCatalog(product: any): ProductCatalog {
    // Extraer métodos de pago de tags
    let metodos_pago: string[] = []
    try {
      const tags = product.tags ? JSON.parse(product.tags) : []
      if (tags.some((t: string) => t.startsWith('hotmart:'))) metodos_pago.push('hotmart')
      if (tags.some((t: string) => t.startsWith('mercadopago:'))) metodos_pago.push('mercadopago')
      if (tags.some((t: string) => t.startsWith('paypal:'))) metodos_pago.push('paypal')
      if (tags.some((t: string) => t.startsWith('nequi:'))) metodos_pago.push('nequi')
    } catch (e) {
      metodos_pago = ['whatsapp']
    }

    return {
      id: product.id,
      nombre: product.name,
      categoria: product.category || 'GENERAL',
      precio: product.price,
      tipo: product.category === 'DIGITAL' ? 'digital' : 'fisico',
      incluye: product.description ? [product.description] : [],
      entrega: product.category === 'DIGITAL' ? 'inmediata' : 'coordinada',
      keywords: [],
      metodos_pago
    }
  }
}

// ============================================
// EXPORTAR PARA USO EXTERNO
// ============================================
export { MemoryManager }
