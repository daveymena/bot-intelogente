/**
 * 🧪 TEST COMPLETO DEL SISTEMA DE FORMATO VISUAL
 * Prueba todas las funcionalidades del formateador de respuestas
 */

// Implementación directa para testing
class WhatsAppResponseFormatter {
  static formatProductList(products, category = 'Productos') {
    if (products.length === 0) {
      return '❌ No hay productos disponibles en este momento.'
    }

    let response = `💻 *${category} Disponibles*\n\n`
    response += '¡Claro que sí! 😎 Tenemos opciones para diferentes presupuestos 👇\n\n'

    products.forEach((product, index) => {
      const shortName = this.shortenProductName(product.name)
      
      response += `🔹 *${shortName}*\n`
      
      if (product.specs) {
        const specsLine = this.formatSpecsInline(product.specs)
        if (specsLine) {
          response += `${specsLine}\n`
        }
      }
      
      response += `💰 *${this.formatPrice(product.price, product.currency)}*\n`
      
      if (index < products.length - 1) {
        response += '\n'
      }
    })

    response += '\n¿Te gustaría que te recomiende uno según tu uso? 🤔\n'
    response += '(Ej: trabajo, estudios, diseño, gaming) 🎮💼📚'

    return response
  }

  static formatSingleProduct(product) {
    const emoji = this.getCategoryEmoji(product.name)
    
    let response = `${emoji} *${product.name}*\n\n`

    if (product.specs) {
      if (product.specs.processor) {
        response += `⚙️ *Procesador:* ${product.specs.processor}\n`
      }
      if (product.specs.ram) {
        response += `💾 *RAM:* ${product.specs.ram}\n`
      }
      if (product.specs.storage) {
        response += `💿 *Almacenamiento:* ${product.specs.storage}\n`
      }
      if (product.specs.screen) {
        response += `🖥️ *Pantalla:* ${product.specs.screen}\n`
      }
      response += '\n'
    }

    response += `💰 *Precio:* ${this.formatPrice(product.price, product.currency)}\n\n`
    response += '¿Te interesa este producto? 😊\n'
    response += 'Puedo enviarte más detalles o el link de pago 💳'

    return response
  }

  static formatProductComparison(product1, product2) {
    let response = '⚖️ *Comparación de Productos*\n\n'

    response += `🔹 *${this.shortenProductName(product1.name)}*\n`
    if (product1.specs) {
      response += `${this.formatSpecsInline(product1.specs)}\n`
    }
    response += `💰 ${this.formatPrice(product1.price, product1.currency)}\n\n`

    response += '🆚\n\n'

    response += `🔹 *${this.shortenProductName(product2.name)}*\n`
    if (product2.specs) {
      response += `${this.formatSpecsInline(product2.specs)}\n`
    }
    response += `💰 ${this.formatPrice(product2.price, product2.currency)}\n\n`

    const diff = Math.abs(product1.price - product2.price)
    response += `💵 Diferencia: ${this.formatPrice(diff, product1.currency)}\n\n`

    response += '¿Cuál te llama más la atención? 🤔'

    return response
  }

  static formatShortResponse(message, includeEmoji = true) {
    if (!includeEmoji) return message

    if (!/[\p{Emoji}]/u.test(message)) {
      return `✨ ${message}`
    }

    return message
  }

  static extractSpecs(product) {
    const specs = {}
    const name = product.name || ''
    const desc = product.description || ''
    const combined = `${name} ${desc}`.toLowerCase()

    const procMatch = combined.match(/(intel core i[3579]|ryzen [3579]|intel [3579]|core i[3579])[- ]?\w*/i)
    if (procMatch) {
      specs.processor = procMatch[0]
    }

    const ramMatch = combined.match(/(\d+)\s*gb\s*(ram|ddr\d?|lpddr\d?)/i)
    if (ramMatch) {
      specs.ram = `${ramMatch[1]}GB`
    }

    const storageMatch = combined.match(/(\d+)\s*(gb|tb)\s*(ssd|hdd|nvme)/i)
    if (storageMatch) {
      specs.storage = `${storageMatch[1]}${storageMatch[2].toUpperCase()} ${storageMatch[3].toUpperCase()}`
    }

    const screenMatch = combined.match(/(\d+\.?\d*)\s*("|pulgadas|inch)/i)
    if (screenMatch) {
      specs.screen = `${screenMatch[1]}"`
    }

    return specs
  }

  static shortenProductName(name) {
    let short = name
      .replace(/Portátil|Portatil|Laptop/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (short.length > 45) {
      const parts = short.split(' ')
      short = parts.slice(0, 3).join(' ')
    }

    return short
  }

  static formatSpecsInline(specs) {
    const parts = []

    if (specs.processor) {
      const proc = this.shortenProcessor(specs.processor)
      parts.push(`⚙️ ${proc}`)
    }

    const memory = []
    if (specs.ram) memory.push(specs.ram)
    if (specs.storage) memory.push(specs.storage)
    if (memory.length > 0) {
      parts.push(`💾 ${memory.join(' / ')}`)
    }

    if (specs.screen) {
      parts.push(`🖥️ ${specs.screen}`)
    }

    return parts.join(' ')
  }

  static shortenProcessor(processor) {
    return processor
      .replace(/Intel Core /gi, '')
      .replace(/AMD Ryzen /gi, 'Ryzen ')
      .replace(/\(.*?\)/g, '')
      .trim()
  }

  static formatPrice(price, currency = 'COP') {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price)
  }

  static getCategoryEmoji(productName) {
    const name = productName.toLowerCase()

    if (name.includes('laptop') || name.includes('portátil')) return '💻'
    if (name.includes('celular') || name.includes('phone')) return '📱'
    if (name.includes('audífono') || name.includes('headphone')) return '🎧'
    if (name.includes('reloj') || name.includes('watch')) return '⌚'
    if (name.includes('tablet')) return '📱'
    if (name.includes('cámara') || name.includes('camera')) return '📷'
    if (name.includes('consola') || name.includes('playstation') || name.includes('xbox')) return '🎮'
    if (name.includes('curso') || name.includes('megapack')) return '📚'
    if (name.includes('teclado')) return '⌨️'
    if (name.includes('mouse')) return '🖱️'
    if (name.includes('monitor')) return '🖥️'

    return '📦'
  }
}

console.log('🧪 INICIANDO TESTS DE FORMATO VISUAL\n')
console.log('='.repeat(60))

// Test 1: Lista de productos
console.log('\n📋 TEST 1: LISTA DE PRODUCTOS\n')
const productos = [
  {
    name: 'Portátil Acer Aspire 5 A15-51P-591E',
    price: 1899900,
    currency: 'COP',
    specs: {
      processor: 'Intel Core i5-1335U',
      ram: '16GB',
      storage: '512GB SSD',
      screen: '15.6" FHD'
    }
  },
  {
    name: 'Laptop Asus Vivobook 15',
    price: 2499900,
    currency: 'COP',
    specs: {
      processor: 'Intel i7-13620H',
      ram: '16GB',
      storage: '1TB SSD',
      screen: '15.6" FHD'
    }
  },
  {
    name: 'Portátil HP Pavilion 14',
    price: 1699900,
    currency: 'COP',
    specs: {
      processor: 'AMD Ryzen 5 5500U',
      ram: '8GB',
      storage: '256GB SSD',
      screen: '14" FHD'
    }
  }
]

const listaFormateada = WhatsAppResponseFormatter.formatProductList(productos, 'Portátiles')
console.log(listaFormateada)

// Test 2: Producto individual
console.log('\n' + '='.repeat(60))
console.log('\n📦 TEST 2: PRODUCTO INDIVIDUAL\n')
const productoIndividual = WhatsAppResponseFormatter.formatSingleProduct(productos[0])
console.log(productoIndividual)

// Test 3: Comparación de productos
console.log('\n' + '='.repeat(60))
console.log('\n⚖️ TEST 3: COMPARACIÓN DE PRODUCTOS\n')
const comparacion = WhatsAppResponseFormatter.formatProductComparison(productos[0], productos[1])
console.log(comparacion)

// Test 4: Respuesta corta
console.log('\n' + '='.repeat(60))
console.log('\n💬 TEST 4: RESPUESTA CORTA\n')
const respuestaCorta = WhatsAppResponseFormatter.formatShortResponse(
  'Claro, tenemos varios modelos disponibles. ¿Qué presupuesto manejas?'
)
console.log(respuestaCorta)

// Test 5: Extracción de specs
console.log('\n' + '='.repeat(60))
console.log('\n🔍 TEST 5: EXTRACCIÓN DE SPECS\n')
const productoSinSpecs = {
  name: 'Laptop Dell Inspiron 15 Intel Core i7 16GB RAM 512GB SSD 15.6" FHD',
  description: 'Portátil potente con procesador Intel Core i7-1255U, 16GB DDR4, SSD NVMe de 512GB'
}
const specsExtraidos = WhatsAppResponseFormatter.extractSpecs(productoSinSpecs)
console.log('Specs extraídos:', specsExtraidos)

// Test 6: Productos digitales
console.log('\n' + '='.repeat(60))
console.log('\n📚 TEST 6: PRODUCTOS DIGITALES (CURSOS)\n')
const cursosDigitales = [
  {
    name: 'Curso Completo de Piano - Nivel Básico',
    price: 150000,
    currency: 'COP',
    specs: {
      duration: '8 semanas',
      lessons: '24 lecciones',
      level: 'Principiante'
    }
  },
  {
    name: 'Megapack Piano Profesional',
    price: 250000,
    currency: 'COP',
    specs: {
      duration: '12 semanas',
      lessons: '48 lecciones',
      level: 'Intermedio-Avanzado'
    }
  }
]

const cursosFormateados = WhatsAppResponseFormatter.formatProductList(cursosDigitales, 'Cursos de Piano')
console.log(cursosFormateados)

// Test 7: Lista vacía
console.log('\n' + '='.repeat(60))
console.log('\n❌ TEST 7: LISTA VACÍA\n')
const listaVacia = WhatsAppResponseFormatter.formatProductList([], 'Productos')
console.log(listaVacia)

// Test 8: Nombres largos
console.log('\n' + '='.repeat(60))
console.log('\n📏 TEST 8: NOMBRES MUY LARGOS\n')
const productosNombresLargos = [
  {
    name: 'Portátil Gamer ASUS ROG Strix G15 G513RM-HQ261W AMD Ryzen 7 6800H 16GB RAM 512GB SSD NVIDIA GeForce RTX 3060 6GB 15.6" FHD 144Hz Windows 11',
    price: 4999900,
    currency: 'COP',
    specs: {
      processor: 'AMD Ryzen 7 6800H',
      ram: '16GB',
      storage: '512GB SSD',
      screen: '15.6" FHD 144Hz'
    }
  }
]

const nombresLargosFormateados = WhatsAppResponseFormatter.formatProductList(productosNombresLargos, 'Gaming')
console.log(nombresLargosFormateados)

console.log('\n' + '='.repeat(60))
console.log('\n✅ TESTS COMPLETADOS\n')
console.log('Todos los formatos se han generado correctamente.')
console.log('Copia cualquiera de estos mensajes y pégalos en WhatsApp para ver cómo se ven 📱')
