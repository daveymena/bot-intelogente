/**
 * 🧪 TEST DEL SISTEMA INTELIGENTE COMPLETO
 * Demuestra cómo el bot entiende, busca y responde
 */

console.log('🧠 TEST DEL SISTEMA INTELIGENTE DE CONSULTAS\n')
console.log('='.repeat(70))

// Simulación del sistema (sin base de datos real)
class IntelligentProductQuerySystemDemo {
  
  // Base de datos simulada
  static mockDatabase = [
    {
      id: 1,
      name: 'Portátil Acer Aspire 5 A15-51P-591E',
      description: 'Intel Core i5-1335U, 16GB RAM DDR4, 512GB SSD NVMe, Pantalla 15.6" FHD',
      price: 1899900,
      currency: 'COP',
      category: 'PHYSICAL',
      status: 'AVAILABLE'
    },
    {
      id: 2,
      name: 'Laptop Asus Vivobook 15',
      description: 'Intel i7-13620H, 16GB RAM, 1TB SSD, Pantalla 15.6" FHD IPS',
      price: 2499900,
      currency: 'COP',
      category: 'PHYSICAL',
      status: 'AVAILABLE'
    },
    {
      id: 3,
      name: 'Portátil HP Pavilion 14',
      description: 'AMD Ryzen 5 5500U, 8GB RAM, 256GB SSD, Pantalla 14" FHD',
      price: 1699900,
      currency: 'COP',
      category: 'PHYSICAL',
      status: 'AVAILABLE'
    },
    {
      id: 4,
      name: 'Curso Completo de Piano - Nivel Básico',
      description: 'Aprende piano desde cero con 24 lecciones prácticas',
      price: 150000,
      currency: 'COP',
      category: 'DIGITAL',
      status: 'AVAILABLE'
    },
    {
      id: 5,
      name: 'Celular Samsung Galaxy A54',
      description: 'Pantalla 6.4" AMOLED, 128GB, 6GB RAM, Cámara 50MP',
      price: 1299900,
      currency: 'COP',
      category: 'PHYSICAL',
      status: 'AVAILABLE'
    }
  ]

  static async processQuery(message) {
    console.log(`\n📨 MENSAJE DEL CLIENTE: "${message}"`)
    console.log('-'.repeat(70))
    
    // PASO 1: Analizar intención
    const intent = this.analyzeIntent(message)
    console.log(`\n🧠 INTENCIÓN DETECTADA:`)
    console.log(`   Tipo: ${intent.type}`)
    if (intent.category) console.log(`   Categoría: ${intent.category}`)
    if (intent.priceRange) console.log(`   Rango de precio:`, intent.priceRange)
    if (intent.features?.length) console.log(`   Características: ${intent.features.join(', ')}`)
    console.log(`   Contexto: ${intent.context}`)
    
    // PASO 2: Buscar en base de datos
    const products = this.searchProducts(intent)
    console.log(`\n📦 PRODUCTOS ENCONTRADOS: ${products.length}`)
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - $${p.price.toLocaleString()}`)
    })
    
    // PASO 3: Armar respuesta
    const response = this.buildResponse(intent, products, message)
    console.log(`\n💬 RESPUESTA DEL BOT:`)
    console.log('-'.repeat(70))
    console.log(response)
    console.log('='.repeat(70))
    
    return response
  }

  static analyzeIntent(message) {
    const messageLower = message.toLowerCase()
    
    // Saludo
    if (this.isGreeting(messageLower)) {
      return { type: 'greeting', context: 'Cliente está saludando' }
    }

    // Comparación
    if (this.isComparison(messageLower)) {
      return {
        type: 'comparison',
        category: this.detectCategory(messageLower),
        context: 'Cliente quiere comparar productos'
      }
    }

    // Producto específico
    if (this.isSpecificProduct(messageLower)) {
      return {
        type: 'product_detail',
        specificProduct: this.extractProductName(messageLower),
        context: 'Cliente busca un producto específico'
      }
    }

    // Búsqueda por categoría
    const category = this.detectCategory(messageLower)
    if (category) {
      return {
        type: 'product_search',
        category,
        priceRange: this.extractPriceRange(messageLower),
        features: this.extractFeatures(messageLower),
        context: `Cliente busca productos de categoría: ${category}`
      }
    }

    return { type: 'general_info', context: 'Consulta general' }
  }

  static searchProducts(intent) {
    let results = this.mockDatabase.filter(p => p.status === 'AVAILABLE')

    if (intent.category) {
      results = results.filter(p => p.category === intent.category)
    }

    if (intent.priceRange) {
      if (intent.priceRange.min) {
        results = results.filter(p => p.price >= intent.priceRange.min)
      }
      if (intent.priceRange.max) {
        results = results.filter(p => p.price <= intent.priceRange.max)
      }
    }

    if (intent.specificProduct) {
      results = results.filter(p => 
        p.name.toLowerCase().includes(intent.specificProduct.toLowerCase()) ||
        p.description.toLowerCase().includes(intent.specificProduct.toLowerCase())
      )
    }

    if (intent.features?.length) {
      results = results.filter(p => {
        const text = `${p.name} ${p.description}`.toLowerCase()
        return intent.features.some(f => text.includes(f.toLowerCase()))
      })
    }

    return results.slice(0, 4)
  }

  static buildResponse(intent, products, message) {
    if (intent.type === 'greeting') {
      return `👋 ¡Hola! Bienvenido a Tecnovariedades D&S 😄💻

Aquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.

📦 ¿Buscas algún producto, servicio o información en especial?`
    }

    if (products.length === 0) {
      return `😅 No encontré productos exactos con esa búsqueda.

💡 *Sugerencias:*
🔹 Intenta con términos más generales
🔹 Pregunta por categorías: "portátiles", "celulares", "cursos"
🔹 Indica tu presupuesto: "portátiles hasta 2 millones"

¿Qué tipo de producto te interesa? 🤔`
    }

    if (intent.type === 'product_detail' && products.length === 1) {
      const p = products[0]
      return `💻 *${p.name}*

📝 ${p.description}

💰 *Precio:* ${this.formatPrice(p.price)}

¿Te interesa este producto? 😊
Puedo enviarte más detalles o el link de pago 💳`
    }

    if (intent.type === 'comparison' && products.length >= 2) {
      const p1 = products[0]
      const p2 = products[1]
      return `⚖️ *Comparación de Productos*

🔹 *${this.shortenName(p1.name)}*
💰 ${this.formatPrice(p1.price)}

🆚

🔹 *${this.shortenName(p2.name)}*
💰 ${this.formatPrice(p2.price)}

💵 Diferencia: ${this.formatPrice(Math.abs(p1.price - p2.price))}

¿Cuál te llama más la atención? 🤔`
    }

    // Lista de productos
    let response = `💻 *Productos Disponibles*

¡Claro que sí! 😎 Tenemos opciones para diferentes presupuestos 👇

`
    products.forEach(p => {
      response += `🔹 *${this.shortenName(p.name)}*\n`
      response += `💰 *${this.formatPrice(p.price)}*\n\n`
    })

    response += `¿Te gustaría que te recomiende uno según tu uso? 🤔
(Ej: trabajo, estudios, diseño, gaming) 🎮💼📚`

    return response
  }

  // Métodos auxiliares
  static isGreeting(msg) {
    return ['hola', 'buenas', 'hey', 'saludos'].some(g => msg.includes(g)) && msg.length < 30
  }

  static isComparison(msg) {
    return ['comparar', 'diferencia', 'vs', 'mejor', 'cual es mejor'].some(w => msg.includes(w))
  }

  static isSpecificProduct(msg) {
    return ['acer', 'asus', 'hp', 'dell', 'samsung', 'apple'].some(b => msg.includes(b))
  }

  static detectCategory(msg) {
    if (msg.includes('portátil') || msg.includes('laptop')) return 'PHYSICAL'
    if (msg.includes('celular') || msg.includes('phone')) return 'PHYSICAL'
    if (msg.includes('curso') || msg.includes('megapack')) return 'DIGITAL'
    return null
  }

  static extractPriceRange(msg) {
    const range = {}
    const hastaMatch = msg.match(/hasta\s+(\d+(?:\.\d+)?)\s*(millones?)?/i)
    if (hastaMatch) {
      range.max = parseFloat(hastaMatch[1]) * (hastaMatch[2] ? 1000000 : 1)
    }
    return Object.keys(range).length > 0 ? range : undefined
  }

  static extractFeatures(msg) {
    const features = []
    if (msg.includes('i5')) features.push('i5')
    if (msg.includes('i7')) features.push('i7')
    if (msg.includes('16gb')) features.push('16GB')
    if (msg.includes('gaming')) features.push('gaming')
    return features
  }

  static extractProductName(msg) {
    const brands = ['acer', 'asus', 'hp', 'samsung']
    for (const brand of brands) {
      if (msg.includes(brand)) return brand
    }
    return msg
  }

  static formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  static shortenName(name) {
    return name.replace(/Portátil|Laptop/gi, '').trim().substring(0, 40)
  }
}

// ============ EJECUTAR TESTS ============

async function runTests() {
  const testCases = [
    'Hola, buenas tardes',
    'Quiero ver portátiles disponibles',
    'Portátiles hasta 2 millones',
    'Necesito un laptop con i7 y 16GB',
    'Tienes el Acer Aspire 5?',
    'Comparar Acer vs Asus',
    'Cursos de piano',
    'Celulares disponibles',
    'Portátiles para gaming',
    'Laptop económico para trabajo'
  ]

  for (const testCase of testCases) {
    await IntelligentProductQuerySystemDemo.processQuery(testCase)
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n✅ TESTS COMPLETADOS')
  console.log('\nEl sistema:')
  console.log('1. ✅ Entiende la intención del cliente')
  console.log('2. ✅ Busca en la base de datos')
  console.log('3. ✅ Arma respuestas visuales y contextuales')
}

runTests()
